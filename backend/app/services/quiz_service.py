from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.quiz import (
    Quiz,
    QuizQuestion,
    QuizOption,
    QuizAttempt,
    QuizAnswer,
)
from app.models.learning import StudentProgress, StudentTopicPerformance
from app.models.enums import AttemptStatus, EnrollmentStatus
from app.core.exceptions import NotFoundException, BadRequestException
from app.schemas.quiz import (
    QuizAttemptSubmit,
    QuizAttemptResultResponse,
    QuizAnswerResult,
)
from app.services.recommendation_service import recommendation_service


class QuizService:
    @staticmethod
    def grade_attempt(
        db: Session,
        quiz_id: str,
        student_id: str,
        submission: QuizAttemptSubmit,
    ) -> QuizAttemptResultResponse:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise NotFoundException("Quiz", quiz_id)

        # 1. Fetch questions and options
        questions = (
            db.query(QuizQuestion)
            .filter(QuizQuestion.quiz_id == quiz_id)
            .order_by(QuizQuestion.sequence_no)
            .all()
        )
        if not questions:
            raise BadRequestException("This quiz contains no questions.")

        question_map = {q.id: q for q in questions}

        # Determine attempt number
        prev_attempts_count = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.quiz_id == quiz_id, QuizAttempt.student_id == student_id)
            .count()
        )
        attempt_no = prev_attempts_count + 1

        now = datetime.now(timezone.utc)
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student_id,
            attempt_no=attempt_no,
            started_at=now,
            submitted_at=now,
            time_taken_seconds=submission.time_taken_seconds,
            status=AttemptStatus.SUBMITTED,
        )
        db.add(attempt)
        db.flush()

        total_possible_marks = sum([float(q.marks) for q in questions])
        total_awarded_marks = 0.0

        submission_answers_map = {a.question_id: a for a in submission.answers}
        answer_results: List[QuizAnswerResult] = []

        for q in questions:
            sub_ans = submission_answers_map.get(q.id)
            selected_option_id = sub_ans.selected_option_id if sub_ans else None
            answer_text = sub_ans.answer_text if sub_ans else None

            # Find correct option
            correct_opt = (
                db.query(QuizOption)
                .filter(QuizOption.question_id == q.id, QuizOption.is_correct == True)
                .first()
            )
            correct_option_id = correct_opt.id if correct_opt else None

            is_correct = False
            marks_awarded = 0.0

            if selected_option_id and correct_opt and selected_option_id == correct_opt.id:
                is_correct = True
                marks_awarded = float(q.marks)
                total_awarded_marks += marks_awarded

            # Record answer in DB
            db_answer = QuizAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option_id=selected_option_id,
                answer_text=answer_text,
                is_correct=is_correct,
                marks_awarded=marks_awarded,
            )
            db.add(db_answer)

            answer_results.append(
                QuizAnswerResult(
                    question_id=q.id,
                    question_text=q.question_text,
                    selected_option_id=selected_option_id,
                    correct_option_id=correct_option_id,
                    is_correct=is_correct,
                    marks_awarded=marks_awarded,
                    explanation=q.explanation,
                    difficulty=q.difficulty,
                )
            )

        percentage = (total_awarded_marks / total_possible_marks * 100.0) if total_possible_marks > 0 else 0.0
        percentage = round(percentage, 2)

        attempt.score = total_awarded_marks
        attempt.percentage = percentage
        db.commit()
        db.refresh(attempt)

        # 2. Update StudentProgress
        progress = (
            db.query(StudentProgress)
            .filter(
                StudentProgress.student_id == student_id,
                StudentProgress.topic_id == quiz.topic_id,
            )
            .first()
        )
        if not progress:
            topic = quiz.topic
            progress = StudentProgress(
                student_id=student_id,
                course_id=topic.course_id,
                topic_id=topic.id,
                status=EnrollmentStatus.ACTIVE,
                completion_percent=80.0,
                time_spent_seconds=submission.time_taken_seconds,
            )
            db.add(progress)
        else:
            progress.completion_percent = max(float(progress.completion_percent), 85.0)
            progress.time_spent_seconds += submission.time_taken_seconds
            progress.last_accessed_at = now
        db.commit()

        # 3. Trigger Closed-Loop Adaptive Update
        course_id = quiz.topic.course_id
        new_rec = recommendation_service.process_student_adaptive_update(
            db=db,
            student_id=student_id,
            course_id=course_id,
            topic_id=quiz.topic_id,
        )

        perf = (
            db.query(StudentTopicPerformance)
            .filter(
                StudentTopicPerformance.student_id == student_id,
                StudentTopicPerformance.topic_id == quiz.topic_id,
            )
            .first()
        )

        rec_dict = None
        if new_rec:
            rec_dict = {
                "id": new_rec.id,
                "recommendation_type": new_rec.recommendation_type.value,
                "reason_code": new_rec.reason_code,
                "explanation": new_rec.explanation,
                "priority": float(new_rec.priority),
            }

        return QuizAttemptResultResponse(
            id=attempt.id,
            quiz_id=quiz.id,
            quiz_title=quiz.title,
            student_id=student_id,
            attempt_no=attempt.attempt_no,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            score=float(attempt.score),
            percentage=float(attempt.percentage),
            pass_score=float(quiz.pass_score),
            passed=float(attempt.percentage) >= float(quiz.pass_score),
            time_taken_seconds=attempt.time_taken_seconds,
            status=attempt.status,
            answers=answer_results,
            mastery_updated=float(perf.mastery_score) if perf else percentage,
            strength_status=perf.strength_status.value if perf else "UNCERTAIN",
            next_recommendation=rec_dict,
        )


quiz_service = QuizService()
