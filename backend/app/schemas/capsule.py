from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import CapsuleLevel, CapsuleStatus, SectionType


class CapsuleSectionCreate(BaseModel):
    section_type: SectionType
    sequence_no: int
    content_json: Dict[str, Any]


class CapsuleSectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    capsule_id: str
    section_type: SectionType
    sequence_no: int
    content_json: Dict[str, Any]


class LearningCapsuleCreate(BaseModel):
    topic_id: str
    level: CapsuleLevel = CapsuleLevel.STANDARD
    title: str = Field(..., min_length=2, max_length=200)
    estimated_minutes: int = 5
    sections: List[CapsuleSectionCreate] = []


class LearningCapsuleUpdate(BaseModel):
    title: Optional[str] = None
    level: Optional[CapsuleLevel] = None
    estimated_minutes: Optional[int] = None
    status: Optional[CapsuleStatus] = None
    sections: Optional[List[CapsuleSectionCreate]] = None


class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    capsule_id: str
    script: str
    duration_seconds: int
    status: str
    video_url: Optional[str] = None


class LearningCapsuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic_id: str
    version: int
    level: CapsuleLevel
    title: str
    status: CapsuleStatus
    estimated_minutes: int
    created_by: str
    published_at: Optional[datetime] = None
    created_at: datetime
    sections: List[CapsuleSectionResponse] = []
    video: Optional[VideoResponse] = None


class CapsuleProgressUpdate(BaseModel):
    completion_percent: float = Field(..., ge=0.0, le=100.0)
    time_spent_seconds: int = Field(..., ge=0)
    is_completed: bool = False
