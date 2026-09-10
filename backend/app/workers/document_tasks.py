from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.material import Material, MaterialProcessing, MaterialChunk
from app.models.enums import MaterialStatus
from app.document_processing.extractors import get_extractor_for_file
from app.document_processing.chunker import DocumentChunker
from app.services.storage_service import storage_service
from app.core.logging import logger


def process_material_document_sync(material_id: str):
    """
    Synchronously processes an uploaded document (can be called directly or via Celery).
    Extracts text, chunks with page/slide locator metadata, and stores in DB.
    """
    db = SessionLocal()
    try:
        material = db.query(Material).filter(Material.id == material_id).first()
        if not material:
            logger.error(f"Material {material_id} not found for processing.")
            return

        # Create processing entry
        proc = MaterialProcessing(
            material_id=material.id,
            status=MaterialStatus.PROCESSING,
            extractor="auto",
            started_at=datetime.now(timezone.utc),
        )
        db.add(proc)
        material.status = MaterialStatus.PROCESSING
        db.commit()

        # 1. Resolve path & extract
        abs_path = storage_service.get_absolute_path(material.storage_key)
        extractor = get_extractor_for_file(material.original_name)
        proc.extractor = extractor.__class__.__name__

        raw_units = extractor.extract(abs_path)

        # 2. Chunk text with page/slide references
        chunker = DocumentChunker(target_chunk_size=300, overlap_size=40)
        chunks_data = chunker.chunk_extracted_units(raw_units)

        # 3. Store chunks
        for c in chunks_data:
            chunk = MaterialChunk(
                material_id=material.id,
                topic_id=material.topic_id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                token_count=c["token_count"],
                source_locator=c["source_locator"],
            )
            db.add(chunk)

        proc.status = MaterialStatus.COMPLETED
        proc.completed_at = datetime.now(timezone.utc)
        material.status = MaterialStatus.COMPLETED
        db.commit()
        logger.info(f"Material {material_id} processed successfully. Created {len(chunks_data)} chunks.")

    except Exception as e:
        logger.error(f"Failed to process material {material_id}: {e}", exc_info=True)
        db.rollback()
        material = db.query(Material).filter(Material.id == material_id).first()
        if material:
            material.status = MaterialStatus.FAILED
        proc = (
            db.query(MaterialProcessing)
            .filter(MaterialProcessing.material_id == material_id)
            .order_by(MaterialProcessing.started_at.desc())
            .first()
        )
        if proc:
            proc.status = MaterialStatus.FAILED
            proc.error_message = str(e)
            proc.completed_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()


# Celery wrapper if Celery is used
try:
    from app.workers.celery_app import celery_app

    @celery_app.task(name="tasks.process_material_document")
    def process_material_document_task(material_id: str):
        process_material_document_sync(material_id)
except Exception:
    pass
