from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.enums import ContentStatus

class ContentRevisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    version: int
    body: str
    revised_by_id: int
    change_summary: Optional[str] = None
    created_at: datetime

class ContentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    original_body: str = Field(..., min_length=5)
    channel: str = Field(default="Website/Blog", max_length=100)
    target_audience: str = Field(default="Retail Investors", max_length=100)
    organization: Optional[str] = None

    @field_validator("title", "original_body")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Field cannot be empty or pure whitespace.")
        return trimmed

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    current_body: Optional[str] = None
    channel: Optional[str] = None
    target_audience: Optional[str] = None
    change_summary: Optional[str] = None

    @field_validator("title", "current_body", mode="before")
    @classmethod
    def validate_optional_trimmed(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Field cannot be empty or pure whitespace.")
            return trimmed
        return v

class ContentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    original_body: str
    current_body: str
    channel: str
    target_audience: str
    status: ContentStatus
    creator_id: int
    organization: str = "BrandGuard Demo Enterprise"
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    revisions_count: int = 0
    latest_score: Optional[float] = None
    latest_review_id: Optional[int] = None
