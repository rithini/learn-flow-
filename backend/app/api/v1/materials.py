import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_trainer, verify_course_ownership
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.user import User
from app.models.material import Material, MaterialProcessing, MaterialChunk
from app.models.enums import MaterialStatus
from app.schemas.material import MaterialResponse, JobStatusResponse
from app.services.storage_service import storage_service
from app.workers.document_tasks import process_material_document_sync

router = APIRouter(tags=["Materials & Ingestion"])


@router.get("/trainer/materials", response_model=List[MaterialResponse])
def list_materials(
    course_id: Optional[str] = None,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    q = db.query(Material).filter(Material.uploaded_by == current_trainer.id)
    if course_id:
        q = q.filter(Material.course_id == course_id)
    materials = q.order_by(Material.created_at.desc()).all()

    results = []
    for m in materials:
        chunk_count = db.query(MaterialChunk).filter(MaterialChunk.material_id == m.id).count()
        results.append(
            MaterialResponse(
                id=m.id,
                course_id=m.course_id,
                topic_id=m.topic_id,
                uploaded_by=m.uploaded_by,
                original_name=m.original_name,
                mime_type=m.mime_type,
                size_bytes=m.size_bytes,
                status=m.status,
                created_at=m.created_at,
                chunk_count=chunk_count,
            )
        )
    return results


@router.post("/trainer/materials", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_material(
    background_tasks: BackgroundTasks,
    course_id: str = Form(...),
    topic_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    verify_course_ownership(course_id, current_trainer, db)

    storage_key, filename, size_bytes, mime_type = await storage_service.save_upload_file(file)

    material = Material(
        course_id=course_id,
        topic_id=topic_id if topic_id else None,
        uploaded_by=current_trainer.id,
        original_name=filename,
        storage_key=storage_key,
        mime_type=mime_type,
        size_bytes=size_bytes,
        status=MaterialStatus.PENDING,
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # Trigger background document extraction
    background_tasks.add_task(process_material_document_sync, material.id)

    return JobStatusResponse(
        job_id=str(uuid.uuid4()),
        status="PROCESSING",
        entity_type="MATERIAL",
        entity_id=material.id,
        message=f"File '{filename}' uploaded successfully. Processing background job started.",
        progress_percent=15,
    )


@router.post("/trainer/materials/{material_id}/process", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def reprocess_material(
    material_id: str,
    background_tasks: BackgroundTasks,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise NotFoundException("Material", material_id)
    verify_course_ownership(material.course_id, current_trainer, db)

    background_tasks.add_task(process_material_document_sync, material.id)

    return JobStatusResponse(
        job_id=str(uuid.uuid4()),
        status="PROCESSING",
        entity_type="MATERIAL",
        entity_id=material.id,
        message="Document reprocessing queued.",
        progress_percent=20,
    )


@router.get("/trainer/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    # Retrieve recent processing state
    proc = (
        db.query(MaterialProcessing)
        .order_by(MaterialProcessing.started_at.desc())
        .first()
    )
    if proc:
        return JobStatusResponse(
            job_id=job_id,
            status=proc.status.value,
            entity_type="MATERIAL",
            entity_id=proc.material_id,
            message="Document processing completed." if proc.status == MaterialStatus.COMPLETED else "Document extraction in progress...",
            progress_percent=100 if proc.status == MaterialStatus.COMPLETED else 50,
            error=proc.error_message,
        )

    return JobStatusResponse(
        job_id=job_id,
        status="COMPLETED",
        entity_type="JOB",
        entity_id=job_id,
        message="Job finished.",
        progress_percent=100,
    )
