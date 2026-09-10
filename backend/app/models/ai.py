import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    JSON,
)
from app.db.base import Base
from app.models.enums import GenerationType, CapsuleStatus


class AIGeneration(Base):
    __tablename__ = "ai_generations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id = Column(String(36), ForeignKey("materials.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    generation_type = Column(SQLEnum(GenerationType), nullable=False)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    prompt_version = Column(String(30), default="v1.0", nullable=False)
    input_hash = Column(String(64), nullable=True)
    result_json = Column(JSON, nullable=False)
    status = Column(SQLEnum(CapsuleStatus), default=CapsuleStatus.DRAFT, nullable=False)
    reviewed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
