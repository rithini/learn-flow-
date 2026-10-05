from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import StrengthStatus, RecommendationType, RecommendationStatus, EnrollmentStatus


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    course_id: str
    topic_id: Optional[str] = None
    topic_title: Optional[str] = None
    course_title: Optional[str] = None
    recommendation_type: RecommendationType
    priority: float
    reason_code: str
    explanation: str
    generated_by: str
    status: RecommendationStatus
    created_at: datetime
    expires_at: Optional[datetime] = None


class LearningPathItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic_id: str
    topic_title: str
    capsule_id: Optional[str] = None
    quiz_id: Optional[str] = None
    position: int
    activity_type: str
    status: EnrollmentStatus
    reason_code: Optional[str] = None
    mastery_score: float = 0.0
    estimated_minutes: int = 15
    difficulty: Optional[str] = "MEDIUM"
    strength_status: Optional[StrengthStatus] = StrengthStatus.DEVELOPING
    prerequisite_ids: List[str] = []
    prerequisite_titles: List[str] = []
    prerequisites_met: bool = True
    is_locked: bool = False
    lock_reason: Optional[str] = None
    recommended_action: Optional[str] = "STUDY"  # "STUDY", "QUIZ", "REMEDY", "ADVANCED"


class RecalibratePathRequest(BaseModel):
    course_id: str
    pacing_mode: Optional[str] = "STANDARD"  # "SPRINT", "STANDARD", "DEEP_MASTERY"


class LearningPathResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    course_id: str
    course_title: str
    version: int
    status: EnrollmentStatus
    generated_at: datetime
    pacing_mode: Optional[str] = "STANDARD"
    estimated_total_minutes: int = 60
    readiness_percentage: float = 0.0
    completed_items_count: int = 0
    total_items_count: int = 0
    items: List[LearningPathItemResponse]


class StudentPerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: str
    topic_id: str
    topic_title: str
    course_id: str
    course_title: str
    mastery_score: float
    confidence_score: float
    strength_status: StrengthStatus
    attempt_count: int
    recent_accuracy: float
    completion_quality: float
    last_assessed_at: Optional[datetime] = None


class StudentDashboardResponse(BaseModel):
    student_name: str
    current_level: Optional[str] = "Undergraduate"
    overall_progress: float
    streak_days: int
    total_quizzes_taken: int
    average_score: float
    enrolled_courses_count: int
    active_recommendation: Optional[RecommendationResponse] = None
    recent_recommendations: List[RecommendationResponse] = []
    weak_topics: List[StudentPerformanceResponse] = []
    strong_topics: List[StudentPerformanceResponse] = []
    recent_quiz_attempts: List[Dict[str, Any]] = []
