import asyncio
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.capsule import LearningCapsule, Video
from app.models.enums import VideoStatus
from app.ai import get_ai_provider
from app.core.logging import logger


def generate_video_sync(capsule_id: str):
    """
    Video rendering worker placeholder:
    Generates narration script, produces slide scenes and marks Video record as READY.
    """
    db = SessionLocal()
    ai_provider = get_ai_provider()

    try:
        capsule = db.query(LearningCapsule).filter(LearningCapsule.id == capsule_id).first()
        if not capsule:
            logger.error(f"Capsule {capsule_id} not found for video generation.")
            return

        video = db.query(Video).filter(Video.capsule_id == capsule_id).first()
        if not video:
            video = Video(
                capsule_id=capsule_id,
                script="Loading script...",
                duration_seconds=90,
                status=VideoStatus.PROCESSING,
            )
            db.add(video)
            db.commit()

        video.status = VideoStatus.PROCESSING
        db.commit()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        script_output = loop.run_until_complete(
            ai_provider.generate_video_script(
                topic_title=capsule.title,
                capsule_data={"title": capsule.title},
            )
        )
        loop.close()

        full_script = "\n".join([f"Scene {s['scene_no']}: {s['narration']}" for s in script_output.scenes])
        video.script = full_script
        video.duration_seconds = script_output.duration_estimate_seconds
        video.storage_key = "videos/sample_micro_lesson.mp4"
        video.status = VideoStatus.READY
        db.commit()
        logger.info(f"Video for capsule {capsule_id} is ready.")

    except Exception as e:
        logger.error(f"Video generation failed for capsule {capsule_id}: {e}")
        db.rollback()
        video = db.query(Video).filter(Video.capsule_id == capsule_id).first()
        if video:
            video.status = VideoStatus.FAILED
            db.commit()
    finally:
        db.close()


# Celery task wrapper
try:
    from app.workers.celery_app import celery_app

    @celery_app.task(name="tasks.generate_video")
    def generate_video_task(capsule_id: str):
        generate_video_sync(capsule_id)
except Exception:
    pass
