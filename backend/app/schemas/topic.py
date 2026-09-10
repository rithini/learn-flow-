from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import TopicStatus, StrengthStatus


class TopicCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    sequence_no: int = 1
    estimated_minutes: int = 15
    parent_topic_id: Optional[str] = None
    prerequisite_topic_ids: List[str] = []


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sequence_no: Optional[int] = None
    estimated_minutes: Optional[int] = None
    status: Optional[TopicStatus] = None
    parent_topic_id: Optional[str] = None
    prerequisite_topic_ids: Optional[List[str]] = None


class TopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    parent_topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    sequence_no: int
    estimated_minutes: int
    status: TopicStatus
    created_at: datetime
    prerequisite_ids: List[str] = []
    capsule_id: Optional[str] = None
    quiz_id: Optional[str] = None


class StudentTopicView(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    sequence_no: int
    estimated_minutes: int
    is_locked: bool = False
    lock_reason: Optional[str] = None
    mastery_score: float = 0.0
    strength_status: StrengthStatus = StrengthStatus.UNCERTAIN
    has_completed_capsule: bool = False
    has_completed_quiz: bool = False
    capsule_id: Optional[str] = None
    quiz_id: Optional[str] = None
    prerequisite_ids: List[str] = []
