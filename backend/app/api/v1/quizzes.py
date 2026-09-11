from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_user, get_current_trainer, get_current_student, verify_course_ownership
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User
from app.models.course import Course
from app.models.topic import Topic
from app.models.quiz import Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer
from app.models.enums import CourseStatus, UserRole
from app.schemas.quiz import (
    QuizCreate,
    QuizUpdate,
    QuizDeliveryResponse,
    QuizTrainerResponse,
    QuizQuestionPublic,
    QuizOptionPublic,
    QuizQuestionTrainer,
    QuizOptionTrainer,
    QuizAttemptSubmit,
    QuizAttemptResultResponse,
    QuizAnswerResult,
)
from app.services.quiz_service import quiz_service

router = APIRouter(tags=["Quizzes & Attempts"])


# --- Trainer Quiz Management ---

@router.get("/trainer/quizzes", response_model=List[QuizTrainerResponse])
def get_trainer_quizzes(
    topic_id: Optional[str] = None,
    course_id: Optional[str] = None,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Quiz)
        .join(Topic, Quiz.topic_id == Topic.id)
        .join(Course, Topic.course_id == Course.id)
        .filter(Course.trainer_id == current_trainer.id)
    )
    if topic_id:
        query = query.filter(Quiz.topic_id == topic_id)
    if course_id:
        query = query.filter(Course.id == course_id)

    quizzes = query.order_by(Quiz.created_at.desc()).all()
    return [_to_trainer_quiz_response(q) for q in quizzes]


@router.post("/trainer/quizzes", response_model=QuizTrainerResponse, status_code=status.HTTP_201_CREATED)
def create_trainer_quiz(
    req: QuizCreate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise NotFoundException("Topic", req.topic_id)
    verify_course_ownership(topic.course_id, current_trainer, db)

    quiz = Quiz(
        topic_id=req.topic_id,
        type=req.type,
        title=req.title,
        pass_score=req.pass_score,
        status=CourseStatus.DRAFT,
        version=1,
    )
    db.add(quiz)
    db.flush()

    for idx, q_data in enumerate(req.questions):
        question = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q_data.question_text,
            question_type=q_data.question_type,
            difficulty=q_data.difficulty,
            explanation=q_data.explanation,
            sequence_no=q_data.sequence_no or (idx + 1),
            marks=q_data.marks,
        )
        db.add(question)
        db.flush()

        for opt_idx, opt in enumerate(q_data.options):
            option = QuizOption(
                question_id=question.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                sequence_no=opt.sequence_no or (opt_idx + 1),
            )
            db.add(option)

    db.commit()
    db.refresh(quiz)
    return _to_trainer_quiz_response(quiz)


@router.get("/trainer/quizzes/{quiz_id}", response_model=QuizTrainerResponse)
def get_trainer_quiz(
    quiz_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise NotFoundException("Quiz", quiz_id)
    verify_course_ownership(quiz.topic.course_id, current_trainer, db)

    return _to_trainer_quiz_response(quiz)


@router.patch("/trainer/quizzes/{quiz_id}", response_model=QuizTrainerResponse)
def update_trainer_quiz(
    quiz_id: str,
    req: QuizUpdate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise NotFoundException("Quiz", quiz_id)
    verify_course_ownership(quiz.topic.course_id, current_trainer, db)

    if req.title is not None:
        quiz.title = req.title
    if req.pass_score is not None:
        quiz.pass_score = req.pass_score
    if req.status is not None:
        quiz.status = req.status

    if req.questions is not None:
        q_ids = [q.id for q in quiz.questions]
        if q_ids:
            db.query(QuizOption).filter(QuizOption.question_id.in_(q_ids)).delete(synchronize_session=False)
        db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).delete(synchronize_session=False)
        db.flush()

        for idx, q_data in enumerate(req.questions):
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_data.question_text,
                question_type=q_data.question_type,
                difficulty=q_data.difficulty,
                explanation=q_data.explanation,
                sequence_no=q_data.sequence_no or (idx + 1),
                marks=q_data.marks,
            )
            db.add(question)
            db.flush()

            for opt_idx, opt in enumerate(q_data.options):
                option = QuizOption(
                    question_id=question.id,
                    option_text=opt.option_text,
                    is_correct=opt.is_correct,
                    sequence_no=opt.sequence_no or (opt_idx + 1),
                )
                db.add(option)

    db.commit()
    db.refresh(quiz)
    return _to_trainer_quiz_response(quiz)


@router.post("/trainer/quizzes/{quiz_id}/publish", response_model=QuizTrainerResponse)
def publish_quiz(
    quiz_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise NotFoundException("Quiz", quiz_id)
    verify_course_ownership(quiz.topic.course_id, current_trainer, db)

    quiz.status = CourseStatus.PUBLISHED
    db.commit()
    db.refresh(quiz)
    return _to_trainer_quiz_response(quiz)


@router.post("/trainer/quizzes/{quiz_id}/unpublish", response_model=QuizTrainerResponse)
def unpublish_quiz(
    quiz_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise NotFoundException("Quiz", quiz_id)
    verify_course_ownership(quiz.topic.course_id, current_trainer, db)

    quiz.status = CourseStatus.DRAFT
    db.commit()
    db.refresh(quiz)
    return _to_trainer_quiz_response(quiz)


@router.delete("/trainer/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trainer_quiz(
    quiz_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise NotFoundException("Quiz", quiz_id)
    verify_course_ownership(quiz.topic.course_id, current_trainer, db)

    q_ids = [q.id for q in quiz.questions]
    if q_ids:
        db.query(QuizOption).filter(QuizOption.question_id.in_(q_ids)).delete(synchronize_session=False)
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).delete(synchronize_session=False)
    db.delete(quiz)
    db.commit()
    return None


# --- Student Quiz Delivery & Submissions ---

@router.get("/quizzes/{quiz_id}", response_model=QuizDeliveryResponse)
def get_quiz_for_student(
    quiz_id: str,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    CRITICAL SECURITY CONTRACT:
    Delivers quiz questions to student WITHOUT returning 'is_correct' or answer keys.
    """
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id, Quiz.status == CourseStatus.PUBLISHED)
        .first()
    )
    if not quiz:
        raise NotFoundException("Published Quiz", quiz_id)

    public_questions = []
    for q in quiz.questions:
        public_options = [
            QuizOptionPublic(id=opt.id, option_text=opt.option_text, sequence_no=opt.sequence_no)
            for opt in q.options
        ]
        public_questions.append(
            QuizQuestionPublic(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                difficulty=q.difficulty,
                sequence_no=q.sequence_no,
                marks=float(q.marks),
                options=public_options,
            )
        )

    return QuizDeliveryResponse(
        id=quiz.id,
        topic_id=quiz.topic_id,
        type=quiz.type,
        title=quiz.title,
        pass_score=float(quiz.pass_score),
        status=quiz.status,
        questions=public_questions,
    )


@router.post("/quizzes/{quiz_id}/attempts", response_model=QuizAttemptResultResponse)
def submit_quiz_attempt(
    quiz_id: str,
    submission: QuizAttemptSubmit,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Evaluates answers strictly server-side, saves attempt, recalculates topic mastery,
    and returns graded results along with newly triggered adaptive recommendation!
    """
    return quiz_service.grade_attempt(
        db=db,
        quiz_id=quiz_id,
        student_id=current_student.id,
        submission=submission,
    )


@router.get("/attempts/{attempt_id}/result", response_model=QuizAttemptResultResponse)
def get_attempt_result(
    attempt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise NotFoundException("Quiz Attempt", attempt_id)

    # Check ownership if student
    if current_user.role == UserRole.STUDENT and attempt.student_id != current_user.id:
        raise ForbiddenException("You cannot view results for other students.")

    quiz = attempt.quiz
    answer_results = []
    for ans in attempt.answers:
        q = ans.question
        correct_opt = db.query(QuizOption).filter(QuizOption.question_id == q.id, QuizOption.is_correct == True).first()
        answer_results.append(
            QuizAnswerResult(
                question_id=q.id,
                question_text=q.question_text,
                selected_option_id=ans.selected_option_id,
                correct_option_id=correct_opt.id if correct_opt else None,
                is_correct=ans.is_correct,
                marks_awarded=float(ans.marks_awarded),
                explanation=q.explanation,
                difficulty=q.difficulty,
            )
        )

    return QuizAttemptResultResponse(
        id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        student_id=attempt.student_id,
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
        mastery_updated=float(attempt.percentage),
        strength_status="EVALUATED",
    )


def _to_trainer_quiz_response(quiz: Quiz) -> QuizTrainerResponse:
    questions = []
    sorted_questions = sorted(quiz.questions, key=lambda x: x.sequence_no or 0) if quiz.questions else []
    for q in sorted_questions:
        sorted_opts = sorted(q.options, key=lambda x: x.sequence_no or 0) if q.options else []
        options = [
            QuizOptionTrainer(
                id=opt.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                sequence_no=opt.sequence_no,
            )
            for opt in sorted_opts
        ]
        questions.append(
            QuizQuestionTrainer(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                difficulty=q.difficulty,
                explanation=q.explanation,
                sequence_no=q.sequence_no,
                marks=float(q.marks),
                options=options,
            )
        )

    topic_title = quiz.topic.title if quiz.topic else None
    course_title = quiz.topic.course.title if (quiz.topic and quiz.topic.course) else None

    return QuizTrainerResponse(
        id=quiz.id,
        topic_id=quiz.topic_id,
        topic_title=topic_title,
        course_title=course_title,
        type=quiz.type,
        title=quiz.title,
        pass_score=float(quiz.pass_score),
        status=quiz.status,
        version=quiz.version,
        created_at=quiz.created_at,
        questions=questions,
    )
