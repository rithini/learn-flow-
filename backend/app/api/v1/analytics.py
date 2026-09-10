from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.permissions import get_current_admin
from app.models.user import User
from app.models.learning import StudentTopicPerformance
from app.models.quiz import QuizAttempt

router = APIRouter(prefix="/analytics", tags=["System Analytics"])


@router.get("/system-trends")
def get_system_trends(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # Daily quiz attempts aggregate
    quiz_count = db.query(QuizAttempt).count()
    perf_count = db.query(StudentTopicPerformance).count()

    # Dummy weekly growth trend
    trends = [
        {"week": "Week 1", "active_students": 12, "quizzes_taken": 28, "average_mastery": 62.4},
        {"week": "Week 2", "active_students": 24, "quizzes_taken": 54, "average_mastery": 68.1},
        {"week": "Week 3", "active_students": 45, "quizzes_taken": 98, "average_mastery": 74.5},
        {"week": "Week 4", "active_students": 60, "quizzes_taken": 142, "average_mastery": 79.2},
    ]

    return {
        "total_quiz_attempts": quiz_count,
        "total_mastery_evaluations": perf_count,
        "weekly_trends": trends,
    }
