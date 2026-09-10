from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.schemas.ai import (
    StructuredCapsuleOutput,
    StructuredQuizOutput,
    StructuredTopicExtractionOutput,
    StructuredVideoScript,
)


class AIProvider(ABC):
    @abstractmethod
    async def generate_capsule(
        self,
        topic_title: str,
        level: str,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredCapsuleOutput:
        pass

    @abstractmethod
    async def generate_quiz(
        self,
        topic_title: str,
        difficulty: str,
        question_count: int,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredQuizOutput:
        pass

    @abstractmethod
    async def extract_topics(
        self,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredTopicExtractionOutput:
        pass

    @abstractmethod
    async def generate_video_script(
        self,
        topic_title: str,
        capsule_data: Dict[str, Any],
    ) -> StructuredVideoScript:
        pass
