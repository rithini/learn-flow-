import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import CourseStatus, EnrollmentStatus


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    status = Column(SQLEnum(CourseStatus), nullable=False, default=CourseStatus.DRAFT)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    trainer = relationship("User", back_populates="owned_courses", foreign_keys=[trainer_id])
    topics = relationship("Topic", back_populates="course", cascade="all, delete-orphan", order_by="Topic.sequence_no")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    __table_args__ = (UniqueConstraint("course_id", "student_id", name="uq_course_student"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.ACTIVE)
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
