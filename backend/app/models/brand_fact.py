from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class FactType(str, enum.Enum):
    PRODUCT = "product"
    COMPANY = "company"
    CLAIM = "claim"


class BrandFact(Base):
    __tablename__ = "brand_facts"

    id = Column(Integer, primary_key=True, index=True)
    fact_type = Column(SQLEnum(FactType), default=FactType.COMPANY, nullable=False)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)
    source = Column(String(512), nullable=True)
    organization = Column(String(100), default="BrandGuard Demo Enterprise", nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
