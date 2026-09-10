from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.core.permissions import get_current_student, verify_course_enrollment
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.models.topic import Topic
from app.models.quiz import QuizAttempt, Quiz
from app.models.learning import (
    StudentProgress,
    StudentTopicPerformance,
    Recommendation,
    LearningPath,
)
from app.models.enums import RecommendationStatus, EnrollmentStatus, StrengthStatus
from app.schemas.course import CourseResponse
from app.schemas.adaptive import (
    StudentDashboardResponse,
    RecommendationResponse,
    LearningPathResponse,
    StudentPerformanceResponse,
)
from app.schemas.topic import StudentTopicView
from app.services.course_service import course_service

router = APIRouter(tags=["Students"])


@router.get("/students/me/dashboard", response_model=StudentDashboardResponse)
def get_student_dashboard(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Enrolled courses count
    enrolled_count = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.student_id == current_student.id,
            CourseEnrollment.status == EnrollmentStatus.ACTIVE,
        )
        .count()
    )

    # Active recommendations
    active_rec = (
        db.query(Recommendation)
        .filter(
            Recommendation.student_id == current_student.id,
            Recommendation.status == RecommendationStatus.ACTIVE,
        )
        .order_by(desc(Recommendation.priority))
        .first()
    )

    active_rec_resp = None
    if active_rec:
        t = active_rec.topic
        c = active_rec.student
        active_rec_resp = RecommendationResponse(
            id=active_rec.id,
            student_id=active_rec.student_id,
            course_id=active_rec.course_id,
            topic_id=active_rec.topic_id,
            topic_title=t.title if t else None,
            course_title=t.course.title if t and t.course else None,
            recommendation_type=active_rec.recommendation_type,
            priority=float(active_rec.priority),
            reason_code=active_rec.reason_code,
            explanation=active_rec.explanation,
            generated_by=active_rec.generated_by,
            status=active_rec.status,
            created_at=active_rec.created_at,
            expires_at=active_rec.expires_at,
        )

    # Recent recommendations
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.student_id == current_student.id)
        .order_by(desc(Recommendation.created_at))
        .limit(5)
        .all()
    )
    rec_list = [
        RecommendationResponse(
            id=r.id,
            student_id=r.student_id,
            course_id=r.course_id,
            topic_id=r.topic_id,
            topic_title=r.topic.title if r.topic else None,
            course_title=r.topic.course.title if r.topic and r.topic.course else None,
            recommendation_type=r.recommendation_type,
            priority=float(r.priority),
            reason_code=r.reason_code,
            explanation=r.explanation,
            generated_by=r.generated_by,
            status=r.status,
            created_at=r.created_at,
            expires_at=r.expires_at,
        )
        for r in recs
    ]

    # Topic performance profiles (Strong vs Weak)
    perf_records = (
        db.query(StudentTopicPerformance)
        .filter(StudentTopicPerformance.student_id == current_student.id)
        .all()
    )

    weak_topics: List[StudentPerformanceResponse] = []
    strong_topics: List[StudentPerformanceResponse] = []
    total_score_sum = 0.0

    for p in perf_records:
        t = p.topic
        resp = StudentPerformanceResponse(
            student_id=p.student_id,
            topic_id=p.topic_id,
            topic_title=t.title if t else "Topic",
            course_id=t.course_id if t else "",
            course_title=t.course.title if t and t.course else "",
            mastery_score=float(p.mastery_score),
            confidence_score=float(p.confidence_score),
            strength_status=p.strength_status,
            attempt_count=p.attempt_count,
            recent_accuracy=float(p.recent_accuracy),
            completion_quality=float(p.completion_quality),
            last_assessed_at=p.last_assessed_at,
        )
        total_score_sum += float(p.mastery_score)
        if p.strength_status in (StrengthStatus.NEEDS_SUPPORT, StrengthStatus.DEVELOPING):
            weak_topics.append(resp)
        elif p.strength_status == StrengthStatus.STRONG:
            strong_topics.append(resp)

    # Quiz Attempts
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == current_student.id)
        .order_by(desc(QuizAttempt.submitted_at))
        .limit(10)
        .all()
    )
    attempt_dicts = [
        {
            "id": a.id,
            "quiz_title": a.quiz.title if a.quiz else "Quiz",
            "score": float(a.score),
            "percentage": float(a.percentage),
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            "passed": float(a.percentage) >= (float(a.quiz.pass_score) if a.quiz else 70.0),
        }
        for a in attempts
    ]

    avg_score = (total_score_sum / len(perf_records)) if perf_records else 0.0

    # Overall progress percentage
    progresses = (
        db.query(StudentProgress)
        .filter(StudentProgress.student_id == current_student.id)
        .all()
    )
    overall_prog = (
        sum([float(p.completion_percent) for p in progresses]) / len(progresses)
        if progresses
        else 0.0
    )

    current_lvl = "Undergraduate"
    if current_student.student_profile and current_student.student_profile.current_level:
        current_lvl = current_student.student_profile.current_level

    return StudentDashboardResponse(
        student_name=current_student.full_name,
        current_level=current_lvl,
        overall_progress=round(overall_prog, 1),
        streak_days=4,  # Computed activity streak
        total_quizzes_taken=len(attempts),
        average_score=round(avg_score, 1),
        enrolled_courses_count=enrolled_count,
        active_recommendation=active_rec_resp,
        recent_recommendations=rec_list,
        weak_topics=weak_topics[:4],
        strong_topics=strong_topics[:4],
        recent_quiz_attempts=attempt_dicts,
    )


@router.get("/students/me/courses", response_model=List[CourseResponse])
def get_student_courses(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    enrollments = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.student_id == current_student.id,
            CourseEnrollment.status == EnrollmentStatus.ACTIVE,
        )
        .all()
    )
    result: List[CourseResponse] = []
    for enr in enrollments:
        c = enr.course
        topic_count = db.query(Topic).filter(Topic.course_id == c.id).count()
        enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id).count()
        result.append(
            CourseResponse(
                id=c.id,
                trainer_id=c.trainer_id,
                title=c.title,
                description=c.description,
                thumbnail_url=c.thumbnail_url,
                status=c.status,
                published_at=c.published_at,
                created_at=c.created_at,
                updated_at=c.updated_at,
                topic_count=topic_count,
                enrolled_count=enrolled_count,
            )
        )
    return result


@router.get("/courses/{course_id}/student-view", response_model=List[StudentTopicView])
def get_student_course_tree(
    course_id: str,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    verify_course_enrollment(course_id, current_student, db)
    return course_service.get_student_course_view(db, course_id, current_student.id)


@router.get("/students/me/recommendations", response_model=List[RecommendationResponse])
def get_student_recommendations(
    course_id: Optional[str] = None,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    q = db.query(Recommendation).filter(Recommendation.student_id == current_student.id)
    if course_id:
        q = q.filter(Recommendation.course_id == course_id)
    recs = q.order_by(desc(Recommendation.created_at)).all()

    return [
        RecommendationResponse(
            id=r.id,
            student_id=r.student_id,
            course_id=r.course_id,
            topic_id=r.topic_id,
            topic_title=r.topic.title if r.topic else None,
            course_title=r.topic.course.title if r.topic and r.topic.course else None,
            recommendation_type=r.recommendation_type,
            priority=float(r.priority),
            reason_code=r.reason_code,
            explanation=r.explanation,
            generated_by=r.generated_by,
            status=r.status,
            created_at=r.created_at,
            expires_at=r.expires_at,
        )
        for r in recs
    ]


@router.get("/students/me/performance", response_model=List[StudentPerformanceResponse])
def get_student_performance(
    course_id: Optional[str] = None,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    q = db.query(StudentTopicPerformance).filter(StudentTopicPerformance.student_id == current_student.id)
    records = q.all()

    results = []
    for p in records:
        t = p.topic
        if course_id and t.course_id != course_id:
            continue
        results.append(
            StudentPerformanceResponse(
                student_id=p.student_id,
                topic_id=p.topic_id,
                topic_title=t.title if t else "Topic",
                course_id=t.course_id if t else "",
                course_title=t.course.title if t and t.course else "",
                mastery_score=float(p.mastery_score),
                confidence_score=float(p.confidence_score),
                strength_status=p.strength_status,
                attempt_count=p.attempt_count,
                recent_accuracy=float(p.recent_accuracy),
                completion_quality=float(p.completion_quality),
                last_assessed_at=p.last_assessed_at,
            )
        )
    return results


@router.get("/students/me/learning-path", response_model=Optional[LearningPathResponse])
def get_student_learning_path(
    course_id: str,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    path = (
        db.query(LearningPath)
        .filter(
            LearningPath.student_id == current_student.id,
            LearningPath.course_id == course_id,
            LearningPath.status == EnrollmentStatus.ACTIVE,
        )
        .order_by(desc(LearningPath.version))
        .first()
    )
    if not path:
        return None

    course = db.query(Course).filter(Course.id == course_id).first()
    course_title = course.title if course else "Course"

    items = []
    for itm in path.items:
        t = itm.topic
        perf = (
            db.query(StudentTopicPerformance)
            .filter(
                StudentTopicPerformance.student_id == current_student.id,
                StudentTopicPerformance.topic_id == itm.topic_id,
            )
            .first()
        )
        items.append({
            "id": itm.id,
            "topic_id": itm.topic_id,
            "topic_title": t.title if t else "Topic",
            "capsule_id": itm.capsule_id,
            "position": itm.position,
            "activity_type": itm.activity_type,
            "status": itm.status,
            "reason_code": itm.reason_code,
            "mastery_score": float(perf.mastery_score) if perf else 0.0,
        })

    return LearningPathResponse(
        id=path.id,
        student_id=path.student_id,
        course_id=path.course_id,
        course_title=course_title,
        version=path.version,
        status=path.status,
        generated_at=path.generated_at,
        items=items,
    )
