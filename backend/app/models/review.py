from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import SeverityLevel, FindingCategory, SuggestionStatus

class AIReview(Base):
    __tablename__ = "ai_reviews"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    revision_id = Column(Integer, ForeignKey("content_revisions.id"), nullable=True)
    overall_score = Column(Float, default=100.0) # Compliance Score 0-100
    overall_status = Column(String(50), default="Completed") # Completed, Partial, Fallback
    summary = Column(Text, nullable=True)
    provider = Column(String(50), default="Rule + AI Engine")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    content = relationship("Content", back_populates="reviews")
    revision = relationship("ContentRevision", back_populates="reviews")
    findings = relationship("Finding", back_populates="review", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("ai_reviews.id"), nullable=False)
    category = Column(SQLEnum(FindingCategory), nullable=False)
    severity = Column(SQLEnum(SeverityLevel), nullable=False)
    matched_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    guideline_id = Column(Integer, ForeignKey("brand_guidelines.id"), nullable=True)
    guideline_reference = Column(String(255), nullable=True)
    evidence = Column(JSON, default=list) # List of evidence objects / strings
    confidence = Column(Float, default=0.90) # Confidence score between 0.0 and 1.0
    suggested_correction = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Accepted, Rejected, Resolved
    engine_source = Column(String(50), default="Rule Engine") # Rule Engine, LLM Engine, Citation Validator
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    review = relationship("AIReview", back_populates="findings")
    guideline = relationship("BrandGuideline", back_populates="findings")
    suggestions = relationship("Suggestion", back_populates="finding", cascade="all, delete-orphan")

class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=False)
    original_text = Column(Text, nullable=False)
    suggested_text = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(SQLEnum(SuggestionStatus), default=SuggestionStatus.PENDING)
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    finding = relationship("Finding", back_populates="suggestions")
