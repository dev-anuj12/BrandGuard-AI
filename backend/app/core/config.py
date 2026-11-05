import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "BrandGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = Field(default="brandguard-enterprise-jwt-signing-key-2026-production", validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: Supports PostgreSQL, falls back to SQLite for local ease if not set
    DATABASE_URL: str = Field(
        default="sqlite:///./brandguard.db",
        validation_alias="DATABASE_URL"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://brandguard.vercel.app"
    ]
    
    # AI / LLM Configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None, validation_alias="OPENAI_API_KEY")
    GEMINI_API_KEY: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")
    AI_PROVIDER: str = Field(default="rule_fallback", validation_alias="AI_PROVIDER")  # 'openai', 'gemini', 'rule_fallback'
    
    # Demonstration Scenario Company Info
    DEMO_COMPANY_NAME: str = "FinNova Financial Technologies"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

