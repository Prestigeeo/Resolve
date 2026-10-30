import os
from pydantic_settings import BaseSettings
from typing import Optional, Literal

class Settings(BaseSettings):
    PROJECT_NAME: str = "Resolve — AI Consumer Complaint Assistant"
    VERSION: str = "0.2.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # LLM Settings (gemini | openai | mock)
    LLM_PROVIDER: Literal["gemini", "openai", "mock"] = "mock"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./resolve.db"
    
    # Environment
    ENVIRONMENT: Literal["development", "production", "testing"] = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
