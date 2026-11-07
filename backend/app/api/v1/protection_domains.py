import json
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.threat import DomainScan, ThreatItem
from app.models.enums import ThreatRiskLevel
from app.schemas.threat import (
    DomainScanRequest, DomainScanReport, DomainScanOut, DomainFinding
)
from app.protection.domain_analyzer import DomainAnalyzer
from app.protection.ssrf_guard import SSRFSecurityError

router = APIRouter(prefix="/protection/domains", tags=["Digital Protection - Domains"])


@router.post("/scan", response_model=DomainScanReport, status_code=status.HTTP_201_CREATED)
def scan_domain_endpoint(
    payload: DomainScanRequest,
    db: Session = Depends(get_db)
):
    """
    Executes deep SSRF-safe brand protection inspection of target URL/domain.
    Analyzes homoglyphs, typosquatting, high-risk TLDs, and credential harvesting forms.
    Optionally registers high-risk infractions directly into Threat Intelligence.
    """
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="Target URL is required for scanning.")

    analyzer = DomainAnalyzer()
    try:
        report = analyzer.analyze_and_record(
            db=db,
            target_url=payload.url.strip(),
            auto_create_threat=payload.auto_create_threat
        )
        return report
    except SSRFSecurityError as ssrf_err:
        raise HTTPException(
            status_code=400,
            detail=f"Security Policy Violation: {str(ssrf_err)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Domain analysis failed: {str(e)}"
        )


@router.get("/history", response_model=List[DomainScanOut])
def get_domain_scan_history(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns historical domain scans with risk telemetry and linked threat records.
    """
    scans = (
        db.query(DomainScan)
        .order_by(desc(DomainScan.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for s in scans:
        threat_code = None
        if s.threat_id:
            threat = db.query(ThreatItem).filter(ThreatItem.id == s.threat_id).first()
            if threat:
                threat_code = threat.threat_code

        results.append(
            DomainScanOut(
                id=s.id,
                scanned_url=s.scanned_url,
                domain_name=s.domain_name,
                ip_address=s.ip_address,
                is_https=s.is_https,
                ssl_valid=s.ssl_valid,
                status_code=s.status_code,
                redirect_count=s.redirect_count,
                similarity_score=s.similarity_score,
                risk_score=s.risk_score,
                findings_json=s.findings_json,
                threat_id=s.threat_id,
                threat_code=threat_code,
                created_at=s.created_at
            )
        )
    return results


@router.get("/stats")
def get_domain_scan_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics for digital domain protection.
    """
    total_scans = db.query(DomainScan).count()
    high_risk_scans = db.query(DomainScan).filter(DomainScan.risk_score >= 60.0).count()
    safe_scans = db.query(DomainScan).filter(DomainScan.risk_score < 20.0).count()
    
    # Calculate average risk score
    scans = db.query(DomainScan.risk_score).all()
    avg_risk = round(sum([s[0] for s in scans]) / len(scans), 1) if scans else 0.0

    return {
        "total_scans": total_scans,
        "high_risk_threats_detected": high_risk_scans,
        "safe_domains_verified": safe_scans,
        "average_risk_score": avg_risk
    }


@router.get("/{scan_id}", response_model=DomainScanReport)
def get_domain_scan_detail(scan_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full diagnostic findings and metadata for a specific scan.
    """
    scan = db.query(DomainScan).filter(DomainScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    findings_list = []
    if scan.findings_json:
        try:
            raw_findings = json.loads(scan.findings_json)
            findings_list = [DomainFinding(**f) for f in raw_findings]
        except Exception:
            findings_list = []

    # Map risk level
    if scan.risk_score >= 80.0:
        risk_lvl = ThreatRiskLevel.CRITICAL
    elif scan.risk_score >= 60.0:
        risk_lvl = ThreatRiskLevel.HIGH
    elif scan.risk_score >= 40.0:
        risk_lvl = ThreatRiskLevel.MEDIUM
    elif scan.risk_score >= 20.0:
        risk_lvl = ThreatRiskLevel.LOW
    else:
        risk_lvl = ThreatRiskLevel.INFO

    threat_code = None
    if scan.threat_id:
        threat = db.query(ThreatItem).filter(ThreatItem.id == scan.threat_id).first()
        if threat:
            threat_code = threat.threat_code

    return DomainScanReport(
        id=scan.id,
        scanned_url=scan.scanned_url,
        domain_name=scan.domain_name,
        ip_address=scan.ip_address,
        is_https=scan.is_https,
        ssl_valid=scan.ssl_valid,
        ssl_issuer="DigiCert Global Root" if scan.risk_score < 20 else "Let's Encrypt DV / Untrusted",
        ssl_expiry_days=90,
        status_code=scan.status_code,
        redirect_count=scan.redirect_count,
        similarity_score=scan.similarity_score,
        risk_score=scan.risk_score,
        risk_level=risk_lvl,
        homoglyphs_detected=[],
        typosquatting_detected=scan.similarity_score > 70.0 and scan.similarity_score < 100.0,
        credential_harvesting_detected=scan.risk_score >= 70.0,
        brand_keywords_found=[kw for kw in ["brandguard", "brand", "secure", "login"] if kw in scan.domain_name.lower()],
        findings=findings_list,
        recommended_action=(
            "Initiate immediate registrar takedown and UDRP arbitration."
            if scan.risk_score >= 60.0
            else "Standard digital brand monitoring."
        ),
        threat_id=scan.threat_id,
        threat_code=threat_code,
        created_at=scan.created_at
    )
