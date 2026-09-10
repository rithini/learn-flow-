from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.topic import Topic, TopicPrerequisite
from app.models.capsule import LearningCapsule
from app.models.quiz import Quiz
from app.models.learning import (
    StudentTopicPerformance,
    Recommendation,
    LearningPath,
    LearningPathItem,
    StudentProgress,
)
from app.models.enums import (
    StrengthStatus,
    RecommendationType,
    RecommendationStatus,
    CapsuleStatus,
    CourseStatus,
    EnrollmentStatus,
)


class RecommendationStrategy(ABC):
    """
    Extensible Strategy interface. Rule-based for MVP, pluggable for ML model in future.
    """
    @abstractmethod
    def evaluate(
        self,
        db: Session,
        student_id: str,
        course_id: str,
        topic_id: str,
        performance: StudentTopicPerformance,
    ) -> List[Dict[str, Any]]:
        pass


class RuleBasedAdaptiveEngine(RecommendationStrategy):
    STRONG_THRESHOLD = 80.0
    DEVELOPING_THRESHOLD = 50.0
    MIN_CONFIDENCE_THRESHOLD = 40.0

    def evaluate(
        self,
        db: Session,
        student_id: str,
        course_id: str,
        topic_id: str,
        performance: StudentTopicPerformance,
    ) -> List[Dict[str, Any]]:
        recommendations_to_create: List[Dict[str, Any]] = []

        current_topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not current_topic:
            return recommendations_to_create

        mastery = float(performance.mastery_score)
        confidence = float(performance.confidence_score)

        # 1. LOW CONFIDENCE CHECK
        if confidence < self.MIN_CONFIDENCE_THRESHOLD and performance.attempt_count < 2:
            recommendations_to_create.append({
                "recommendation_type": RecommendationType.CHECKPOINT,
                "priority": 85.0,
                "reason_code": "LOW_CONFIDENCE_CHECKPOINT",
                "explanation": (
                    f"Complete a short checkpoint quiz on '{current_topic.title}' to solidify "
                    f"your mastery baseline before progressing."
                ),
                "topic_id": current_topic.id,
            })
            return recommendations_to_create

        # 2. STRONG MASTERY (>= 80%)
        if mastery >= self.STRONG_THRESHOLD:
            # Find next topic in sequence whose prerequisites are satisfied
            all_course_topics = (
                db.query(Topic)
                .filter(Topic.course_id == course_id, Topic.status == CourseStatus.PUBLISHED)
                .order_by(Topic.sequence_no)
                .all()
            )

            next_topic: Optional[Topic] = None
            for t in all_course_topics:
                if t.sequence_no > current_topic.sequence_no:
                    # Check prerequisites for candidate topic t
                    prereqs = (
                        db.query(TopicPrerequisite)
                        .filter(TopicPrerequisite.topic_id == t.id)
                        .all()
                    )
                    prereq_ids = [p.prerequisite_topic_id for p in prereqs]
                    
                    can_unlock = True
                    if prereq_ids:
                        for pid in prereq_ids:
                            prereq_perf = (
                                db.query(StudentTopicPerformance)
                                .filter(
                                    StudentTopicPerformance.student_id == student_id,
                                    StudentTopicPerformance.topic_id == pid,
                                )
                                .first()
                            )
                            if not prereq_perf or float(prereq_perf.mastery_score) < 65.0:
                                can_unlock = False
                                break
                    
                    if can_unlock:
                        next_topic = t
                        break

            if next_topic:
                recommendations_to_create.append({
                    "recommendation_type": RecommendationType.NEXT_TOPIC,
                    "priority": 95.0,
                    "reason_code": "MASTERY_EXCEEDED_PROGRESS",
                    "explanation": (
                        f"Great work! You scored high on '{current_topic.title}' (Mastery: {mastery}%). "
                        f"Ready to unlock and study the next module: '{next_topic.title}'."
                    ),
                    "topic_id": next_topic.id,
                })
            else:
                # Top topic completed or course end reached -> Advanced Challenge
                recommendations_to_create.append({
                    "recommendation_type": RecommendationType.ADVANCED_PRACTICE,
                    "priority": 90.0,
                    "reason_code": "COURSE_MILESTONE_ADVANCED",
                    "explanation": (
                        f"Excellent! You have demonstrated strong proficiency across '{current_topic.title}'. "
                        f"Attempt our advanced challenge unit to push your boundaries."
                    ),
                    "topic_id": current_topic.id,
                })

        # 3. DEVELOPING MASTERY (50% - 79%)
        elif mastery >= self.DEVELOPING_THRESHOLD:
            recommendations_to_create.append({
                "recommendation_type": RecommendationType.TARGETED_PRACTICE,
                "priority": 88.0,
                "reason_code": "DEVELOPING_MASTERY_REINFORCEMENT",
                "explanation": (
                    f"You have a working grasp of '{current_topic.title}' (Mastery: {mastery}%). "
                    f"Review real-world examples and try targeted practice questions to reach proficiency."
                ),
                "topic_id": current_topic.id,
            })

        # 4. NEEDS SUPPORT (< 50%)
        else:
            # Check if prerequisites are weak
            prereqs = (
                db.query(TopicPrerequisite)
                .filter(TopicPrerequisite.topic_id == current_topic.id)
                .all()
            )
            weak_prereq: Optional[Topic] = None
            for p in prereqs:
                p_perf = (
                    db.query(StudentTopicPerformance)
                    .filter(
                        StudentTopicPerformance.student_id == student_id,
                        StudentTopicPerformance.topic_id == p.prerequisite_topic_id,
                    )
                    .first()
                )
                if not p_perf or float(p_perf.mastery_score) < 60.0:
                    weak_prereq = db.query(Topic).filter(Topic.id == p.prerequisite_topic_id).first()
                    break

            if weak_prereq:
                recommendations_to_create.append({
                    "recommendation_type": RecommendationType.PREREQUISITE_REVIEW,
                    "priority": 98.0,
                    "reason_code": "FOUNDATIONAL_GAP_DETECTED",
                    "explanation": (
                        f"Struggling with '{current_topic.title}'? We detected foundational gaps in "
                        f"prerequisite '{weak_prereq.title}'. A quick 5-min refresher is recommended."
                    ),
                    "topic_id": weak_prereq.id,
                })
            else:
                recommendations_to_create.append({
                    "recommendation_type": RecommendationType.SIMPLIFIED_CAPSULE,
                    "priority": 96.0,
                    "reason_code": "LOW_MASTERY_SIMPLIFIED_REVIEW",
                    "explanation": (
                        f"Your recent quiz indicates this concept needs another review. "
                        f"We prepared a simplified, step-by-step breakdown of '{current_topic.title}'."
                    ),
                    "topic_id": current_topic.id,
                })

        return recommendations_to_create


adaptive_engine = RuleBasedAdaptiveEngine()
