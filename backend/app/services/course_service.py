from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.course import Course, CourseEnrollment
from app.models.topic import Topic, TopicPrerequisite
from app.models.capsule import LearningCapsule
from app.models.quiz import Quiz
from app.models.learning import StudentTopicPerformance, StudentProgress
from app.models.enums import CourseStatus, TopicStatus, CapsuleStatus, StrengthStatus, EnrollmentStatus
from app.schemas.topic import StudentTopicView
from app.core.exceptions import NotFoundException, BadRequestException


class CourseService:
    @staticmethod
    def get_student_course_view(
        db: Session,
        course_id: str,
        student_id: str,
    ) -> List[StudentTopicView]:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise NotFoundException("Course", course_id)

        topics = (
            db.query(Topic)
            .filter(Topic.course_id == course_id)
            .order_by(Topic.sequence_no)
            .all()
        )

        # Build mastery map
        perf_records = (
            db.query(StudentTopicPerformance)
            .filter(StudentTopicPerformance.student_id == student_id)
            .all()
        )
        perf_map = {p.topic_id: p for p in perf_records}

        # Build progress map
        progress_records = (
            db.query(StudentProgress)
            .filter(
                StudentProgress.student_id == student_id,
                StudentProgress.course_id == course_id,
            )
            .all()
        )
        prog_map = {p.topic_id: p for p in progress_records}

        views: List[StudentTopicView] = []
        for topic in topics:
            prereqs = (
                db.query(TopicPrerequisite)
                .filter(TopicPrerequisite.topic_id == topic.id)
                .all()
            )
            prereq_ids = [p.prerequisite_topic_id for p in prereqs]

            # Determine lock state
            is_locked = False
            lock_reason = None

            for pid in prereq_ids:
                p_perf = perf_map.get(pid)
                if not p_perf or float(p_perf.mastery_score) < 65.0:
                    prereq_topic = db.query(Topic).filter(Topic.id == pid).first()
                    prereq_title = prereq_topic.title if prereq_topic else "Prerequisite"
                    is_locked = True
                    lock_reason = f"Requires >= 65% mastery in '{prereq_title}'"
                    break

            topic_perf = perf_map.get(topic.id)
            mastery = float(topic_perf.mastery_score) if topic_perf else 0.0
            strength = topic_perf.strength_status if topic_perf else StrengthStatus.UNCERTAIN

            prog = prog_map.get(topic.id)
            has_capsule = prog is not None and float(prog.completion_percent) >= 50.0

            # Find active capsule and quiz
            published_capsule = (
                db.query(LearningCapsule)
                .filter(
                    LearningCapsule.topic_id == topic.id,
                    LearningCapsule.status == CapsuleStatus.PUBLISHED,
                )
                .first()
            )
            published_quiz = (
                db.query(Quiz)
                .filter(
                    Quiz.topic_id == topic.id,
                    Quiz.status == CourseStatus.PUBLISHED,
                )
                .first()
            )

            has_quiz = (topic_perf.attempt_count > 0) if topic_perf else False

            views.append(
                StudentTopicView(
                    id=topic.id,
                    course_id=topic.course_id,
                    title=topic.title,
                    description=topic.description,
                    sequence_no=topic.sequence_no,
                    estimated_minutes=topic.estimated_minutes,
                    is_locked=is_locked,
                    lock_reason=lock_reason,
                    mastery_score=mastery,
                    strength_status=strength,
                    has_completed_capsule=has_capsule,
                    has_completed_quiz=has_quiz,
                    capsule_id=published_capsule.id if published_capsule else None,
                    quiz_id=published_quiz.id if published_quiz else None,
                    prerequisite_ids=prereq_ids,
                )
            )

        return views


course_service = CourseService()
