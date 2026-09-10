import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_user, get_current_trainer, get_current_student, verify_course_ownership
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User
from app.models.topic import Topic
from app.models.capsule import LearningCapsule, CapsuleSection, Video
from app.models.learning import StudentProgress
from app.models.enums import CapsuleStatus, CapsuleLevel, SectionType, GenerationType, EnrollmentStatus
from app.schemas.capsule import (
    LearningCapsuleCreate,
    LearningCapsuleUpdate,
    LearningCapsuleResponse,
    CapsuleProgressUpdate,
    CapsuleSectionResponse,
    VideoResponse,
)
from app.schemas.ai import AIGenerationRequest
from app.schemas.material import JobStatusResponse
from app.workers.ai_tasks import generate_ai_draft_sync
from app.workers.video_tasks import generate_video_sync

router = APIRouter(tags=["Capsules & AI Content"])


@router.post("/trainer/topics/{topic_id}/generations", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def request_ai_generation(
    topic_id: str,
    req: AIGenerationRequest,
    background_tasks: BackgroundTasks,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise NotFoundException("Topic", topic_id)
    verify_course_ownership(topic.course_id, current_trainer, db)

    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        generate_ai_draft_sync,
        topic_id=topic_id,
        generation_type=req.generation_type,
        trainer_id=current_trainer.id,
        level=req.level or "STANDARD",
        difficulty=req.difficulty or "MEDIUM",
        question_count=req.question_count or 4,
    )

    return JobStatusResponse(
        job_id=job_id,
        status="PROCESSING",
        entity_type="AI_GENERATION",
        entity_id=topic_id,
        message=f"AI generation job queued for {req.generation_type.value}. Results will appear in DRAFT state.",
        progress_percent=25,
    )


@router.get("/trainer/capsules/{capsule_id}", response_model=LearningCapsuleResponse)
def get_trainer_capsule(
    capsule_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
    if not capsule:
        raise NotFoundException("Capsule", capsule_id)
    verify_course_ownership(capsule.topic.course_id, current_trainer, db)

    return _to_capsule_response(capsule)


@router.patch("/trainer/capsules/{capsule_id}", response_model=LearningCapsuleResponse)
def update_trainer_capsule(
    capsule_id: str,
    req: LearningCapsuleUpdate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
    if not capsule:
        raise NotFoundException("Capsule", capsule_id)
    verify_course_ownership(capsule.topic.course_id, current_trainer, db)

    if req.title is not None:
        capsule.title = req.title
    if req.level is not None:
        capsule.level = req.level
    if req.estimated_minutes is not None:
        capsule.estimated_minutes = req.estimated_minutes
    if req.status is not None:
        capsule.status = req.status
        if req.status == CapsuleStatus.PUBLISHED and not capsule.published_at:
            capsule.published_at = datetime.now(timezone.utc)

    if req.sections is not None:
        db.query(CapsuleSection).filter(CapsuleSection.capsule_id == capsule.id).delete()
        for s in req.sections:
            sec = CapsuleSection(
                capsule_id=capsule.id,
                section_type=s.section_type,
                sequence_no=s.sequence_no,
                content_json=s.content_json,
            )
            db.add(sec)

    db.commit()
    db.refresh(capsule)
    return _to_capsule_response(capsule)


@router.post("/trainer/capsules/{capsule_id}/publish", response_model=LearningCapsuleResponse)
def publish_capsule(
    capsule_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
    if not capsule:
        raise NotFoundException("Capsule", capsule_id)
    verify_course_ownership(capsule.topic.course_id, current_trainer, db)

    capsule.status = CapsuleStatus.PUBLISHED
    capsule.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(capsule)
    return _to_capsule_response(capsule)


@router.post("/trainer/capsules/{capsule_id}/video", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_video_generation(
    capsule_id: str,
    background_tasks: BackgroundTasks,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
    if not capsule:
        raise NotFoundException("Capsule", capsule_id)
    verify_course_ownership(capsule.topic.course_id, current_trainer, db)

    background_tasks.add_task(generate_video_sync, capsule_id)
    return JobStatusResponse(
        job_id=str(uuid.uuid4()),
        status="PROCESSING",
        entity_type="VIDEO",
        entity_id=capsule_id,
        message="Video narration generation queued.",
        progress_percent=30,
    )


# --- Student Capsule Endpoints ---

@router.get("/capsules/{capsule_id}", response_model=LearningCapsuleResponse)
def get_student_capsule(
    capsule_id: str,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    capsule = (
        db.query(LearningCapsule)
        .filter(LearningCapsule.id == capsule_id, LearningCapsule.status == CapsuleStatus.PUBLISHED)
        .first()
    )
    if not capsule:
        raise NotFoundException("Published Capsule", capsule_id)

    return _to_capsule_response(capsule)


@router.post("/capsules/{capsule_id}/progress")
def update_capsule_progress(
    capsule_id: str,
    req: CapsuleProgressUpdate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
    if not capsule:
        raise NotFoundException("Capsule", capsule_id)

    progress = (
        db.query(StudentProgress)
        .filter(
            StudentProgress.student_id == current_student.id,
            StudentProgress.topic_id == capsule.topic_id,
        )
        .first()
    )

    now = datetime.now(timezone.utc)
    if not progress:
        progress = StudentProgress(
            student_id=current_student.id,
            course_id=capsule.topic.course_id,
            topic_id=capsule.topic_id,
            capsule_id=capsule.id,
            status=EnrollmentStatus.ACTIVE,
            completion_percent=req.completion_percent,
            time_spent_seconds=req.time_spent_seconds,
            last_accessed_at=now,
        )
        db.add(progress)
    else:
        progress.completion_percent = max(float(progress.completion_percent), req.completion_percent)
        progress.time_spent_seconds += req.time_spent_seconds
        progress.last_accessed_at = now

    db.commit()
    return {"message": "Progress recorded successfully", "completion_percent": float(progress.completion_percent)}


def _to_capsule_response(capsule: LearningCapsule) -> LearningCapsuleResponse:
    sections = [
        CapsuleSectionResponse(
            id=s.id,
            capsule_id=s.capsule_id,
            section_type=s.section_type,
            sequence_no=s.sequence_no,
            content_json=s.content_json,
        )
        for s in capsule.sections
    ]
    video_resp = None
    if capsule.video:
        video_resp = VideoResponse(
            id=capsule.video.id,
            capsule_id=capsule.video.capsule_id,
            script=capsule.video.script,
            duration_seconds=capsule.video.duration_seconds or 90,
            status=capsule.video.status.value,
            video_url=capsule.video.storage_key,
        )

    return LearningCapsuleResponse(
        id=capsule.id,
        topic_id=capsule.topic_id,
        version=capsule.version,
        level=capsule.level,
        title=capsule.title,
        status=capsule.status,
        estimated_minutes=capsule.estimated_minutes,
        created_by=capsule.created_by,
        published_at=capsule.published_at,
        created_at=capsule.created_at,
        sections=sections,
        video=video_resp,
    )
