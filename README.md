# BrandGuard AI — Enterprise Brand Governance & Digital Brand Protection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Pytest-25%2F25%20Passing-success.svg?logo=pytest&logoColor=white)](backend/tests/)

> **BrandGuard AI** is an intelligent brand compliance and content governance platform that helps organizations review, validate, manage, and approve brand-related content using AI-assisted analysis and human oversight, while proactively defending against external digital brand threats.

---

## 1. Product Positioning & Core Capabilities

BrandGuard AI connects two vital capabilities into a single operational interface:

### Pillar 1: Brand Governance (Internal Content Quality & Regulatory Safety)
* **Multi-Engine Content Review:** Deterministic rule matching against corporate banned words, missing regulatory disclosures, and unapproved terminology combined with LLM semantic tone analysis.
* **Evidence & Citation Validation:** Real-time domain verification against approved corporate fact sheets and regulatory filings.
* **Explainable Recommendations:** In-line AI suggestions with one-click acceptance and non-destructive versioning.
* **Human-in-the-Loop Workflow:** 4-stage approval pipeline with strict role-based access control (`CREATOR`, `REVIEWER`, `MANAGER`, `ADMIN`).

### Pillar 2: Digital Brand Protection (External Threat Surface Monitoring)
* **Website & Lookalike Domain Protection:** SSRF-hardened inspection engine analyzing normalized Levenshtein similarity, Cyrillic homoglyph attacks, high-risk TLD abuse, and credential harvesting forms.
* **Social Media Impersonation Protection:** Heuristic detection of unauthorized brand handles, fake customer support pretenders, and crypto/financial scam bio lures across social platforms.
* **Counterfeit Products & Trademark Misuse:** MSRP price disparity analysis against official catalogs and visual brand asset compliance.
* **Centralized Threat Intelligence & Incident Response:** Triage workflows and **Legal Takedown Notice Generator** (DMCA / Cease & Desist / UDRP).

---

## 2. High-Level System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                BrandGuard AI Platform                                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +---------------------------------------+   +-------------------------------------+   |
|   |         PILLAR 1: GOVERNANCE          |   |     PILLAR 2: DIGITAL PROTECTION    |   |
|   +---------------------------------------+   +-------------------------------------+   |
|   | - Creator Workspace (/submit)         |   | - Domain Protection (/protection)   |   |
|   | - Reviewer Workspace (/review/[id])   |   | - Social Protection (/social)       |   |
|   | - Manager Workspace (/approvals)      |   | - Counterfeit / Assets (/counterfeit)|   |
|   | - Admin Knowledge Base (/admin)       |   | - Threat Intel Center (/threats)    |   |
|   | - AI Review Engine (Rules + Semantic) |   | - SSRFGuard & Homoglyph Analyzer    |   |
|   | - Citation Validator                  |   | - Legal Takedown Notice Generator   |   |
|   +---------------------------------------+   +-------------------------------------+   |
|                                       \           /                                     |
|                                        \         /                                      |
|                             +-------------------------------+                           |
|                             |   Executive Command Center    |                           |
|                             |         (/dashboard)          |                           |
|                             |  - 6 Real-time Telemetry KPIs |                           |
|                             |  - Unified Analytics Feed     |                           |
|                             |  - Dual Pillar Analytics      |                           |
|                             +-------------------------------+                           |
|                                             |                                           |
|                             +-------------------------------+                           |
|                             |   FastAPI Backend (Port 8000) |                           |
|                             |   10 API Routers under /api/v1|                           |
|                             +-------------------------------+                           |
|                                             |                                           |
|                             +-------------------------------+                           |
|                             |   SQLite / PostgreSQL Database|                           |
|                             |   20 Relational Tables        |                           |
|                             +-------------------------------+                           |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
* **Backend:** FastAPI, Pydantic v2, SQLAlchemy 2.0, Python 3.11 / 3.13.
* **Security & Auth:** SSRFGuard network egress filtering, JWT HS256 authentication, Bcrypt password hashing.
* **Database:** 20 relational tables (PostgreSQL production-ready with local SQLite zero-config fallback).

---

## 4. Demonstration Scenario

The platform includes baseline demonstration data for testing compliance policies:

* **Organization:** *BrandGuard Demo Enterprise*
* **Banned Expressions:** `guaranteed returns`, `risk-free investment`, `instant wealth`, `100% profit`, `crypto moon`.
* **Approved Terminology:** `digital financial services` (instead of *money app*), `secure transactions` (instead of *unhackable transfers*).

---

## 5. Quick Start & Local Execution

### Prerequisites
* Python 3.11+
* Node.js 18+
* npm or pnpm

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m app.database.init_db
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation: `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/health`

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
* Web Application: `http://localhost:3000`

---

## 6. Environment Variables

The application is configured using environment variables based on `.env.example`:

### Backend
- `SECRET_KEY`
- `ENVIRONMENT`
- `DATABASE_URL`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS`

### Frontend
- `NEXT_PUBLIC_API_URL`

---

## 7. Automated Test Suite & Platform Verification

### Pytest Test Suite
To run all 25 automated regression unit and integration tests:

```powershell
& "backend\venv\Scripts\python.exe" -m pytest backend/tests -v
```
**Results:** `25 passed in ~5s` (100% pass rate).

### Comprehensive End-to-End Platform Verification Script
```powershell
python scripts/verify_e2e_platform.py
```

---

## 8. Known Limitations

- **Deterministic Fallback Engine:** Semantic tone analysis operates via local deterministic rule-based evaluation unless an external LLM API key (`OPENAI_API_KEY` or `GEMINI_API_KEY`) is configured.
- **Input-Based Scanners:** Perimeter protection scanners analyze user-supplied domain names, social handles, and marketplace URLs on demand; they do not perform persistent autonomous web-wide crawling.
- **Render Free-Tier Cold Starts:** When hosted on free-tier infrastructure, backend services spin down after inactivity and may take 30–50 seconds to respond on initial wake-up.
- **Simulated External Metadata:** WHOIS and external registrar threat evaluations use heuristic similarity scoring algorithms when live external registrar API credentials are not provided.
