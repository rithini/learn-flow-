from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import MaterialStatus


class MaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    topic_id: Optional[str] = None
    uploaded_by: str
    original_name: str
    mime_type: str
    size_bytes: int
    status: MaterialStatus
    created_at: datetime
    chunk_count: int = 0


class MaterialChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    material_id: str
    topic_id: Optional[str] = None
    chunk_index: int
    content: str
    token_count: int
    source_locator: Optional[Dict[str, Any]] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    entity_type: str
    entity_id: str
    message: Optional[str] = None
    progress_percent: int = 0
    error: Optional[str] = None
