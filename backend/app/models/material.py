import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    BigInteger,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import MaterialStatus


class Material(Base):
    __tablename__ = "materials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_name = Column(String(255), nullable=False)
    storage_key = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    status = Column(SQLEnum(MaterialStatus), nullable=False, default=MaterialStatus.PENDING)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="materials")
    chunks = relationship("MaterialChunk", back_populates="material", cascade="all, delete-orphan")
    processing_records = relationship("MaterialProcessing", back_populates="material", cascade="all, delete-orphan")


class MaterialProcessing(Base):
    __tablename__ = "material_processing"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id = Column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(MaterialStatus), nullable=False, default=MaterialStatus.PROCESSING)
    extractor = Column(String(80), nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    material = relationship("Material", back_populates="processing_records")


class MaterialChunk(Base):
    __tablename__ = "material_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id = Column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    source_locator = Column(JSON, nullable=True)  # e.g. {"page_number": 2, "slide_number": 1}

    material = relationship("Material", back_populates="chunks")
