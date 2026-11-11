from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

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

    # Relationships
    user = relationship("User", back_populates="audit_logs")

