from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.init_db import init_db
from app.api.v1 import auth, users, guidelines, content, review, approvals, analytics

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Brand Compliance & Content Review Platform for CodeNexus India 2026",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development and hackathon demo
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
        "message": "Welcome to BrandGuard AI API — Intelligent Brand Compliance Platform",
        "docs": "/docs",
        "health": "/health",
        "hackathon": "CodeNexus India 2026"
    }

# Register API Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(guidelines.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(review.router, prefix=settings.API_V1_STR)
app.include_router(approvals.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
