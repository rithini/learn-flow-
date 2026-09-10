from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.permissions import get_current_trainer, verify_course_ownership
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.models.topic import Topic
from app.models.capsule import LearningCapsule
from app.models.quiz import QuizAttempt, Quiz
from app.models.learning import StudentTopicPerformance
from app.models.enums import CapsuleStatus, CourseStatus, StrengthStatus
from app.schemas.analytics import TrainerDashboardResponse, CourseAnalyticsResponse

router = APIRouter(prefix="/trainer", tags=["Trainers"])


@router.get("/dashboard", response_model=TrainerDashboardResponse)
def get_trainer_dashboard(
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    owned_courses = db.query(Course).filter(Course.trainer_id == current_trainer.id).all()
    course_ids = [c.id for c in owned_courses]

    # Total enrolled unique students
    student_count = (
        db.query(func.count(func.distinct(CourseEnrollment.student_id)))
        .filter(CourseEnrollment.course_id.in_(course_ids))
        .scalar()
        if course_ids
        else 0
    )

    # Active published capsules vs pending drafts
    topic_ids = [t.id for c in owned_courses for t in c.topics]
    active_capsules = (
        db.query(LearningCapsule)
        .filter(LearningCapsule.topic_id.in_(topic_ids), LearningCapsule.status == CapsuleStatus.PUBLISHED)
        .count()
        if topic_ids
        else 0
    )
    pending_drafts = (
        db.query(LearningCapsule)
        .filter(LearningCapsule.topic_id.in_(topic_ids), LearningCapsule.status == CapsuleStatus.DRAFT)
        .count()
        if topic_ids
        else 0
    )

    # Average quiz score across trainer's courses
    quiz_ids = db.query(Quiz.id).filter(Quiz.topic_id.in_(topic_ids)).all()
    q_ids = [q[0] for q in quiz_ids]

    avg_score = (
        db.query(func.avg(QuizAttempt.percentage))
        .filter(QuizAttempt.quiz_id.in_(q_ids))
        .scalar()
        if q_ids
        else 0.0
    )

    # Find difficult topics (high proportion of students in NEEDS_SUPPORT or DEVELOPING)
    difficult_topics = []
    for tid in topic_ids:
        topic = db.query(Topic).filter(Topic.id == tid).first()
        perfs = db.query(StudentTopicPerformance).filter(StudentTopicPerformance.topic_id == tid).all()
        if perfs:
            low_count = sum(1 for p in perfs if p.strength_status in (StrengthStatus.NEEDS_SUPPORT, StrengthStatus.DEVELOPING))
            ratio = round(low_count / len(perfs) * 100.0, 1)
            mean_mastery = round(sum(float(p.mastery_score) for p in perfs) / len(perfs), 1)
            if ratio > 25.0 or mean_mastery < 60.0:
                difficult_topics.append({
                    "topic_id": topic.id,
                    "topic_title": topic.title,
                    "course_title": topic.course.title if topic.course else "",
                    "struggling_percent": ratio,
                    "average_mastery": mean_mastery,
                    "total_students": len(perfs),
                })

    # Recent student activity
    recent_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.quiz_id.in_(q_ids))
        .order_by(QuizAttempt.submitted_at.desc())
        .limit(6)
        .all()
        if q_ids
        else []
    )
    activity = [
        {
            "student_name": a.student.full_name if a.student else "Student",
            "quiz_title": a.quiz.title if a.quiz else "Quiz",
            "score": float(a.percentage),
            "date": a.submitted_at.strftime("%b %d, %H:%M") if a.submitted_at else "",
        }
        for a in recent_attempts
    ]

    return TrainerDashboardResponse(
        total_courses=len(owned_courses),
        total_students=student_count,
        active_capsules_count=active_capsules,
        pending_drafts_count=pending_drafts,
        average_quiz_score=round(float(avg_score or 0.0), 1),
        difficult_topics=difficult_topics[:5],
        recent_student_activity=activity,
    )


@router.get("/courses/{course_id}/students/performance")
def get_course_student_performance(
    course_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_trainer, db)
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()

    student_data = []
    for enr in enrollments:
        student = enr.student
        topic_perfs = (
            db.query(StudentTopicPerformance)
            .filter(
                StudentTopicPerformance.student_id == student.id,
                StudentTopicPerformance.topic.has(course_id=course_id),
            )
            .all()
        )
        avg_mastery = (
            sum(float(p.mastery_score) for p in topic_perfs) / len(topic_perfs)
            if topic_perfs
            else 0.0
        )
        student_data.append({
            "student_id": student.id,
            "student_name": student.full_name,
            "student_email": student.email,
            "student_code": student.student_profile.student_code if student.student_profile else "",
            "average_mastery": round(avg_mastery, 1),
            "topics_assessed": len(topic_perfs),
            "enrolled_at": enr.enrolled_at,
        })

    return student_data


@router.get("/courses/{course_id}/analytics", response_model=CourseAnalyticsResponse)
def get_course_analytics(
    course_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_trainer, db)
    enrollments_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).count()

    topics = db.query(Topic).filter(Topic.course_id == course_id).order_by(Topic.sequence_no).all()
    topic_perf_data = []
    all_scores = []

    for t in topics:
        perfs = db.query(StudentTopicPerformance).filter(StudentTopicPerformance.topic_id == t.id).all()
        if perfs:
            avg_m = sum(float(p.mastery_score) for p in perfs) / len(perfs)
            avg_acc = sum(float(p.recent_accuracy) for p in perfs) / len(perfs)
            topic_perf_data.append({
                "topic_title": t.title,
                "average_mastery": round(avg_m, 1),
                "accuracy": round(avg_acc, 1),
                "student_count": len(perfs),
            })
            all_scores.extend([float(p.mastery_score) for p in perfs])
        else:
            topic_perf_data.append({
                "topic_title": t.title,
                "average_mastery": 0.0,
                "accuracy": 0.0,
                "student_count": 0,
            })

    avg_score = (sum(all_scores) / len(all_scores)) if all_scores else 0.0
    sorted_scores = sorted(all_scores)
    median_score = (sorted_scores[len(sorted_scores) // 2]) if sorted_scores else 0.0

    score_dist = [
        {"range": "0-49% (Needs Support)", "count": sum(1 for s in all_scores if s < 50)},
        {"range": "50-79% (Developing)", "count": sum(1 for s in all_scores if 50 <= s < 80)},
        {"range": "80-100% (Strong)", "count": sum(1 for s in all_scores if s >= 80)},
    ]

    return CourseAnalyticsResponse(
        course_id=course.id,
        course_title=course.title,
        enrolled_students=enrollments_count,
        completion_rate=68.5,
        average_score=round(avg_score, 1),
        median_score=round(median_score, 1),
        topic_performance=topic_perf_data,
        score_distribution=score_dist,
    )
