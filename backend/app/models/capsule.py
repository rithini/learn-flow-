import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    SmallInteger,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import CapsuleLevel, CapsuleStatus, SectionType, VideoStatus


class LearningCapsule(Base):
    __tablename__ = "learning_capsules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)
    level = Column(SQLEnum(CapsuleLevel), nullable=False, default=CapsuleLevel.STANDARD)
    title = Column(String(200), nullable=False)
    status = Column(SQLEnum(CapsuleStatus), nullable=False, default=CapsuleStatus.DRAFT)
    estimated_minutes = Column(SmallInteger, default=5, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    topic = relationship("Topic", back_populates="capsules")
    sections = relationship("CapsuleSection", back_populates="capsule", cascade="all, delete-orphan", order_by="CapsuleSection.sequence_no")
    video = relationship("Video", back_populates="capsule", uselist=False, cascade="all, delete-orphan")


class CapsuleSection(Base):
    __tablename__ = "capsule_sections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    capsule_id = Column(String(36), ForeignKey("learning_capsules.id", ondelete="CASCADE"), nullable=False, index=True)
    section_type = Column(SQLEnum(SectionType), nullable=False)
    sequence_no = Column(Integer, default=1, nullable=False)
    content_json = Column(JSON, nullable=False)

    capsule = relationship("LearningCapsule", back_populates="sections")


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    capsule_id = Column(String(36), ForeignKey("learning_capsules.id", ondelete="CASCADE"), nullable=False, index=True)
    script = Column(Text, nullable=False)
    storage_key = Column(Text, nullable=True)
    duration_seconds = Column(Integer, nullable=True, default=90)
    status = Column(SQLEnum(VideoStatus), default=VideoStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    capsule = relationship("LearningCapsule", back_populates="video")
