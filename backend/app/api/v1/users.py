from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.models.content import Content
from app.models.audit import AuditLog
from app.schemas.user import UserOut, UserUpdate
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    return db.query(User).order_by(User.id.asc()).all()

@router.get("/me/export")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Self-service data export complying with GDPR Art. 20 and DPDP Act.
    Returns complete profile, created contents, audit actions, and export metadata.
    """
    contents = db.query(Content).filter(Content.creator_id == current_user.id).all()
    audits = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).all()

    return {
        "export_metadata": {
            "platform": "BrandGuard AI Enterprise",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "data_principal_id": current_user.id,
            "organization": current_user.organization,
        },
        "user_profile": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
            "organization": current_user.organization,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "is_active": current_user.is_active,
        },
        "submitted_content": [
            {
                "id": c.id,
                "title": c.title,
                "channel": c.channel,
                "target_audience": c.target_audience,
                "status": c.status.value if hasattr(c.status, 'value') else str(c.status),
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in contents
        ],
        "audit_ledger": [
            {
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "details": a.details,
                "timestamp": a.created_at.isoformat() if a.created_at else None,
            }
            for a in audits
        ],
    }

@router.post("/me/delete-request")
def request_account_deletion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Safely initiates self-service account deactivation & deletion workflow.
    Deactivates user access while preserving necessary regulatory audit trails.
    """
    current_user.is_active = False
    
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_SELF_DELETION_REQUESTED",
        entity_type="User",
        entity_id=current_user.id,
        details=f"User {current_user.email} initiated self-service account deactivation and data erasure request."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "deactivated",
        "message": "Your account has been deactivated and an erasure request has been queued in accordance with DPDP Act & GDPR.",
        "user_id": current_user.id,
    }

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_UPDATED",
        entity_type="User",
        entity_id=user.id,
        details=f"Admin updated user {user.email} (Role: {user.role.value})"
    )
    db.add(audit)
    db.commit()

    return user
