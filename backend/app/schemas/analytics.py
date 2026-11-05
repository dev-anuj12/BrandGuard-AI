from typing import List, Dict, Any
from pydantic import BaseModel

class CommonViolationItem(BaseModel):
    category: str
    count: int

class StatusBreakdownItem(BaseModel):
    status: str
    count: int

class SeverityBreakdownItem(BaseModel):
    severity: str
    count: int

class AnalyticsOverview(BaseModel):
    total_content_reviewed: int
    total_violations_detected: int
    ai_suggestions_generated: int
    ai_suggestions_accepted: int
    human_overrides: int
    approved_content: int
    rejected_content: int
    pending_approvals: int
    average_review_score: float
    average_review_time_seconds: float
    common_violations: List[CommonViolationItem]
    status_breakdown: List[StatusBreakdownItem]
    severity_breakdown: List[SeverityBreakdownItem]
    activity_timeline: List[Dict[str, Any]]
