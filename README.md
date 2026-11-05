# BrandGuard AI — Intelligent Brand Compliance & Content Review Platform

[![Event](https://img.shields.io/badge/CodeNexus%20India%202026-National%20Hackathon-6366F1)](https://codenexus.in)
[![Python](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

> Built for **CodeNexus India 2026 – National Hackathon**.  
> An enterprise-grade brand compliance and marketing review platform combining multi-engine AI audit with human-governed approval workflows.

---

## 1. Project Overview & Problem Statement

### The Problem
In fast-moving organizations, marketing, copywriting, and growth teams produce dozens of campaigns, social media posts, press releases, and product announcements daily. However, enterprise brand safety and regulatory compliance are difficult to scale manually:
- **Financial & Legal Exposure:** Promising unauthorized investment yields (e.g., "guaranteed returns", "risk-free") triggers massive fines from regulatory bodies (SEBI, RBI, FINRA, SEC).
- **Brand Degradation:** Non-standard jargon (e.g., "money app" vs "digital financial services") and inconsistent tone (predatory hype, slang) erode institutional trust.
- **Hallucinated or Unsubstantiated Claims:** Unverified superlatives ("#1 rated", "50% instant profit") get published without grounding evidence.
- **Workflow Friction:** Compliance teams become bottlenecks, manually reading drafts across email chains with no audit trail or version diffing.

### The Proposed Solution: BrandGuard AI
BrandGuard AI bridges corporate brand guidelines and content production. It provides:
1. **Multi-Engine Audit:** Real-time detection of banned phrases, tone inconsistencies, and missing regulatory disclosures.
2. **Explainable AI Suggestions:** Actionable, grounded recommendations with one-click acceptance or manual revision.
3. **Citation & Evidence Grounding:** Differentiates verified regulatory documents from unapproved domains and unsupported superlatives.
4. **Human-in-the-Loop Governance:** A 4-stage approval workflow with immutable revision histories and audit logging.

---

## 2. Fictional Demonstration Scenario: FinNova Financial Technologies

To demonstrate realistic enterprise compliance without referencing sensitive production assets, BrandGuard AI uses a complete sample configuration for:

**Company:** *FinNova Financial Technologies (Fictional FinTech)*
- **Brand Tone:** Professional, Trustworthy, Clear, Customer-friendly, Responsible.
- **Strictly Banned Expressions:** `guaranteed returns`, `risk-free investment`, `instant wealth`, `100% profit`, `crypto moon`.
- **Approved Terminology:**
  - `digital financial services` (Incorrect: *money app*)
  - `secure transactions` (Incorrect: *unhackable transfers*)
  - `financial planning` (Incorrect: *wealth wizardry*)
  - `customer-focused solutions` (Incorrect: *cheap banking hacks*)
- **Approved Sources:**
  - *FinNova Official Product Factsheet 2026* (`https://finnova-demo.com/docs/factsheet-2026.pdf`)
  - *FinNova Annual Financial & Compliance Report 2025* (`https://finnova-demo.com/investor-relations/annual-report-2025`)
  - *Regulatory Sandbox Verification Status* (`https://finnova-demo.com/compliance/regulatory-status`)

*(All demonstration data is explicitly identified as fictional sample data in the application).*

---

## 3. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS (Dark Navy `#0B0F19`, Slate `#1E293B`, Indigo `#6366F1`)
- **Icons:** Lucide React
- **Analytics Visualizations:** Recharts 2.15 (Bar, Line, Donut charts)
- **Client Architecture:** Modular API client with JWT interceptors, responsive drawers, and accessible color contrast.

### Backend
- **Framework:** Python 3.11 / 3.13 FastAPI
- **ORM & Database:** SQLAlchemy 2.0 with PostgreSQL driver (`psycopg2-binary`) & local SQLite fallback
- **Migrations:** Alembic 1.13
- **Data Validation:** Pydantic v2 & Pydantic-Settings
- **Authentication & Cryptography:** PyJWT with HS256, direct `bcrypt` hashing (Python 3.13 safe)
- **Networking:** HTTPX for asynchronous AI provider communication

### Multi-Engine AI Architecture
```
                         Submitted Marketing Draft
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │   Module A:   │           │   Module B:   │           │   Module C:   │
 │  Rule Engine  │           │   LLM Engine  │           │    Citation   │
 │ (Regex/Terms) │           │ (OpenAI/Gem)  │           │   Validator   │
 └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                             ┌───────────────┐
                             │   Module D:   │
                             │  Confidence   │
                             │    Scorer     │
                             └───────┬───────┘
                                     ▼
                      Unified AI Review Output JSON
                      (Score 0-100%, Grounded Findings)
```

1. **Module A (Rule Engine):** Deterministic token matching against the `banned_words` and `approved_terminology` tables. Checks for missing mandatory risk disclosures.
2. **Module B (LLM Engine):** Contextual brand tone auditor. Configurable for OpenAI (`gpt-4o-mini`) or Gemini (`gemini-1.5-flash`), with a zero-credential semantic fallback engine.
3. **Module C (Citation Validator):** Extracts cited URLs, compares against `approved_sources`, and flags unverified external domains or unsubstantiated superlatives.
4. **Module D (Confidence Scorer):** Calibrates confidence tiers (High 90%+, Medium, Low) and computes an overall Compliance Score (0–100%) with severity-weighted deductions.

---

## 4. Team Responsibilities & Contributions

| Member | Role | Key Contributions |
|---|---|---|
| **Anuj Vishwakarma** | Full-Stack Developer & AI Engineer | • Backend FastAPI architecture & JWT security<br>• AI Multi-Engine Review Pipeline (Rule, LLM, Citations, Scorer)<br>• Review and Suggestions REST APIs<br>• System integration & database session management |
| **Nakshatra Titarmare** | Frontend Developer | • Next.js 14 App Router UI & Tailwind CSS styling<br>• Creator, Reviewer, Manager, and Admin dashboards<br>• Interactive AI Review Results page with text highlighting<br>• Responsive navigation, badges, and Recharts analytics UI |
| **Lakshita Bisen** | Backend Support & QA Engineer | • PostgreSQL relational schema & Alembic migrations<br>• Brand knowledge base CRUD (guidelines, banned words, sources)<br>• Automated test suite (Pytest integration & unit tests)<br>• Demonstration seed data & technical documentation |

---

## 5. Enterprise 4-Stage Human Approval Workflow

```
[ CREATOR ] ──> Submits Marketing Content
                      │
                      ▼
             [ BRANDGUARD AI AUDIT ]
             Multi-Engine Review Generated
                      │
                      ▼
[ CREATOR ] ──> Inspects Findings & Accepts/Rejects Suggestions
                Saves Revision v2 (History Preserved)
                      │
                      ▼
[ REVIEWER ] ──> Audits Unresolved Violations & Verifies Citations
                 Adds Reviewer Notes & Approves for Manager
                      │
                      ▼
[ MANAGER ] ──> Executive Review: Grants Official Sign-off or Rejects
                      │
                      ▼
            [ APPROVED CONTENT ] ──> Ready for Market Deployment
```

### Content Status Transitions
- `Draft` → `Submitted`
- `Submitted` → `AI Review Completed`
- `AI Review Completed` → `Changes Required` *(if score < 80%)*
- `Changes Required` → `Resubmitted` *(Creator submits revision v2)*
- `Resubmitted` → `Pending Reviewer Verification`
- `Pending Reviewer Verification` → `Verified` / `Pending Manager Approval`
- `Pending Manager Approval` → `Approved` or `Rejected`

---

## 6. Database Schema (16 Relational Tables)

The application models all data through SQLAlchemy 2.0 with foreign key constraints, created/updated timestamps, and JSON audit states:

1. `users` — Authentication, email, password hash, role (`CREATOR`, `REVIEWER`, `MANAGER`, `ADMIN`).
2. `brand_guidelines` — Rule definitions, category, rule type, severity level.
3. `approved_sources` — Official URLs, factsheet links, verification status.
4. `approved_facts` — Factual statements grounded in approved sources.
5. `banned_words` — Prohibited expressions, category, regulatory explanation, suggested replacement.
6. `approved_terminology` — Approved term vs. incorrect term mapping with context.
7. `contents` — Marketing campaigns, channel, target audience, current body, lifecycle status.
8. `content_revisions` — Version-controlled snapshot history (`v1`, `v2`, ...). Previous revisions are never overwritten.
9. `ai_reviews` — Review runs, overall compliance score (0–100), summary, engine provider.
10. `findings` — Individual violation records, category, severity, matched text, guideline reference, grounding evidence, confidence score.
11. `suggestions` — One-click replacement text, rationale, acceptance status (`Pending`, `Accepted`, `Rejected`, `Manually Edited`).
12. `comments` — Threaded stakeholder feedback on submissions.
13. `reviewer_assignments` — Assignment of reviews to specific auditor users.
14. `approvals` — Managerial sign-off records (`Approved`, `Rejected`, `Changes Requested`) with executive commentary.
15. `audit_logs` — Immutable audit trail: `user_id`, `action`, `entity_type`, `previous_state`, `new_state`, timestamp.

---

## 7. Installation & Running Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (tested on Python 3.11 and 3.13)
- Git
- *(Optional)* Docker and Docker Compose for containerized deployment

### Quick Start (Local Development)

#### 1. Clone the Repository
```bash
git clone https://github.com/brandguard-ai/brandguard.git
cd brandguard
```

#### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database setup & demo seed data
python -m app.database.init_db

# Start the FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Interactive Swagger Docs: `http://localhost:8000/docs`

#### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Frontend will be live at: `http://localhost:3000`

---

## 8. Pre-Configured Demo Credentials (1-Click Login)

The login screen includes **1-Click Evaluator Buttons** for instant evaluation by hackathon judges:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Creator** | `creator@finnova.com` | `Creator@123` | Submit marketing copy, view AI highlights, accept suggestions, submit revisions |
| **Reviewer** | `reviewer@finnova.com` | `Reviewer@123` | Audit AI findings, check evidence, add notes, verify submissions |
| **Manager** | `manager@finnova.com` | `Manager@123` | Executive clearance, approve/reject collateral, view audit history |
| **Admin** | `admin@finnova.com` | `Admin@123` | Manage brand rules, banned terms, approved sources, and user roles |

---

## 9. Running Automated Tests

Run the full backend test suite verifying authentication, rule detection, citation validation, scoring calibration, and workflow transitions:

```bash
cd backend
python -m pytest tests/ -v
```

**Test Verification Summary:**
```
backend/tests/test_ai_engine.py::test_rule_engine_detects_banned_words PASSED
backend/tests/test_ai_engine.py::test_rule_engine_detects_incorrect_terminology PASSED
backend/tests/test_ai_engine.py::test_citation_validator_unverified_source PASSED
backend/tests/test_ai_engine.py::test_confidence_scorer_scoring PASSED
backend/tests/test_ai_engine.py::test_full_ai_review_pipeline PASSED
backend/tests/test_auth.py::test_health_check PASSED
backend/tests/test_auth.py::test_login_seeded_users PASSED
backend/tests/test_auth.py::test_login_invalid_credentials PASSED
backend/tests/test_user_registration PASSED

======================= 9 passed in 3.52s ========================
```

---

## 10. Docker Deployment

Deploy the complete platform with PostgreSQL, FastAPI backend, and Next.js frontend using Docker Compose:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 11. Production Cloud Deployment Guide

- **Frontend (Vercel):** Connect the `frontend` folder to Vercel. Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`.
- **Backend (Render / Railway):** Deploy the `backend` Dockerfile or Python web service with start command:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Database (Managed PostgreSQL):** Use Supabase, Neon, or Render PostgreSQL. Supply `DATABASE_URL=postgresql://user:pass@host:5432/brandguard`.

---

## 12. Three Major Improvements for Round 3

The modular architecture was specifically engineered to easily incorporate three Round 3 enhancements:
1. **AI Accuracy:** Integration of vector embeddings (e.g. pgvector / Chroma) for multi-guideline retrieval-augmented semantic analysis and false-positive reduction.
2. **Evidence Reliability:** Live HTTP HEAD/GET accessibility testing and PDF parsing for deep page-number citation grounding in annual reports.
3. **Product Intelligence:** Predictive compliance analytics showing which marketing channels incur the most frequent violations and creator revision velocity tracking.

---

## 13. Hackathon Disclosure & Ethics

- Developed for **CodeNexus India 2026 – National Hackathon**.
- FinNova Financial Technologies and all associated financial policies, figures, and products are fictional demonstration entities created for evaluation purposes.
- Passwords are encrypted with bcrypt (12 rounds) and tokens are signed with JWT. No production secrets or external API keys are hardcoded in the codebase.
