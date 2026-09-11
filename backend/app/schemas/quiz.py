from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import QuizType, QuestionType, DifficultyLevel, AttemptStatus, CourseStatus


# --- Option Schemas ---
class QuizOptionCreate(BaseModel):
    option_text: str
    is_correct: bool = False
    sequence_no: int = 1


class QuizOptionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    option_text: str
    sequence_no: int


class QuizOptionTrainer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    option_text: str
    is_correct: bool
    sequence_no: int


# --- Question Schemas ---
class QuizQuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.MCQ
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    explanation: Optional[str] = None
    sequence_no: int = 1
    marks: float = 1.0
    options: List[QuizOptionCreate]


class QuizQuestionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    sequence_no: int
    marks: float
    options: List[QuizOptionPublic]


class QuizQuestionTrainer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    explanation: Optional[str] = None
    sequence_no: int
    marks: float
    options: List[QuizOptionTrainer]


# --- Quiz Schemas ---
class QuizCreate(BaseModel):
    topic_id: str
    type: QuizType = QuizType.QUICK
    title: str = Field(..., min_length=2, max_length=200)
    pass_score: float = 70.0
    questions: List[QuizQuestionCreate]


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    pass_score: Optional[float] = None
    status: Optional[CourseStatus] = None
    questions: Optional[List[QuizQuestionCreate]] = None


# Public Quiz delivery for student taking the quiz (NO answer keys)
class QuizDeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic_id: str
    type: QuizType
    title: str
    pass_score: float
    status: CourseStatus
    questions: List[QuizQuestionPublic]


# Full Quiz response for Trainer
class QuizTrainerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic_id: str
    topic_title: Optional[str] = None
    course_title: Optional[str] = None
    type: QuizType
    title: str
    pass_score: float
    status: CourseStatus
    version: int
    created_at: datetime
    questions: List[QuizQuestionTrainer]


# --- Attempt & Submission Schemas ---
class QuizAnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    answer_text: Optional[str] = None


class QuizAttemptSubmit(BaseModel):
    answers: List[QuizAnswerSubmission]
    time_taken_seconds: int = Field(..., ge=0)


class QuizAnswerResult(BaseModel):
    question_id: str
    question_text: str
    selected_option_id: Optional[str] = None
    correct_option_id: Optional[str] = None
    is_correct: bool
    marks_awarded: float
    explanation: Optional[str] = None
    difficulty: DifficultyLevel


class QuizAttemptResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    quiz_id: str
    quiz_title: str
    student_id: str
    attempt_no: int
    started_at: datetime
    submitted_at: Optional[datetime] = None
    score: float
    percentage: float
    pass_score: float
    passed: bool
    time_taken_seconds: int
    status: AttemptStatus
    answers: List[QuizAnswerResult]
    mastery_updated: float
    strength_status: str
    next_recommendation: Optional[dict] = None
