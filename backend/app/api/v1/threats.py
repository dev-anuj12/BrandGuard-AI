import datetime
from datetime import timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.api.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.threat import ThreatItem, ThreatEvidence
from app.models.audit import AuditLog
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus
from app.schemas.threat import (
    ThreatItemOut,
    ThreatItemCreate,
    ThreatItemUpdate,
    ThreatEvidenceOut
)

router = APIRouter(prefix="/threats", tags=["Threat Intelligence"])


@router.get("/", response_model=List[ThreatItemOut])
def list_threats(
    category: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org),
):
    query = db.query(ThreatItem).filter(ThreatItem.organization == org)

    if category and category != "ALL":
        query = query.filter(ThreatItem.category == category)
    if risk_level and risk_level != "ALL":
        query = query.filter(ThreatItem.risk_level == risk_level)
    if status_filter and status_filter != "ALL":
        query = query.filter(ThreatItem.status == status_filter)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (ThreatItem.title.ilike(s)) |
            (ThreatItem.source_url.ilike(s)) |
            (ThreatItem.threat_code.ilike(s)) |
            (ThreatItem.explanation.ilike(s))
        )

    return query.order_by(desc(ThreatItem.detected_at)).offset(skip).limit(limit).all()


@router.get("/{threat_id}", response_model=ThreatItemOut)
def get_threat_detail(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org),
):
    threat = db.query(ThreatItem).filter(ThreatItem.id == threat_id, ThreatItem.organization == org).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat incident not found")
    return threat


@router.patch("/{threat_id}/status", response_model=ThreatItemOut)
def update_threat_status(
    threat_id: int,
    payload: ThreatItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org),
):
    threat = db.query(ThreatItem).filter(ThreatItem.id == threat_id, ThreatItem.organization == org).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat incident not found")

    old_status = threat.status
    if payload.status:
        threat.status = payload.status
        if payload.status == ThreatStatus.RESOLVED:
            threat.resolved_at = datetime.datetime.now(timezone.utc)

    if payload.risk_level:
        threat.risk_level = payload.risk_level

    if payload.assigned_to_id is not None:
        threat.assigned_to_id = payload.assigned_to_id

    # Add audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="THREAT_STATUS_UPDATED",
        entity_type="ThreatItem",
        entity_id=threat.id,
        previous_state=str(old_status.value) if old_status else None,
        new_state=str(threat.status.value) if threat.status else None,
        details=payload.notes or f"Threat status updated from {old_status} to {threat.status} by {current_user.full_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(threat)
    return threat


@router.post("/", response_model=ThreatItemOut, status_code=status.HTTP_201_CREATED)
def create_threat_incident(
    payload: ThreatItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org),
):
    # Generate unique threat code
    count = db.query(ThreatItem).count() + 1
    year = datetime.datetime.now(timezone.utc).year
    code = f"THR-{year}-{count:03d}"

    threat = ThreatItem(
        threat_code=code,
        category=payload.category,
        title=payload.title,
        source_url=payload.source_url,
        target_brand=payload.target_brand,
        risk_level=payload.risk_level,
        confidence_score=payload.confidence_score,
        status=ThreatStatus.NEW,
        explanation=payload.explanation,
        recommended_action=payload.recommended_action,
        organization=org,
        assigned_to_id=current_user.id
    )
    db.add(threat)
    db.commit()
    db.refresh(threat)

    audit = AuditLog(
        user_id=current_user.id,
        action="THREAT_REPORTED",
        entity_type="ThreatItem",
        entity_id=threat.id,
        details=f"Manual threat incident logged: {threat.threat_code} ({threat.title})"
    )
    db.add(audit)
    db.commit()

    return threat

