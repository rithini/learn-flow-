import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import StrengthStatus, RecommendationType, RecommendationStatus, EnrollmentStatus


class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=True, index=True)
    capsule_id = Column(String(36), ForeignKey("learning_capsules.id", ondelete="CASCADE"), nullable=True)
    status = Column(SQLEnum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.ACTIVE)
    completion_percent = Column(Numeric(5, 2), default=0.00, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class StudentTopicPerformance(Base):
    __tablename__ = "student_topic_performance"
    __table_args__ = (UniqueConstraint("student_id", "topic_id", name="uq_student_topic_perf"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_score = Column(Numeric(5, 2), default=0.00, nullable=False)
    confidence_score = Column(Numeric(5, 2), default=0.00, nullable=False)
    strength_status = Column(SQLEnum(StrengthStatus), default=StrengthStatus.UNCERTAIN, nullable=False)
    attempt_count = Column(Integer, default=0, nullable=False)
    recent_accuracy = Column(Numeric(5, 2), default=0.00, nullable=False)
    completion_quality = Column(Numeric(5, 2), default=0.00, nullable=False)
    last_assessed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    student = relationship("User", foreign_keys=[student_id])
    topic = relationship("Topic", foreign_keys=[topic_id])


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)
    status = Column(SQLEnum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("LearningPathItem", back_populates="learning_path", cascade="all, delete-orphan", order_by="LearningPathItem.position")


class LearningPathItem(Base):
    __tablename__ = "learning_path_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    capsule_id = Column(String(36), ForeignKey("learning_capsules.id", ondelete="SET NULL"), nullable=True)
    position = Column(Integer, nullable=False)
    activity_type = Column(String(50), nullable=False, default="CAPSULE")
    status = Column(SQLEnum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False)
    reason_code = Column(String(80), nullable=True)

    learning_path = relationship("LearningPath", back_populates="items")
    topic = relationship("Topic")
    capsule = relationship("LearningCapsule")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    recommendation_type = Column(SQLEnum(RecommendationType), nullable=False)
    priority = Column(Numeric(6, 2), default=50.00, nullable=False)
    reason_code = Column(String(80), nullable=False)
    explanation = Column(Text, nullable=False)
    generated_by = Column(String(50), default="RULE_ENGINE_V1", nullable=False)
    status = Column(SQLEnum(RecommendationStatus), default=RecommendationStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    topic = relationship("Topic", foreign_keys=[topic_id])
