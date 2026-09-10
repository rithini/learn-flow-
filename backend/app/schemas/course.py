from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import CourseStatus, TopicStatus, EnrollmentStatus


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: Optional[CourseStatus] = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    trainer_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: CourseStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    topic_count: int = 0
    enrolled_count: int = 0


class CourseEnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    student_id: str
    status: EnrollmentStatus
    enrolled_at: datetime
    course: CourseResponse
