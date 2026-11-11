import hashlib
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, event, text
from sqlalchemy.orm import relationship
from app.database.session import Base

def compute_audit_hash(prev_hash: Optional[str], row: Any) -> str:
    org = getattr(row, 'organization', None) or "BrandGuard Demo Enterprise"
    content = (
        f"{prev_hash or 'GENESIS'}|"
        f"{getattr(row, 'user_id', '') or ''}|"
        f"{getattr(row, 'action', '') or ''}|"
        f"{getattr(row, 'entity_type', '') or ''}|"
        f"{getattr(row, 'entity_id', '') or ''}|"
        f"{getattr(row, 'details', '') or ''}|"
        f"{getattr(row, 'reason', '') or ''}|"
        f"{getattr(row, 'revision_id', '') or ''}|"
        f"{org}"
    )
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "USER_LOGIN", "CONTENT_SUBMITTED", "AI_REVIEW_RUN", "APPROVAL_GRANTED"
    entity_type = Column(String(100), nullable=True) # "Content", "User", "Guideline", "Approval"
    entity_id = Column(Integer, nullable=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    details = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    revision_id = Column(Integer, nullable=True)
    organization = Column(String(100), default="BrandGuard Demo Enterprise", nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    prev_hash = Column(String(64), nullable=True)
    hash = Column(String(64), nullable=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

@event.listens_for(AuditLog, "before_insert")
def set_audit_hash(mapper, connection, target):
    if not target.organization:
        target.organization = "BrandGuard Demo Enterprise"
    if not target.prev_hash:
        try:
            res = connection.execute(
                text("SELECT hash FROM audit_logs WHERE hash IS NOT NULL ORDER BY id DESC LIMIT 1")
            ).scalar()
            target.prev_hash = res or "GENESIS"
        except Exception:
            target.prev_hash = "GENESIS"
    if not target.hash:
        target.hash = compute_audit_hash(target.prev_hash, target)



