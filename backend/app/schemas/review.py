from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.enums import FindingCategory, SeverityLevel, SuggestionStatus

class SuggestionAction(BaseModel):
    action: str  # 'accept', 'reject', 'manual'
    custom_text: Optional[str] = None

class SuggestionOut(BaseModel):
    id: int
    finding_id: int
    original_text: str
    suggested_text: str
    reason: Optional[str] = None
    status: SuggestionStatus
    applied_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FindingOut(BaseModel):
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
    suggested_correction: Optional[str] = None
    status: str
    engine_source: str
    suggestions: List[SuggestionOut] = []

    class Config:
        from_attributes = True

class AIReviewOut(BaseModel):
    id: int
    content_id: int
    revision_id: Optional[int] = None
    overall_score: float
    overall_status: str
    summary: Optional[str] = None
    provider: str
    created_at: datetime
    findings: List[FindingOut] = []

    class Config:
        from_attributes = True
