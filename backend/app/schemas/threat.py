import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus

class ThreatEvidenceOut(BaseModel):
    id: int
    threat_id: int
    evidence_type: str
    data_payload: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ThreatItemBase(BaseModel):
    category: ThreatCategory
    title: str
    source_url: str
    target_brand: str = "FinNova Financial Technologies"
    risk_level: ThreatRiskLevel
    confidence_score: float = 85.0
    explanation: str
    recommended_action: Optional[str] = None


class ThreatItemCreate(ThreatItemBase):
    pass


class ThreatItemUpdate(BaseModel):
    status: Optional[ThreatStatus] = None
    risk_level: Optional[ThreatRiskLevel] = None
    assigned_to_id: Optional[int] = None
    notes: Optional[str] = None


class ThreatItemOut(ThreatItemBase):
    id: int
    threat_code: str
    status: ThreatStatus
    assigned_to_id: Optional[int] = None
    detected_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    evidence_items: List[ThreatEvidenceOut] = []

    model_config = ConfigDict(from_attributes=True)


class DomainScanRequest(BaseModel):
    url: str
    auto_create_threat: bool = True


class DomainFinding(BaseModel):
    rule_id: str
    category: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    title: str
    description: str
    evidence: str
    recommendation: str


class DomainScanBase(BaseModel):
    scanned_url: str
    domain_name: str
    ip_address: Optional[str] = None
    is_https: bool = True
    ssl_valid: bool = True
    status_code: Optional[int] = 200
    redirect_count: int = 0
    similarity_score: float = 0.0
    risk_score: float = 0.0


class DomainScanOut(DomainScanBase):
    id: int
    findings_json: Optional[str] = None
    threat_id: Optional[int] = None
    threat_code: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class DomainScanReport(DomainScanBase):
    id: Optional[int] = None
    risk_level: ThreatRiskLevel
    ssl_issuer: Optional[str] = None
    ssl_expiry_days: Optional[int] = None
    homoglyphs_detected: List[str] = []
    typosquatting_detected: bool = False
    credential_harvesting_detected: bool = False
    brand_keywords_found: List[str] = []
    findings: List[DomainFinding] = []
    recommended_action: str
    threat_id: Optional[int] = None
    threat_code: Optional[str] = None
    created_at: datetime.datetime


class BrandAssetOut(BaseModel):
    id: int
    asset_name: str
    asset_type: str
    image_path: Optional[str] = None
    perceptual_hash: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class BrandProductOut(BaseModel):
    id: int
    product_name: str
    sku: str
    official_msrp: float
    authorized_distributors: Optional[str] = None
    reference_image_path: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ThreatCategoryCount(BaseModel):
    category: str
    count: int


class ThreatStatusCount(BaseModel):
    status: str
    count: int


class ActivityEvent(BaseModel):
    id: int
    source: str  # Governance or Threat Intel
    action: str
    title: str
    severity: str
    timestamp: str


class UnifiedAnalyticsOut(BaseModel):
    # Governance telemetry
    total_content_reviewed: int
    pending_approvals: int
    brand_compliance_score: float
    approved_content: int
    rejected_content: int
    
    # Digital Protection telemetry
    total_detected_threats: int
    critical_high_threats: int
    threats_investigating: int
    threats_resolved: int
    new_threats: int
    
    # Distributions & Feeds
    threat_category_breakdown: List[ThreatCategoryCount]
    threat_status_breakdown: List[ThreatStatusCount]
    compliance_trend: List[Any]
    recent_activities: List[ActivityEvent]
    recent_threats: List[ThreatItemOut]

