from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.init_db import init_db
from app.api.v1 import auth, users, guidelines, content, review, approvals, analytics, threats, protection_domains, protection_social, protection_products

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="An intelligent brand compliance and content governance platform that helps organizations review, validate, manage and approve brand-related content using AI-assisted analysis and human oversight.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize database and seed demo data
@app.on_event("startup")
def on_startup():
    init_db()

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

# Register API Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(guidelines.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(review.router, prefix=settings.API_V1_STR)
app.include_router(approvals.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(threats.router, prefix=settings.API_V1_STR)
app.include_router(protection_domains.router, prefix=settings.API_V1_STR)
app.include_router(protection_social.router, prefix=settings.API_V1_STR)
app.include_router(protection_products.router, prefix=settings.API_V1_STR)

