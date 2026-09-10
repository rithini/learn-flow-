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


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str = "", model: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.fallback = MockAIProvider()

    async def _call_gemini_api(self, prompt: str, schema_dict: dict) -> dict:
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not provided, using mock provider fallback.")
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": schema_dict,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.text}")
                raise Exception(f"Gemini API error: {response.status_code}")
            
            data = response.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
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
        prompt = (
            f"Generate a structured micro-learning capsule for Topic: '{topic_title}' (Level: {level}) "
            f"in Course: '{course_title}'. Base your explanation strictly on the following source material:\n{chunks_text}"
        )
        try:
            result = await self._call_gemini_api(prompt, StructuredCapsuleOutput.model_json_schema())
            return StructuredCapsuleOutput.model_validate(result)
        except Exception as e:
            logger.warning(f"Gemini generation failed: {e}. Falling back to deterministic generator.")
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
        prompt = (
            f"Generate {question_count} {difficulty} difficulty multiple choice questions for '{topic_title}'. "
            f"Base questions strictly on:\n{chunks_text}"
        )
        try:
            result = await self._call_gemini_api(prompt, StructuredQuizOutput.model_json_schema())
            return StructuredQuizOutput.model_validate(result)
        except Exception as e:
            logger.warning(f"Gemini quiz generation failed: {e}. Falling back to deterministic generator.")
            return await self.fallback.generate_quiz(topic_title, difficulty, question_count, source_chunks)

    async def extract_topics(
        self,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredTopicExtractionOutput:
        if not self.api_key:
            return await self.fallback.extract_topics(course_title, source_chunks)
        
        chunks_text = "\n---\n".join([c.get('content', '') for c in source_chunks[:10]])
        prompt = f"Extract a structured syllabus of topics for course '{course_title}' from:\n{chunks_text}"
        try:
            result = await self._call_gemini_api(prompt, StructuredTopicExtractionOutput.model_json_schema())
            return StructuredTopicExtractionOutput.model_validate(result)
        except Exception as e:
            logger.warning(f"Gemini topic extraction failed: {e}. Falling back.")
            return await self.fallback.extract_topics(course_title, source_chunks)

    async def generate_video_script(
        self,
        topic_title: str,
        capsule_data: Dict[str, Any],
    ) -> StructuredVideoScript:
        if not self.api_key:
            return await self.fallback.generate_video_script(topic_title, capsule_data)
        
        prompt = f"Generate a concise 90-second slide-by-slide video script for topic '{topic_title}' from capsule content: {json.dumps(capsule_data)}"
        try:
            result = await self._call_gemini_api(prompt, StructuredVideoScript.model_json_schema())
            return StructuredVideoScript.model_validate(result)
        except Exception as e:
            return await self.fallback.generate_video_script(topic_title, capsule_data)
