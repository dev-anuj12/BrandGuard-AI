# BrandGuard AI — Complete Production Deployment & Operations Guide

**System:** BrandGuard AI (Dual-Pillar Enterprise Brand Governance & Protection)  
**Architecture:** Next.js 14 App Router on Vercel Edge + FastAPI on Render Cloud (Docker) + PostgreSQL  
**Version:** 2.0.0 (Production-Ready)  

---

## 1. Production Deployment Topology

```
[ Clients / Mobile / Browsers ]
               │
        HTTPS (TLS 1.3)
               ▼
   [ Vercel Edge Global CDN ]
   - Next.js 14 App Router (Prerendered UI)
   - Dynamic robots.txt & sitemap.xml
   - Static Asset Caching
   - Client-side token authentication
               │
        REST API (HTTPS)
               ▼
   [ Render Web Service (Docker) ]
   - FastAPI + Uvicorn ASGI Server
   - Multi-tenant organization boundaries
   - Dual-engine AI analysis & SSRFGuard
   - SecurityHeadersMiddleware & Environment CORS
               │
        Connection Pooling (TLS)
               ▼
   [ Managed PostgreSQL Database ]
   - ACID Compliant Relational Store
   - Automated Daily Backups
   - Idempotent schema migration support
```

---

## 2. Environment Variables Configuration

### 2.1 Backend (Render / Cloud Container)

| Variable | Recommended Production Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://<user>:<password>@<host>:<port>/<dbname>` | PostgreSQL connection string with SSL |
| `SECRET_KEY` | *(Strong 64-character random hex string)* | JWT HMAC-SHA256 signing secret |
| `ENVIRONMENT` | `production` | Enforces production CORS and security headers |
| `AI_PROVIDER` | `rule_fallback` (or `openai` / `gemini`) | Primary content compliance AI provider |
| `OPENAI_API_KEY` | *(Optional - sk-proj-...)* | API key for OpenAI GPT analysis |
| `GEMINI_API_KEY` | *(Optional - AIzaSy...)* | API key for Google Gemini analysis |
| `ALLOWED_ORIGINS`| `https://brandguard-ai-eight.vercel.app` | Comma-separated list of permitted frontend origins |
| `DEMO_MODE` | `true` | Seeds FinNova demo data if database is empty |
| `PORT` | `8000` | Port handled automatically by container runtime |

### 2.2 Frontend (Vercel Project Settings)

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://brandguard-backend.onrender.com` | Base URL pointing directly to the deployed Render backend (no trailing slash or `/api/v1`) |

> **Redeploy Note:** In Next.js, `NEXT_PUBLIC_*` variables are embedded into client bundles at build time. Whenever updating `NEXT_PUBLIC_API_URL` in Vercel, trigger a **Redeploy** to ensure the updated URL is baked into the static production bundles.

---

## 3. Database Migration, Backup & Disaster Recovery

### 3.1 Idempotent Schema Upgrades
The backend includes an automatic startup migration handler in `init_db.py` (`ensure_organization_columns`) that checks for the existence of the `organization` column on `users`, `contents`, `brand_guidelines`, and `threat_items`. If missing, it adds them safely without destroying existing rows.

### 3.2 Backup Procedure
To take a manual snapshot before major updates:
```bash
# PostgreSQL Backup (pg_dump)
pg_dump -h <host> -U <user> -d <dbname> -F c -b -v -f brandguard_backup_$(date +%Y%m%d).dump
```

### 3.3 Recovery Procedure
To restore from a backup:
```bash
# PostgreSQL Restore (pg_restore)
pg_restore -h <host> -U <user> -d <dbname> -v -c brandguard_backup_20261105.dump
```

---

## 4. Verification & Health Monitoring Checklist

After deploying updates, verify system status using standard HTTP checks:

1. **System Health Probe:**
   ```bash
   curl -i https://brandguard-backend.onrender.com/health
   ```
   *Expected:* HTTP 200, `{"status": "healthy", "service": "BrandGuard AI", "database": "connected"}`

2. **CORS Headers Check:**
   ```bash
   curl -i -X OPTIONS https://brandguard-backend.onrender.com/api/v1/auth/login \
     -H "Origin: https://brandguard-ai-eight.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```
   *Expected:* HTTP 200, containing `Access-Control-Allow-Origin: https://brandguard-ai-eight.vercel.app`.

3. **Public Robots & Sitemap Inspection:**
   ```bash
   curl -i https://brandguard-ai-eight.vercel.app/robots.txt
   curl -i https://brandguard-ai-eight.vercel.app/sitemap.xml
   ```

4. **Legal & Error Pages:**
   * Visit `/privacy`, `/terms`, `/contact` to confirm proper rendering.
   * Visit `/non-existent-page` to confirm branded 404 page with recovery navigation.

---

## 5. Demonstration Accounts

For executive reviews and QA audits:

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Admin** | `admin@finnova.com` | `Admin@123` | Brand rules, users, full governance |
| **Manager** | `manager@finnova.com` | `Manager@123` | Executive sign-off, approvals, audit logs |
| **Reviewer** | `reviewer@finnova.com` | `Reviewer@123` | AI finding verification, human overrides |
| **Creator** | `creator@finnova.com` | `Creator@123` | Draft submissions, AI review, revisions |

