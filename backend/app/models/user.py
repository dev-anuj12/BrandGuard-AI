from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CREATOR, nullable=False)
    organization = Column(String(100), default="BrandGuard Demo Enterprise", nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    
    # Phase A: Email Verification & Progressive Lockout
    is_verified = Column(Boolean, default=True, nullable=False)
    otp_hash = Column(String(255), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    otp_attempts = Column(Integer, default=0, nullable=False)
    otp_last_sent_at = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)

    # Phase B: Session & Token Invalidation
    password_changed_at = Column(DateTime, nullable=True)
    password_reset_token_hash = Column(String(255), nullable=True)
    password_reset_expires_at = Column(DateTime, nullable=True)

    # Phase C: Multi-Factor Authentication (TOTP)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    mfa_backup_codes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    created_content = relationship("Content", back_populates="creator", foreign_keys="Content.creator_id")
    revisions = relationship("ContentRevision", back_populates="revised_by_user")
    assigned_reviews = relationship("ReviewerAssignment", back_populates="reviewer", foreign_keys="ReviewerAssignment.reviewer_id")
    approvals = relationship("Approval", back_populates="manager")
    comments = relationship("Comment", back_populates="author")
    audit_logs = relationship("AuditLog", back_populates="user")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_jti = Column(String(64), unique=True, index=True, nullable=False)
    refresh_token_hash = Column(String(255), index=True, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)

    user = relationship("User", back_populates="sessions")

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, index=True, nullable=False)
    revoked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)


