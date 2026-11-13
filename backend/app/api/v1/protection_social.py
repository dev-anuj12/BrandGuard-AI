from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.threat import ThreatItem
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus
from app.schemas.threat import ThreatItemOut
from app.protection.social_scanner import SocialMediaScanner

router = APIRouter(prefix="/protection/social", tags=["Digital Protection - Social Media"], dependencies=[Depends(get_current_user)])


class SocialScanRequest(BaseModel):
    platform: str
    handle: str
    display_name: Optional[str] = None
    bio_text: Optional[str] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    is_verified: bool = False
    auto_create_threat: bool = True


@router.post("/scan", status_code=status.HTTP_201_CREATED)
def scan_social_profile(
    payload: SocialScanRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates social media profile for brand impersonation, handle typosquatting,
    fake support qualifiers, and financial scam bio language.
    """
    if not payload.handle or not payload.handle.strip():
        raise HTTPException(status_code=400, detail="Social handle is required.")
    if not payload.platform or not payload.platform.strip():
        raise HTTPException(status_code=400, detail="Social platform is required.")

    scanner = SocialMediaScanner()
    try:
        report = scanner.analyze_and_record(
            db=db,
            platform=payload.platform.strip(),
            handle=payload.handle.strip(),
            display_name=payload.display_name,
            bio_text=payload.bio_text,
            followers_count=payload.followers_count,
            following_count=payload.following_count,
            is_verified=payload.is_verified,
            auto_create_threat=payload.auto_create_threat
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social profile inspection failed: {str(e)}")


@router.get("/threats", response_model=List[ThreatItemOut])
def list_social_impersonation_threats(
    status_filter: Optional[ThreatStatus] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lists all detected social media impersonation threats from intelligence registry.
    """
    query = db.query(ThreatItem).filter(ThreatItem.category == ThreatCategory.SOCIAL_IMPERSONATION)
    if status_filter:
        query = query.filter(ThreatItem.status == status_filter)
    
    return query.order_by(desc(ThreatItem.detected_at)).limit(limit).all()


@router.get("/stats")
def get_social_protection_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate social impersonation statistics.
    """
    social_threats = db.query(ThreatItem).filter(
        ThreatItem.category == ThreatCategory.SOCIAL_IMPERSONATION
    ).all()

    total = len(social_threats)
    critical_high = len([t for t in social_threats if t.risk_level in (ThreatRiskLevel.CRITICAL, ThreatRiskLevel.HIGH)])
    resolved = len([t for t in social_threats if t.status == ThreatStatus.RESOLVED])
    investigating = len([t for t in social_threats if t.status == ThreatStatus.UNDER_INVESTIGATION])

    return {
        "total_social_threats": total,
        "critical_high_threats": critical_high,
        "under_investigation": investigating,
        "takedowns_resolved": resolved
    }
