from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.models.enums import FindingCategory, SeverityLevel, SuggestionStatus

class SuggestionAction(BaseModel):
    action: str  # 'accept', 'reject', 'manual'
    custom_text: Optional[str] = None

class FindingOverrideRequest(BaseModel):
    reason: str

class SuggestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    finding_id: int
    original_text: str
    suggested_text: str
    reason: Optional[str] = None
    status: SuggestionStatus
    applied_at: Optional[datetime] = None

class ConfidenceComponentsOut(BaseModel):
    rule_match: float = 0.0
    evidence: float = 0.0
    source_approved: float = 0.0
    ai_confidence: float = 0.0

class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    review_id: int
    category: FindingCategory
    severity: SeverityLevel
    matched_text: str
    explanation: str
    guideline_id: Optional[int] = None
    guideline_reference: Optional[str] = None
    evidence: List[Any] = []
    confidence: float
    confidence_components: Optional[ConfidenceComponentsOut] = None
    grounding_status: str = "GROUNDED"
    grounding_reasons: Optional[str] = ""
    evidence_state: str = "verified"
    suggested_correction: Optional[str] = None
    status: str
    engine_source: str
    suggestions: List[SuggestionOut] = []

class AIReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content_id: int
    revision_id: Optional[int] = None
    overall_score: float
    overall_status: str
    summary: Optional[str] = None
    provider: str
    analysis_mode: str = "rules"
    created_at: datetime
    findings: List[FindingOut] = []
