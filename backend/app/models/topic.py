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
    Table,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import TopicStatus


class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"

    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True)
    prerequisite_topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True)


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    sequence_no = Column(Integer, default=1, nullable=False)
    estimated_minutes = Column(SmallInteger, default=15, nullable=False)
    status = Column(SQLEnum(TopicStatus), nullable=False, default=TopicStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    course = relationship("Course", back_populates="topics")
    parent = relationship("Topic", remote_side=[id], backref="subtopics")
    capsules = relationship("LearningCapsule", back_populates="topic", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="topic", cascade="all, delete-orphan")

    prerequisites = relationship(
        "Topic",
        secondary="topic_prerequisites",
        primaryjoin="Topic.id==TopicPrerequisite.topic_id",
        secondaryjoin="Topic.id==TopicPrerequisite.prerequisite_topic_id",
        backref="dependent_topics",
    )
