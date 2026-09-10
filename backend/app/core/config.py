import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LearnFlow - AI-Powered Adaptive Micro-Learning Portal"

    # Database
    DATABASE_URL: str = "sqlite:///./learnflow.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & JWT
    JWT_SECRET_KEY: str = "learnflow_development_secret_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost",
    ]

    # AI
    AI_PROVIDER: str = "mock"  # "mock", "gemini", or "openai"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Storage
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../storage"))
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "pptx", "docx", "txt"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
os.makedirs(os.path.join(settings.STORAGE_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "videos"), exist_ok=True)
