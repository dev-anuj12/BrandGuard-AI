# BrandGuard AI — Production Deployment & Cloud Verification Guide

**Architecture:** Distributed Cloud SaaS (Vercel Frontend + Render Backend + PostgreSQL)  
**Frontend URL:** `https://brandguard-ai-eight.vercel.app/`  
**Date:** November 5, 2026  

---

## 1. Cloud Architecture Blueprint

```
+------------------------------------+          +------------------------------------+
|         VERCEL EDGE NETWORK        |          |          RENDER CLOUD WEB          |
|------------------------------------|          |------------------------------------|
| • Next.js 14 App Router (Edge/CDN) |  HTTPS   | • FastAPI + Uvicorn (Docker)       |
| • Statically prerendered HTML/JS   | -------> | • Dual-Engine AI Compliance Pipeline|
| • Dynamic robots.txt & sitemap.xml |  (REST)  | • SSRFGuard Threat Scrapers        |
| • PWA Manifest & Lucide Icons      |          | • SecurityHeadersMiddleware        |
+------------------------------------+          +------------------------------------+
                                                                  |
                                                                  | (psycopg2 / psycopg v3)
                                                                  v
                                                +------------------------------------+
                                                |       RENDER POSTGRESQL DB         |
                                                |------------------------------------|
                                                | • User & RBAC Auth Credentials     |
                                                | • FinNova Brand Knowledge Base     |
                                                | • Campaigns, Revisions & Audits    |
                                                | • Digital Threat Register          |
                                                +------------------------------------+
```

---

## 2. Environment Variables Configuration

### 2.1 Backend (Render Dashboard -> Environment)
| Variable | Recommended Production Value | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` (Render Database Connection String) | Primary PostgreSQL database connection |
| `SECRET_KEY` | *(Render auto-generated 64-char hex string)* | JWT HMAC-SHA256 signature key |
| `ENVIRONMENT` | `production` | Enables production security safeguards |
| `AI_PROVIDER` | `rule_fallback` (or `openai` / `gemini`) | AI compliance analysis provider |
| `DEMO_MODE` | `true` | Seeds FinNova demo rules & accounts upon startup |
| `PORT` | `8000` (Handled automatically by Render Docker) | ASGI listener port |

### 2.2 Frontend (Vercel Dashboard -> Project Settings -> Environment Variables)
| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<YOUR-RENDER-BACKEND-NAME>.onrender.com` | Base URL pointing directly to the deployed Render backend |

> **IMPORTANT:**
> 1. Set `NEXT_PUBLIC_API_URL` without a trailing slash (e.g., `https://brandguard-backend.onrender.com`).
> 2. Even if set with `/api/v1` or a trailing slash, the patched `frontend/lib/api.ts` sanitizes the URL automatically.
> 3. After setting or updating `NEXT_PUBLIC_API_URL` in Vercel, trigger a **Redeploy** so Next.js inlines the updated URL into the static client bundles.

---

## 3. Deployment Health Check Endpoints

Once deployed, verify the live services using standard HTTP GET requests:

1. **Backend Health Check:**
   ```bash
   curl -i https://<YOUR-RENDER-BACKEND-NAME>.onrender.com/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "healthy",
     "service": "BrandGuard AI",
     "version": "1.0.0",
     "environment": "production",
     "database": "connected",
     "demo_company": "FinNova Financial Technologies"
   }
   ```

2. **Backend Root Status:**
   ```bash
   curl -i https://<YOUR-RENDER-BACKEND-NAME>.onrender.com/
   ```
   **Expected Response:**
   ```json
   {
     "service": "BrandGuard AI Enterprise Platform",
     "version": "1.0.0",
     "status": "operational",
     "docs": "/docs",
     "health": "/health"
   }
   ```

3. **Frontend Dynamic Robots.txt:**
   ```bash
   curl -i https://brandguard-ai-eight.vercel.app/robots.txt
   ```
   Verifies public entry points are permitted while private dashboards are disallowed from search indexation.

4. **Frontend Canonical Sitemap.xml:**
   ```bash
   curl -i https://brandguard-ai-eight.vercel.app/sitemap.xml
   ```
   Verifies canonical routes are registered for search engines.

---

## 4. FinNova 1-Click Verification Credentials

The platform is pre-seeded with 4 role-based accounts:

| Role Persona | Email | Default Password | Workspace Capabilities |
|---|---|---|---|
| **Admin** | `admin@finnova.com` | `admin123` | Brand rules, terminology, users, threat management |
| **Compliance Manager** | `manager@finnova.com` | `manager123` | Final sign-off, campaign approvals, audit trails |
| **Brand Reviewer** | `reviewer@finnova.com` | `reviewer123` | AI finding verification, citation audits, review comments |
| **Content Creator** | `creator@finnova.com` | `creator123` | Draft submissions, AI violation remediation, revisions |

