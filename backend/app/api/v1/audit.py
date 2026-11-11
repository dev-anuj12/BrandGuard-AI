from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.workflow import AuditLogOut
from app.api.deps import require_roles

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("", response_model=List[AuditLogOut], status_code=status.HTTP_200_OK)
@router.get("/", response_model=List[AuditLogOut], status_code=status.HTTP_200_OK)
def get_audit_trail(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Page size limit"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """
    Append-only audit trail query for administrators.
    Enforces multi-tenant organizational isolation and pagination.
    Notice: No update or delete endpoints exist; audit logs are strictly append-only.
    """
    user_org = getattr(current_user, "organization", None)
    query = db.query(AuditLog)

    if user_org:
        query = query.filter(
            (AuditLog.organization == user_org) | (AuditLog.organization == None)
        )

    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    logs = query.order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()

    results: List[AuditLogOut] = []
    for l in logs:
        l_out = AuditLogOut.model_validate(l)
        if l.user:
            l_out.user_email = l.user.email
        results.append(l_out)
    return results
