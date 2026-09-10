import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    SmallInteger,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import QuizType, QuestionType, DifficultyLevel, AttemptStatus, CourseStatus


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(QuizType), nullable=False, default=QuizType.QUICK)
    title = Column(String(200), nullable=False)
    pass_score = Column(Numeric(5, 2), default=70.00, nullable=False)
    status = Column(SQLEnum(CourseStatus), nullable=False, default=CourseStatus.DRAFT)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    topic = relationship("Topic", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.sequence_no")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False, default=QuestionType.MCQ)
    difficulty = Column(SQLEnum(DifficultyLevel), nullable=False, default=DifficultyLevel.MEDIUM)
    explanation = Column(Text, nullable=True)
    sequence_no = Column(Integer, default=1, nullable=False)
    marks = Column(Numeric(5, 2), default=1.00, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    options = relationship("QuizOption", back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.sequence_no")


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    sequence_no = Column(SmallInteger, default=1, nullable=False)

    question = relationship("QuizQuestion", back_populates="options")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_no = Column(SmallInteger, default=1, nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    score = Column(Numeric(5, 2), default=0.00, nullable=False)
    percentage = Column(Numeric(5, 2), default=0.00, nullable=False)
    time_taken_seconds = Column(Integer, default=0, nullable=False)
    status = Column(SQLEnum(AttemptStatus), default=AttemptStatus.IN_PROGRESS, nullable=False)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", foreign_keys=[student_id])
    answers = relationship("QuizAnswer", back_populates="attempt", cascade="all, delete-orphan")


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String(36), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_id = Column(String(36), ForeignKey("quiz_options.id", ondelete="SET NULL"), nullable=True)
    answer_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, default=False, nullable=False)
    marks_awarded = Column(Numeric(5, 2), default=0.00, nullable=False)

    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("QuizQuestion")
    selected_option = relationship("QuizOption")
