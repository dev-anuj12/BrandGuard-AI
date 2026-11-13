from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict, model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "BrandGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = Field(default="brandguard-enterprise-jwt-signing-key-2026-production", validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    MFA_ENFORCE_ADMIN: bool = Field(default=False, validation_alias="MFA_ENFORCE_ADMIN")

    @model_validator(mode="after")
    def validate_production_secret_key(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            known_defaults = {
                "brandguard-enterprise-jwt-signing-key-2026-production",
                "default_insecure_secret_key_change_in_production",
                "secret",
                "changeme",
            }
            if self.SECRET_KEY in known_defaults or "default" in self.SECRET_KEY.lower() or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "In production, SECRET_KEY must not be the default value and must be at least 32 characters long."
                )
        return self
    
    # Database: Supports PostgreSQL, falls back to SQLite for local ease if not set
    DATABASE_URL: str = Field(
        default="sqlite:///./brandguard.db",
        validation_alias="DATABASE_URL"
    )
    
    # CORS — restrict to approved deployment domains; expand via ALLOWED_ORIGINS env var
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://brandguard-ai-eight.vercel.app",
        "https://brandguard.vercel.app",
    ]
    # Accept comma-separated extra origins from environment (e.g. custom Vercel previews)
    ALLOWED_ORIGINS_EXTRA: Optional[str] = Field(default=None, validation_alias="ALLOWED_ORIGINS")
    
    # EmailJS REST API Configuration (bypasses Render SMTP port firewall)
    EMAILJS_SERVICE_ID: Optional[str] = Field(default=None, validation_alias="EMAILJS_SERVICE_ID")
    EMAILJS_TEMPLATE_ID: Optional[str] = Field(default=None, validation_alias="EMAILJS_TEMPLATE_ID")
    EMAILJS_PUBLIC_KEY: Optional[str] = Field(default=None, validation_alias="EMAILJS_PUBLIC_KEY")
    EMAILJS_PRIVATE_KEY: Optional[str] = Field(default=None, validation_alias="EMAILJS_PRIVATE_KEY")
    EMAILJS_API_URL: str = Field(default="https://api.emailjs.com/api/v1.0/email/send", validation_alias="EMAILJS_API_URL")
    EMAILJS_TIMEOUT: int = Field(default=15, validation_alias="EMAILJS_TIMEOUT")

    # SMTP Email Configuration (used only when RESEND_API_KEY is not set)
    SMTP_HOST: Optional[str] = Field(default=None, validation_alias="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, validation_alias="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(default=None, validation_alias="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, validation_alias="SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = Field(default="noreply@brandguard.ai", validation_alias="SMTP_FROM_EMAIL")
    SMTP_FROM_NAME: str = Field(default="BrandGuard AI Security", validation_alias="SMTP_FROM_NAME")
    SMTP_USE_TLS: bool = Field(default=True, validation_alias="SMTP_USE_TLS")
    SMTP_USE_SSL: bool = Field(default=False, validation_alias="SMTP_USE_SSL")
    SMTP_TIMEOUT: int = Field(default=15, validation_alias="SMTP_TIMEOUT")
    FRONTEND_URL: str = Field(default="http://localhost:3000", validation_alias="FRONTEND_URL")

    # AI / LLM Configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None, validation_alias="OPENAI_API_KEY")
    GEMINI_API_KEY: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")
    AI_PROVIDER: str = Field(default="rule_fallback", validation_alias="AI_PROVIDER")  # 'openai', 'gemini', 'rule_fallback'
    
    # Demonstration Scenario Company Info (used in seed data and AI engine prompts)
    DEMO_COMPANY_NAME: str = "BrandGuard Demo Enterprise"
    
    @property
    def effective_cors_origins(self) -> List[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        if self.ALLOWED_ORIGINS_EXTRA:
            extras = [o.strip() for o in self.ALLOWED_ORIGINS_EXTRA.split(",") if o.strip()]
            origins.extend(extras)
        return origins
    
    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="allow")

settings = Settings()

