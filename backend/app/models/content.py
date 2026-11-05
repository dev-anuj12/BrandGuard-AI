from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.enums import ContentStatus

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    original_body = Column(Text, nullable=False)
    current_body = Column(Text, nullable=False)
    channel = Column(String(100), default="Website/Blog") # Social Media, Press Release, Email, Ad Campaign
    target_audience = Column(String(100), default="Retail Investors")
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.DRAFT, nullable=False, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="created_content", foreign_keys=[creator_id])
    revisions = relationship("ContentRevision", back_populates="content", cascade="all, delete-orphan", order_by="ContentRevision.version.desc()")
    reviews = relationship("AIReview", back_populates="content", cascade="all, delete-orphan")
    assignments = relationship("ReviewerAssignment", back_populates="content", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="content", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="content", cascade="all, delete-orphan")

class ContentRevision(Base):
    __tablename__ = "content_revisions"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    version = Column(Integer, nullable=False)
    body = Column(Text, nullable=False)
    revised_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_summary = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    content = relationship("Content", back_populates="revisions")
    revised_by_user = relationship("User", back_populates="revisions")
    reviews = relationship("AIReview", back_populates="revision")
