from app.ai.provider_base import AIProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.mock_provider import MockAIProvider
from app.core.config import settings


def get_ai_provider() -> AIProvider:
    provider_name = (settings.AI_PROVIDER or "mock").lower()
    if provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "openai":
        return OpenAIProvider()
    return MockAIProvider()


__all__ = ["AIProvider", "GeminiProvider", "OpenAIProvider", "MockAIProvider", "get_ai_provider"]
