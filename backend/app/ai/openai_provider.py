import json
from typing import List, Dict, Any
import httpx
from app.ai.provider_base import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.core.config import settings
from app.core.logging import logger
from app.schemas.ai import (
    StructuredCapsuleOutput,
    StructuredQuizOutput,
    StructuredTopicExtractionOutput,
    StructuredVideoScript,
)


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str = "", model: str = "gpt-4o-mini"):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.fallback = MockAIProvider()

    async def _call_openai_api(self, messages: list, response_format_schema: dict) -> dict:
        if not self.api_key:
            return None

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "structured_output",
                    "strict": True,
                    "schema": response_format_schema,
                },
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                logger.error(f"OpenAI API error: {response.text}")
                raise Exception(f"OpenAI API error: {response.status_code}")
            
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"]
            return json.loads(raw_text)

    async def generate_capsule(
        self,
        topic_title: str,
        level: str,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredCapsuleOutput:
        if not self.api_key:
            return await self.fallback.generate_capsule(topic_title, level, course_title, source_chunks)
        
        chunks_text = "\n---\n".join([f"Chunk ID {c.get('id')}:\n{c.get('content')}" for c in source_chunks])
        messages = [
            {"role": "system", "content": "You are an expert pedagogical assistant. Generate structured micro-learning capsules."},
            {"role": "user", "content": f"Topic: '{topic_title}' (Level: {level}) in Course: '{course_title}'. Source text:\n{chunks_text}"},
        ]
        try:
            result = await self._call_openai_api(messages, StructuredCapsuleOutput.model_json_schema())
            return StructuredCapsuleOutput.model_validate(result)
        except Exception as e:
            logger.warning(f"OpenAI error: {e}. Using fallback.")
            return await self.fallback.generate_capsule(topic_title, level, course_title, source_chunks)

    async def generate_quiz(
        self,
        topic_title: str,
        difficulty: str,
        question_count: int,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredQuizOutput:
        if not self.api_key:
            return await self.fallback.generate_quiz(topic_title, difficulty, question_count, source_chunks)

        chunks_text = "\n---\n".join([f"Chunk ID {c.get('id')}:\n{c.get('content')}" for c in source_chunks])
        messages = [
            {"role": "system", "content": "You generate high-quality conceptual assessment quizzes."},
            {"role": "user", "content": f"Generate {question_count} {difficulty} questions for '{topic_title}'. Source text:\n{chunks_text}"},
        ]
        try:
            result = await self._call_openai_api(messages, StructuredQuizOutput.model_json_schema())
            return StructuredQuizOutput.model_validate(result)
        except Exception as e:
            return await self.fallback.generate_quiz(topic_title, difficulty, question_count, source_chunks)

    async def extract_topics(
        self,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredTopicExtractionOutput:
        return await self.fallback.extract_topics(course_title, source_chunks)

    async def generate_video_script(
        self,
        topic_title: str,
        capsule_data: Dict[str, Any],
    ) -> StructuredVideoScript:
        return await self.fallback.generate_video_script(topic_title, capsule_data)
