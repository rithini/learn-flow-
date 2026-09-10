from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class TrainerDashboardResponse(BaseModel):
    total_courses: int
    total_students: int
    active_capsules_count: int
    pending_drafts_count: int
    average_quiz_score: float
    difficult_topics: List[Dict[str, Any]]
    recent_student_activity: List[Dict[str, Any]]


class CourseAnalyticsResponse(BaseModel):
    course_id: str
    course_title: str
    enrolled_students: int
    completion_rate: float
    average_score: float
    median_score: float
    topic_performance: List[Dict[str, Any]]
    score_distribution: List[Dict[str, Any]]


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_students: int
    total_trainers: int
    total_admins: int
    total_courses: int
    total_capsules: int
    total_quizzes_taken: int
    total_materials_processed: int
    recent_audit_logs: List[Dict[str, Any]]
    system_health: Dict[str, Any]
