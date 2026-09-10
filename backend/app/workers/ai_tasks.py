import asyncio
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.topic import Topic
from app.models.course import Course
from app.models.material import MaterialChunk
from app.models.capsule import LearningCapsule, CapsuleSection
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.models.ai import AIGeneration
from app.models.enums import (
    GenerationType,
    CapsuleStatus,
    CapsuleLevel,
    SectionType,
    CourseStatus,
    QuizType,
    QuestionType,
    DifficultyLevel,
)
from app.ai import get_ai_provider
from app.core.logging import logger


def generate_ai_draft_sync(
    topic_id: str,
    generation_type: GenerationType,
    trainer_id: str,
    level: str = "STANDARD",
    difficulty: str = "MEDIUM",
    question_count: int = 4,
):
    """
    Executes AI generation, validates structured JSON via Pydantic, and saves as DRAFT in DB.
    """
    db = SessionLocal()
    ai_provider = get_ai_provider()

    try:
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            logger.error(f"Topic {topic_id} not found for AI draft generation.")
            return

        course = topic.course

        # Fetch source chunks associated with topic or course
        chunks = (
            db.query(MaterialChunk)
            .filter(
                (MaterialChunk.topic_id == topic_id) | (MaterialChunk.material.has(course_id=course.id))
            )
            .limit(15)
            .all()
        )
        chunks_data = [
            {"id": c.id, "content": c.content, "source_locator": c.source_locator}
            for c in chunks
        ]

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        if generation_type == GenerationType.CAPSULE:
            capsule_output = loop.run_until_complete(
                ai_provider.generate_capsule(
                    topic_title=topic.title,
                    level=level,
                    course_title=course.title,
                    source_chunks=chunks_data,
                )
            )

            # Record AI Generation
            ai_record = AIGeneration(
                topic_id=topic.id,
                generation_type=GenerationType.CAPSULE,
                provider=ai_provider.__class__.__name__,
                model="configured",
                prompt_version="v1.2",
                result_json=capsule_output.model_dump(),
                status=CapsuleStatus.DRAFT,
                reviewed_by=None,
            )
            db.add(ai_record)

            # Create or update Draft LearningCapsule
            capsule = (
                db.query(LearningCapsule)
                .filter(LearningCapsule.topic_id == topic.id, LearningCapsule.status == CapsuleStatus.DRAFT)
                .first()
            )
            if not capsule:
                capsule = LearningCapsule(
                    topic_id=topic.id,
                    version=1,
                    level=CapsuleLevel.STANDARD if level == "STANDARD" else (CapsuleLevel.BASIC if level == "BASIC" else CapsuleLevel.ADVANCED),
                    title=capsule_output.title,
                    status=CapsuleStatus.DRAFT,
                    estimated_minutes=capsule_output.estimated_minutes,
                    created_by=trainer_id,
                )
                db.add(capsule)
                db.flush()
            else:
                capsule.title = capsule_output.title
                capsule.estimated_minutes = capsule_output.estimated_minutes
                # Clear previous sections
                db.query(CapsuleSection).filter(CapsuleSection.capsule_id == capsule.id).delete()

            # Add structured sections
            sections = [
                CapsuleSection(
                    capsule_id=capsule.id,
                    section_type=SectionType.SUMMARY,
                    sequence_no=1,
                    content_json={"explanation": capsule_output.standard_explanation},
                ),
                CapsuleSection(
                    capsule_id=capsule.id,
                    section_type=SectionType.KEY_POINTS,
                    sequence_no=2,
                    content_json={"points": capsule_output.key_points, "objectives": capsule_output.learning_objectives},
                ),
                CapsuleSection(
                    capsule_id=capsule.id,
                    section_type=SectionType.SIMPLE_EXPLANATION,
                    sequence_no=3,
                    content_json={"simple_explanation": capsule_output.simple_explanation},
                ),
                CapsuleSection(
                    capsule_id=capsule.id,
                    section_type=SectionType.EXAMPLE,
                    sequence_no=4,
                    content_json={"example": capsule_output.real_world_example},
                ),
                CapsuleSection(
                    capsule_id=capsule.id,
                    section_type=SectionType.RECAP,
                    sequence_no=5,
                    content_json={"recap_question": capsule_output.recap_question},
                ),
            ]
            db.add_all(sections)
            db.commit()
            logger.info(f"Generated draft capsule {capsule.id} for topic {topic.title}")

        elif generation_type == GenerationType.QUIZ:
            quiz_output = loop.run_until_complete(
                ai_provider.generate_quiz(
                    topic_title=topic.title,
                    difficulty=difficulty,
                    question_count=question_count,
                    source_chunks=chunks_data,
                )
            )

            # Record AI Generation
            ai_record = AIGeneration(
                topic_id=topic.id,
                generation_type=GenerationType.QUIZ,
                provider=ai_provider.__class__.__name__,
                model="configured",
                prompt_version="v1.1",
                result_json=quiz_output.model_dump(),
                status=CapsuleStatus.DRAFT,
            )
            db.add(ai_record)

            # Create or update Draft Quiz
            quiz = (
                db.query(Quiz)
                .filter(Quiz.topic_id == topic.id, Quiz.status == CourseStatus.DRAFT)
                .first()
            )
            if not quiz:
                quiz = Quiz(
                    topic_id=topic.id,
                    type=QuizType.QUICK,
                    title=quiz_output.title,
                    pass_score=70.0,
                    status=CourseStatus.DRAFT,
                    version=1,
                )
                db.add(quiz)
                db.flush()
            else:
                quiz.title = quiz_output.title
                db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).delete()

            # Insert Questions & Options
            for idx, q_data in enumerate(quiz_output.questions):
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q_data.question_text,
                    question_type=QuestionType.MCQ,
                    difficulty=q_data.difficulty,
                    explanation=q_data.explanation,
                    sequence_no=idx + 1,
                    marks=1.0,
                )
                db.add(question)
                db.flush()

                for opt_idx, opt_text in enumerate(q_data.options):
                    is_corr = (opt_idx == q_data.correct_option_index)
                    option = QuizOption(
                        question_id=question.id,
                        option_text=opt_text,
                        is_correct=is_corr,
                        sequence_no=opt_idx + 1,
                    )
                    db.add(option)

            db.commit()
            logger.info(f"Generated draft quiz {quiz.id} with {len(quiz_output.questions)} questions.")

        loop.close()

    except Exception as e:
        logger.error(f"Error in AI draft generation task for topic {topic_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


# Celery wrapper
try:
    from app.workers.celery_app import celery_app

    @celery_app.task(name="tasks.generate_ai_draft")
    def generate_ai_draft_task(topic_id: str, generation_type: str, trainer_id: str, **kwargs):
        generate_ai_draft_sync(topic_id, GenerationType(generation_type), trainer_id, **kwargs)
except Exception:
    pass
