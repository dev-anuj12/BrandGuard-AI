from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import SeverityLevel

class BrandGuideline(Base):
    __tablename__ = "brand_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False) # e.g. "Tone", "Terminology", "Financial Claims", "Legal"
    description = Column(Text, nullable=False)
    rule_type = Column(String(50), default="General") # Deterministic, AI_Analyzed, Fact_Checked
    severity = Column(SQLEnum(SeverityLevel), default=SeverityLevel.MEDIUM)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    facts = relationship("ApprovedFact", back_populates="guideline")
    terminologies = relationship("ApprovedTerminology", back_populates="guideline")
    findings = relationship("Finding", back_populates="guideline")

class ApprovedSource(Base):
    __tablename__ = "approved_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False)
    source_type = Column(String(50), default="Official Site") # Annual Report, Regulatory Filing, Product Doc
    description = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    facts = relationship("ApprovedFact", back_populates="source")

class ApprovedFact(Base):
    __tablename__ = "approved_facts"

    id = Column(Integer, primary_key=True, index=True)
    statement = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    source_id = Column(Integer, ForeignKey("approved_sources.id"), nullable=True)
    guideline_id = Column(Integer, ForeignKey("brand_guidelines.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    source = relationship("ApprovedSource", back_populates="facts")
    guideline = relationship("BrandGuideline", back_populates="facts")

class BannedWord(Base):
    __tablename__ = "banned_words"

    id = Column(Integer, primary_key=True, index=True)
    word_or_phrase = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), default="Compliance") # Financial Promise, Risk, Inappropriate
    severity = Column(SQLEnum(SeverityLevel), default=SeverityLevel.HIGH)
    explanation = Column(Text, nullable=False)
    suggested_replacement = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ApprovedTerminology(Base):
    __tablename__ = "approved_terminology"

    id = Column(Integer, primary_key=True, index=True)
    approved_term = Column(String(255), nullable=False)
    incorrect_term = Column(String(255), nullable=False, index=True)
    context = Column(Text, nullable=True)
    guideline_id = Column(Integer, ForeignKey("brand_guidelines.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    guideline = relationship("BrandGuideline", back_populates="terminologies")
