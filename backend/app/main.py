from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings
from app.database.init_db import init_db
from app.api.v1 import auth, users, guidelines, content, review, approvals, analytics, threats, protection_domains, protection_social, protection_products

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database and seed demo data
    init_db()
    yield
    # Shutdown: nothing to clean up currently

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="An intelligent brand compliance and content governance platform that helps organizations review, validate, manage and approve brand-related content using AI-assisted analysis and human oversight.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "connect-src 'self' https:;"
        )
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration: environment-aware origin restriction
_allow_all_cors = settings.ENVIRONMENT.lower() in ("development", "dev", "test")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all_cors else settings.effective_cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health Check APIs
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "demo_company": settings.DEMO_COMPANY_NAME
    }

@app.get("/", tags=["System"])
def root():
    return {
        "service": "BrandGuard AI Enterprise Platform",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }

# Register API Routers with primary prefix /api/v1, direct alias, and double-prefix resilience
api_routers = [
    auth.router,
    users.router,
    guidelines.router,
    content.router,
    review.router,
    approvals.router,
    analytics.router,
    threats.router,
    protection_domains.router,
    protection_social.router,
    protection_products.router,
]

for router in api_routers:
    # Standard prefix: /api/v1/...
    app.include_router(router, prefix=settings.API_V1_STR)
    # Direct fallback alias: /... (e.g. /auth/login)
    app.include_router(router)
    # Resilient double-prefix alias: /api/v1/api/v1/... (handles clients with duplicated prefix in env var)
    app.include_router(router, prefix="/api/v1/api/v1")


