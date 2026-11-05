from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.enums import ApprovalAction

class CommentCreate(BaseModel):
    comment_text: str

class CommentOut(BaseModel):
    id: int
    content_id: int
    user_id: int
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalDecision(BaseModel):
    action: ApprovalAction
    comments: Optional[str] = None

class ApprovalOut(BaseModel):
    id: int
    content_id: int
    manager_id: int
    manager_name: Optional[str] = None
    action: ApprovalAction
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewerVerificationDecision(BaseModel):
    action: str  # 'verify', 'request_changes'
    comments: Optional[str] = None

class ReviewerAssignmentOut(BaseModel):
    id: int
    content_id: int
    reviewer_id: int
    reviewer_name: Optional[str] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
