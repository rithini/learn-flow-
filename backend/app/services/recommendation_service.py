from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.learning import (
    Recommendation,
    LearningPath,
    LearningPathItem,
    StudentTopicPerformance,
)
from app.models.topic import Topic, TopicPrerequisite
from app.models.capsule import LearningCapsule
from app.models.course import Course
from app.models.enums import (
    RecommendationStatus,
    EnrollmentStatus,
    CourseStatus,
    CapsuleStatus,
)
from app.services.performance_service import performance_service
from app.services.adaptive_engine import adaptive_engine


class RecommendationService:
    @staticmethod
    def process_student_adaptive_update(
        db: Session,
        student_id: str,
        course_id: str,
        topic_id: str,
    ) -> Optional[Recommendation]:
        # 1. Recalculate StudentTopicPerformance
        perf = performance_service.calculate_topic_mastery(db, student_id, topic_id)
        if not perf:
            return None

        # 2. Get recommendations from adaptive engine policy
        eval_results = adaptive_engine.evaluate(db, student_id, course_id, topic_id, perf)

        # 3. Mark existing active recommendations for this course as EXPIRED / COMPLETED
        now = datetime.now(timezone.utc)
        existing_recs = (
            db.query(Recommendation)
            .filter(
                Recommendation.student_id == student_id,
                Recommendation.course_id == course_id,
                Recommendation.status == RecommendationStatus.ACTIVE,
            )
            .all()
        )
        for r in existing_recs:
            r.status = RecommendationStatus.EXPIRED

        # 4. Create new recommendations
        created_rec: Optional[Recommendation] = None
        for rec_data in eval_results:
            new_rec = Recommendation(
                student_id=student_id,
                course_id=course_id,
                topic_id=rec_data.get("topic_id"),
                recommendation_type=rec_data["recommendation_type"],
                priority=rec_data["priority"],
                reason_code=rec_data["reason_code"],
                explanation=rec_data["explanation"],
                generated_by="RULE_ENGINE_V1",
                status=RecommendationStatus.ACTIVE,
                created_at=now,
                expires_at=now + timedelta(days=7),
            )
            db.add(new_rec)
            created_rec = new_rec

        # 5. Refresh / Update Learning Path
        RecommendationService.rebuild_learning_path(db, student_id, course_id)

        db.commit()
        if created_rec:
            db.refresh(created_rec)
        return created_rec

    @staticmethod
    def rebuild_learning_path(db: Session, student_id: str, course_id: str) -> LearningPath:
        # Find active learning path or create new version
        active_path = (
            db.query(LearningPath)
            .filter(
                LearningPath.student_id == student_id,
                LearningPath.course_id == course_id,
                LearningPath.status == EnrollmentStatus.ACTIVE,
            )
            .first()
        )

        next_version = 1
        if active_path:
            next_version = active_path.version + 1
            active_path.status = EnrollmentStatus.COMPLETED

        now = datetime.now(timezone.utc)
        new_path = LearningPath(
            student_id=student_id,
            course_id=course_id,
            version=next_version,
            status=EnrollmentStatus.ACTIVE,
            generated_at=now,
        )
        db.add(new_path)
        db.flush()

        # Fetch course topics in sequence
        topics = (
            db.query(Topic)
            .filter(Topic.course_id == course_id)
            .order_by(Topic.sequence_no)
            .all()
        )

        pos = 1
        for topic in topics:
            # Check student mastery for this topic
            perf = (
                db.query(StudentTopicPerformance)
                .filter(
                    StudentTopicPerformance.student_id == student_id,
                    StudentTopicPerformance.topic_id == topic.id,
                )
                .first()
            )
            mastery = float(perf.mastery_score) if perf else 0.0

            # Find published capsule
            capsule = (
                db.query(LearningCapsule)
                .filter(
                    LearningCapsule.topic_id == topic.id,
                    LearningCapsule.status == CapsuleStatus.PUBLISHED,
                )
                .first()
            )

            reason = "Standard sequence module"
            if mastery >= 80.0:
                reason = "Proficient - available for review or quiz practice"
            elif mastery >= 50.0:
                reason = "Developing - targeted reinforcement active"
            elif perf and mastery < 50.0:
                reason = "Foundational reinforcement & simplified capsule recommended"

            item = LearningPathItem(
                path_id=new_path.id,
                topic_id=topic.id,
                capsule_id=capsule.id if capsule else None,
                position=pos,
                activity_type="CAPSULE",
                status=EnrollmentStatus.ACTIVE,
                reason_code=reason,
            )
            db.add(item)
            pos += 1

        return new_path


recommendation_service = RecommendationService()
