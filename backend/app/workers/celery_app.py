import os
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "learnflow_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.document_tasks",
        "app.workers.ai_tasks",
        "app.workers.video_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
