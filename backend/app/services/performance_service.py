from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.topic import Topic, TopicPrerequisite
from app.models.quiz import Quiz, QuizAttempt
from app.models.learning import StudentProgress, StudentTopicPerformance
from app.models.enums import StrengthStatus, AttemptStatus


class PerformanceService:
    @staticmethod
    def calculate_topic_mastery(
        db: Session,
        student_id: str,
        topic_id: str,
    ) -> StudentTopicPerformance:
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None

        # 1. Fetch all completed quiz attempts for this topic
        quizzes = db.query(Quiz).filter(Quiz.topic_id == topic_id).all()
        quiz_ids = [q.id for q in quizzes]

        attempts = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.student_id == student_id,
                QuizAttempt.quiz_id.in_(quiz_ids),
                QuizAttempt.status == AttemptStatus.SUBMITTED,
            )
            .order_by(desc(QuizAttempt.submitted_at))
            .all()
        )

        attempt_count = len(attempts)

        # 2. Calculate recent assessment accuracy (recency-weighted)
        if attempt_count == 0:
            recent_accuracy = 0.0
            improvement_trend = 50.0  # Neutral baseline
        elif attempt_count == 1:
            recent_accuracy = float(attempts[0].percentage)
            improvement_trend = 50.0
        else:
            # Weighted: 60% latest, 30% 2nd latest, 10% 3rd latest (or older)
            p1 = float(attempts[0].percentage)
            p2 = float(attempts[1].percentage)
            p3 = float(attempts[2].percentage) if attempt_count > 2 else p2
            recent_accuracy = (0.60 * p1) + (0.30 * p2) + (0.10 * p3)

            # Trend: delta between p1 and p2 scaled around 50
            delta = p1 - p2
            improvement_trend = max(0.0, min(100.0, 50.0 + (delta * 0.75)))

        # 3. Calculate completion quality from student progress
        progress_record = (
            db.query(StudentProgress)
            .filter(
                StudentProgress.student_id == student_id,
                StudentProgress.topic_id == topic_id,
            )
            .first()
        )
        completion_quality = float(progress_record.completion_percent) if progress_record else 0.0

        # 4. Calculate prerequisite mastery
        prereq_records = (
            db.query(TopicPrerequisite)
            .filter(TopicPrerequisite.topic_id == topic_id)
            .all()
        )
        prereq_ids = [p.prerequisite_topic_id for p in prereq_records]

        if prereq_ids:
            prereq_performances = (
                db.query(StudentTopicPerformance)
                .filter(
                    StudentTopicPerformance.student_id == student_id,
                    StudentTopicPerformance.topic_id.in_(prereq_ids),
                )
                .all()
            )
            if prereq_performances:
                prereq_mastery = sum([float(p.mastery_score) for p in prereq_performances]) / len(prereq_performances)
            else:
                prereq_mastery = 50.0  # Assumed default
        else:
            prereq_mastery = 100.0  # No prerequisites required

        # 5. Compute mastery score using weighted formula:
        # mastery = 0.55 * recent_accuracy + 0.20 * completion_quality + 0.15 * improvement_trend + 0.10 * prerequisite_mastery
        mastery_score = (
            (0.55 * recent_accuracy)
            + (0.20 * completion_quality)
            + (0.15 * improvement_trend)
            + (0.10 * prereq_mastery)
        )
        mastery_score = max(0.0, min(100.0, round(mastery_score, 2)))

        # 6. Compute confidence score
        if attempt_count == 0:
            confidence_score = 0.0
        elif attempt_count == 1:
            confidence_score = 45.0
        elif attempt_count == 2:
            confidence_score = 75.0
        else:
            confidence_score = min(100.0, 85.0 + (attempt_count * 3))

        # 7. Classify strength status
        if confidence_score < 40.0 and attempt_count < 2:
            strength_status = StrengthStatus.UNCERTAIN
        elif mastery_score >= 80.0:
            strength_status = StrengthStatus.STRONG
        elif mastery_score >= 50.0:
            strength_status = StrengthStatus.DEVELOPING
        else:
            strength_status = StrengthStatus.NEEDS_SUPPORT

        # 8. Upsert StudentTopicPerformance
        perf = (
            db.query(StudentTopicPerformance)
            .filter(
                StudentTopicPerformance.student_id == student_id,
                StudentTopicPerformance.topic_id == topic_id,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if not perf:
            perf = StudentTopicPerformance(
                student_id=student_id,
                topic_id=topic_id,
                mastery_score=mastery_score,
                confidence_score=confidence_score,
                strength_status=strength_status,
                attempt_count=attempt_count,
                recent_accuracy=recent_accuracy,
                completion_quality=completion_quality,
                last_assessed_at=attempts[0].submitted_at if attempts else now,
                updated_at=now,
            )
            db.add(perf)
        else:
            perf.mastery_score = mastery_score
            perf.confidence_score = confidence_score
            perf.strength_status = strength_status
            perf.attempt_count = attempt_count
            perf.recent_accuracy = recent_accuracy
            perf.completion_quality = completion_quality
            perf.last_assessed_at = attempts[0].submitted_at if attempts else now
            perf.updated_at = now

        db.commit()
        db.refresh(perf)
        return perf


performance_service = PerformanceService()
