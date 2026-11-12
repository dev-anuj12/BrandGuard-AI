from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.models.enums import UserRole

def validate_strong_password(v: str) -> str:
    if len(v) < 10:
        raise ValueError("Password must be at least 10 characters long")
    if len(v.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")
    if not any(c.isupper() for c in v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one digit")
    if not any(not c.isalnum() for c in v):
        raise ValueError("Password must contain at least one special character")
    return v

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CREATOR
    organization: str = "BrandGuard Demo Enterprise"

class UserCreate(UserBase):
    password: str
    organization: Optional[str] = "BrandGuard Demo Enterprise"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return validate_strong_password(v)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_verified: bool = True
    mfa_enabled: bool = False
    created_at: datetime

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserOut
    mfa_required: bool = False
    mfa_token: Optional[str] = None
    email_sent: Optional[bool] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    jti: Optional[str] = None
    type: Optional[str] = None

# ─── Security Schemas ─────────────────────────────────────────────────────────

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return validate_strong_password(v)

class MFASetupResponse(BaseModel):
    secret: str
    otpauth_url: str
    backup_codes: List[str]

class MFAVerifyRequest(BaseModel):
    code: str

class MFALoginRequest(BaseModel):
    mfa_token: str
    code: str

