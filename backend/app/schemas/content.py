from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.enums import ContentStatus

class ContentRevisionOut(BaseModel):
    id: int
    version: int
    body: str
    revised_by_id: int
    change_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ContentBase(BaseModel):
    title: str
    original_body: str
    channel: str = "Website/Blog"
    target_audience: str = "Retail Investors"
    organization: Optional[str] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    current_body: Optional[str] = None
    channel: Optional[str] = None
    target_audience: Optional[str] = None
    change_summary: Optional[str] = None

class ContentOut(BaseModel):
    id: int
    title: str
    original_body: str
    current_body: str
    channel: str
    target_audience: str
    status: ContentStatus
    creator_id: int
    organization: str = "FinNova Financial Technologies"
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    revisions_count: int = 0
    latest_score: Optional[float] = None
    latest_review_id: Optional[int] = None

    class Config:
        from_attributes = True

