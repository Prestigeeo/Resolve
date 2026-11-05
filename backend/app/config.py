import os
from pydantic_settings import BaseSettings
from typing import Optional, Literal

class Settings(BaseSettings):
    PROJECT_NAME: str = "Resolve — AI Consumer Complaint Assistant"
    VERSION: str = "0.2.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # LLM Settings (gemini | openai | mock)
    LLM_PROVIDER: Literal["gemini", "openai", "mock"] = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./resolve.db"
    
    # Environment
    ENVIRONMENT: Literal["development", "production", "testing"] = "development"
    DEBUG: bool = True
    # Comma-separated browser origins allowed to call the public API. Keep this
    # explicit: case capability tokens must never be readable from arbitrary
    # websites through permissive CORS.
    CORS_ORIGINS: str = "https://resolve-murex.vercel.app,http://localhost:3000"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
