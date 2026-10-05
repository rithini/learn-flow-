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
    def rebuild_learning_path(
        db: Session,
        student_id: str,
        course_id: str,
        pacing_mode: str = "STANDARD",
    ) -> LearningPath:
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

            reason = "Standard curriculum module"
            activity_type = "CAPSULE"

            if pacing_mode == "SPRINT":
                if mastery >= 80.0:
                    reason = "Fast-track mastered • Direct challenge checkpoint unlocked"
                    activity_type = "CHALLENGE_QUIZ"
                elif mastery >= 50.0:
                    reason = "Accelerated review • Key concept focus"
                    activity_type = "FAST_CAPSULE"
                else:
                    reason = "Priority foundational reinforcement before sprint advance"
                    activity_type = "REMEDIAL_CAPSULE"
            elif pacing_mode == "DEEP_MASTERY":
                if mastery >= 80.0:
                    reason = "Proficient • Deep synthesis & application review"
                    activity_type = "DEEP_CAPSULE"
                elif mastery >= 50.0:
                    reason = "Developing • Step-by-step guided analogy reinforcement"
                    activity_type = "GUIDED_CAPSULE"
                else:
                    reason = "Intensive prerequisite review & simplified analogy required"
                    activity_type = "FOUNDATION_BOOSTER"
            else:
                if mastery >= 80.0:
                    reason = "Proficient • Ready for review or challenge quiz"
                    activity_type = "CAPSULE"
                elif mastery >= 50.0:
                    reason = "Developing • Targeted practice & concept reinforcement"
                    activity_type = "CAPSULE"
                elif perf and mastery < 50.0:
                    reason = "Foundational reinforcement & simplified capsule recommended"
                    activity_type = "REMEDIAL_CAPSULE"

            item = LearningPathItem(
                path_id=new_path.id,
                topic_id=topic.id,
                capsule_id=capsule.id if capsule else None,
                position=pos,
                activity_type=activity_type,
                status=EnrollmentStatus.ACTIVE,
                reason_code=reason,
            )
            db.add(item)
            pos += 1

        return new_path


recommendation_service = RecommendationService()
