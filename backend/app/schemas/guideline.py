from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.enums import SeverityLevel

# Guidelines
class BrandGuidelineBase(BaseModel):
    title: str
    category: str
    description: str
    rule_type: str = "General"
    severity: SeverityLevel = SeverityLevel.MEDIUM
    is_active: bool = True

class BrandGuidelineCreate(BrandGuidelineBase):
    pass

class BrandGuidelineUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    is_active: Optional[bool] = None

class BrandGuidelineOut(BrandGuidelineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

# Approved Sources
class ApprovedSourceBase(BaseModel):
    name: str
    url: str
    source_type: str = "Official Site"
    description: Optional[str] = None
    is_verified: bool = True

class ApprovedSourceCreate(ApprovedSourceBase):
    pass

class ApprovedSourceOut(ApprovedSourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

# Approved Facts
class ApprovedFactBase(BaseModel):
    statement: str
    category: str
    source_id: Optional[int] = None
    guideline_id: Optional[int] = None
    is_active: bool = True

class ApprovedFactCreate(ApprovedFactBase):
    pass

class ApprovedFactOut(ApprovedFactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    source_name: Optional[str] = None

# Banned Words
class BannedWordBase(BaseModel):
    word_or_phrase: str
    category: str = "Compliance"
    severity: SeverityLevel = SeverityLevel.HIGH
    explanation: str
    suggested_replacement: Optional[str] = None
    is_active: bool = True

class BannedWordCreate(BannedWordBase):
    pass

class BannedWordUpdate(BaseModel):
    word_or_phrase: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    explanation: Optional[str] = None
    suggested_replacement: Optional[str] = None
    is_active: Optional[bool] = None

class BannedWordOut(BannedWordBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

# Terminology
class ApprovedTerminologyBase(BaseModel):
    approved_term: str
    incorrect_term: str
    context: Optional[str] = None
    guideline_id: Optional[int] = None

class ApprovedTerminologyCreate(ApprovedTerminologyBase):
    pass

class ApprovedTerminologyOut(ApprovedTerminologyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
