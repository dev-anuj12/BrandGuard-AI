import datetime
from datetime import timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus

class ThreatItem(Base):
    __tablename__ = "threat_items"

    id = Column(Integer, primary_key=True, index=True)
    threat_code = Column(String(50), unique=True, index=True, nullable=False)
    category = Column(SQLEnum(ThreatCategory), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source_url = Column(Text, nullable=False)
    target_brand = Column(String(100), default="BrandGuard Demo Enterprise")
    organization = Column(String(100), default="BrandGuard Demo Enterprise", nullable=False, index=True)
    risk_level = Column(SQLEnum(ThreatRiskLevel), nullable=False, index=True)
    confidence_score = Column(Float, default=85.0)
    status = Column(SQLEnum(ThreatStatus), default=ThreatStatus.NEW, nullable=False, index=True)
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    detected_at = Column(DateTime, default=lambda: datetime.datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    evidence_items = relationship("ThreatEvidence", back_populates="threat", cascade="all, delete-orphan")
    domain_scans = relationship("DomainScan", back_populates="threat")


class ThreatEvidence(Base):
    __tablename__ = "threat_evidence"

    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threat_items.id"), nullable=False, index=True)
    evidence_type = Column(String(50), nullable=False)  # WHOIS, SSL_CERT, DOM_SNAPSHOT, IMAGE_HASH, SCREENSHOT
    data_payload = Column(Text, nullable=False)  # JSON or structured evidence string
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(timezone.utc))

    threat = relationship("ThreatItem", back_populates="evidence_items")


class DomainScan(Base):
    __tablename__ = "domain_scans"

    id = Column(Integer, primary_key=True, index=True)
    scanned_url = Column(Text, nullable=False)
    domain_name = Column(String(255), index=True, nullable=False)
    ip_address = Column(String(64), nullable=True)
    is_https = Column(Boolean, default=True)
    ssl_valid = Column(Boolean, default=True)
    status_code = Column(Integer, nullable=True)
    redirect_count = Column(Integer, default=0)
    similarity_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    findings_json = Column(Text, nullable=True)
    
    threat_id = Column(Integer, ForeignKey("threat_items.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(timezone.utc), index=True)

    threat = relationship("ThreatItem", back_populates="domain_scans")


class BrandAsset(Base):
    __tablename__ = "brand_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String(100), nullable=False)
    asset_type = Column(String(50), nullable=False)  # Primary Logo, Icon Mark, Watermark, Product Emblem
    image_path = Column(String(255), nullable=True)
    perceptual_hash = Column(String(64), nullable=True)
    organization = Column(String(100), default="BrandGuard Demo Enterprise", nullable=False, index=True)
    category = Column(String(50), default="logo", nullable=False)  # logo, image, typography, packaging
    approval_status = Column(String(30), default="approved", nullable=False)  # approved, pending, rejected
    dimensions = Column(String(50), nullable=True)  # e.g. "800x600"
    file_size_kb = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(timezone.utc))


class BrandProduct(Base):
    __tablename__ = "brand_products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(150), nullable=False)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    official_msrp = Column(Float, nullable=False)
    authorized_distributors = Column(Text, nullable=True)  # JSON array string
    reference_image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(timezone.utc))

