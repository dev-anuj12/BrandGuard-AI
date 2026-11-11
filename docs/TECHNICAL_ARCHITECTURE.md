# BRANDGUARD AI — TECHNICAL ARCHITECTURE SPECIFICATION

**Document Version:** 1.0.0  
**Date:** November 5, 2026  
**Architect:** Senior SaaS Product Architect & Full-Stack Security Engineer  
**Scope:** Unified Technical Design for Brand Governance & Digital Brand Protection

---

## 1. High-Level Architecture Topology

```
                                [Client Web Browser]
                                         │
                                         ▼
                     [Next.js 14 App Router (Port 3000)]
               ├── Reusable UI Library (Buttons, Modals, Badges, Toast)
               ├── ThemeContext (Persistent Light/Dark Mode)
               ├── Workspaces: Creator, Reviewer, Manager, Admin
               └── Threat Intelligence Center & Protection Modules
                                         │
                         (Bearer JWT over HTTPS/REST)
                                         ▼
                     [FastAPI Enterprise Gateway (Port 8000)]
   ┌─────────────────────────────────────┼─────────────────────────────────────┐
   ▼                                     ▼                                     ▼
[Auth & RBAC Middleware]      [Brand Governance Subsystem]         [Digital Protection Subsystem]
├── JWT HS256 Handler         ├── RuleEngine (Regex & Banned)      ├── SSRFGuard (Egress Filter)
├── Passlib Bcrypt Salting    ├── CitationValidator (Facts/URLs)   ├── DomainAnalyzer (Lookalike)
└── Role Access Control       ├── ConfidenceScorer (Deduction)     ├── SocialAnalyzer (Heuristic)
                              └── ReviewPipeline (Synthesis)       ├── ImageAnalyzer (pHash/dHash)
                                                                   └── ThreatIntelService
                                         │
                                         ▼
                         [SQLAlchemy 2.0 ORM Repository]
   ┌─────────────────────────────────────┴─────────────────────────────────────┐
   ▼                                                                           ▼
[Governance Tables]                                                [Protection & Threat Tables]
├── users (Members & Roles)                                        ├── threat_items (Centralized Intel)
├── contents (Submissions & Metadata)                              ├── threat_evidence (DOM/Image/Headers)
├── content_revisions (Version History)                            ├── domain_scans (Website Diagnostics)
├── ai_reviews & findings (Explainable Audits)                     ├── brand_assets (Official Logos)
├── suggestions (Actionable Remediations)                          └── brand_products (Authorized Specs)
├── approvals & comments (Workflow State)
└── audit_logs (Immutable Ledger)
```

---

## 2. Database Schema Architecture

### 2.1 Preserved Existing Tables (15 Tables)
- `users`: Core identity, roles (`CREATOR`, `REVIEWER`, `MANAGER`, `ADMIN`), hashed passwords.
- `contents`: Content submissions, channel, audience, current body, governance status.
- `content_revisions`: Version history and incremental body diffs (`v1`, `v2`, ...).
- `ai_reviews`: Aggregated compliance scores ($0-100\%$), summaries, audit engine metadata.
- `findings`: Granular violations (category, severity, matched text, guideline reference, confidence, evidence JSON).
- `suggestions`: Remediations linked to findings (suggested text, reason, accept/reject status).
- `approvals`: Manager sign-off decisions (`Approved`, `Changes Requested`, `Rejected`).
- `comments`: Threaded human notes between reviewers and creators.
- `reviewer_assignments`: Task delegation to verified audit personnel.
- `brand_guidelines`: Master compliance policies (Financial Claims, Tone, Legal Disclosures).
- `banned_words`: Zero-tolerance vocabulary and mandatory replacements.
- `approved_sources`: Whitelisted regulatory URLs and statutory documentation.
- `approved_facts`: Grounded factual claims registered for empirical cross-referencing.
- `approved_terminology`: Approved vs incorrect vocabulary pairs.
- `audit_logs`: Immutable chronological ledger of all platform actions.

### 2.2 New Digital Brand Protection Tables
- `threat_items`:
  - `id` (INTEGER, Primary Key)
  - `threat_code` (VARCHAR, Indexed Unique - e.g. `THR-2026-001`)
  - `category` (ENUM: `Phishing Domain`, `Lookalike Website`, `Social Impersonation`, `Counterfeit Product`, `Unauthorized Logo`)
  - `title` (VARCHAR)
  - `source_url` (TEXT)
  - `target_brand` (VARCHAR, Default `FinNova Financial Technologies`)
  - `risk_level` (ENUM: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`)
  - `confidence_score` (FLOAT: 0.0 - 100.0)
  - `status` (ENUM: `New`, `Under Investigation`, `Verified Threat`, `False Positive`, `Resolved`)
  - `explanation` (TEXT)
  - `recommended_action` (TEXT)
  - `assigned_to_id` (INTEGER, Foreign Key $\rightarrow$ `users.id`, Nullable)
  - `detected_at` (DATETIME, Indexed)
  - `resolved_at` (DATETIME, Nullable)
- `threat_evidence`:
  - `id` (INTEGER, Primary Key)
  - `threat_id` (INTEGER, Foreign Key $\rightarrow$ `threat_items.id`)
  - `evidence_type` (VARCHAR - `WHOIS`, `SSL_CERT`, `DOM_SNAPSHOT`, `IMAGE_HASH`, `SCREENSHOT`)
  - `data_payload` (JSON / TEXT)
  - `created_at` (DATETIME)
- `domain_scans`:
  - `id` (INTEGER, Primary Key)
  - `scanned_url` (TEXT)
  - `domain_name` (VARCHAR, Indexed)
  - `ip_address` (VARCHAR)
  - `is_https` (BOOLEAN)
  - `ssl_valid` (BOOLEAN)
  - `status_code` (INTEGER)
  - `redirect_count` (INTEGER)
  - `similarity_score` (FLOAT)
  - `risk_score` (FLOAT)
  - `threat_id` (INTEGER, Nullable, Foreign Key $\rightarrow$ `threat_items.id`)
  - `created_at` (DATETIME)
- `brand_assets`:
  - `id` (INTEGER, Primary Key)
  - `asset_name` (VARCHAR)
  - `asset_type` (VARCHAR - `Primary Logo`, `Icon Mark`, `Watermark`, `Product Emblem`)
  - `image_path` (VARCHAR)
  - `perceptual_hash` (VARCHAR)
  - `is_active` (BOOLEAN)
  - `created_at` (DATETIME)
- `brand_products`:
  - `id` (INTEGER, Primary Key)
  - `product_name` (VARCHAR)
  - `sku` (VARCHAR, Unique)
  - `official_msrp` (FLOAT)
  - `authorized_distributors` (JSON)
  - `reference_image_path` (VARCHAR)
  - `created_at` (DATETIME)

---

## 3. Modular AI & Detection Engine Architecture

### 3.1 Network Egress & SSRF Protection Engine (`SSRFGuard`)
To protect internal infrastructure during external URL inspection:
- Validates URLs against RFC 3986 schemes (`http`, `https` strictly).
- Resolves domain to IP via system DNS before connection.
- Rejects loopback addresses (`127.0.0.0/8`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local IPs (`169.254.0.0/16`), and IPv6 equivalents (`::1`, `fe80::/10`).
- Enforces strict redirect count limits ($\le 3$) and revalidates every target IP in the redirect chain.
- Strict timeout configuration (connect timeout: 3s, read timeout: 5s, total max: 8s).

### 3.2 Domain & Typo-Squatting Engine (`DomainAnalyzer`)
- Calculates normalized Levenshtein edit distance against registered brand domains (`finnova.com`).
- Homoglyph replacement detector (identifying Cyrillic/Greek lookalikes such as `fіnnova.com` with Ukrainian 'і').
- Permutation generator: checks character insertion, omission, substitution, transposition, and suspicious TLD variants (`.cc`, `.top`, `.xyz`, `.biz`, `.live`).
- Checks SSL certificate validity, issuer authority, and expiration date.

### 3.3 Social Media Impersonation Engine (`SocialMediaAnalyzer`)
- Matches account usernames against protected brand prefixes and suffixes (`official_`, `_support`, `finnova_care`, `finnova_help`).
- Computes handle similarity coefficient and analyzes public profile presence (presence of unofficial external payment links, lack of official verification badges, bio keyword matching).

### 3.4 Visual & Perceptual Image Engine (`ImageAnalyzer`)
- Perceptual image hashing using Difference Hashing (dHash) and Average Hashing (aHash).
- Computes Hamming distance between suspected image hashes and master brand asset hashes stored in `brand_assets`.
- Calculates visual confidence score:
  - Hamming distance $\le 5$: High confidence match / direct unauthorized usage.
  - Hamming distance $6-12$: Suspected modification (crop, slight distort, overlay).
  - Hamming distance $> 12$: Uncorrelated asset.
- Evaluates RGB color histogram correlation for counterfeit packaging detection.

---

## 4. Frontend Component & Navigation Architecture

```
[Navigation Hierarchy]
├── / (Enterprise Landing Page)
├── /login & /register (Secure Auth & Demonstration Profiles)
├── /dashboard (Unified Executive Overview - Governance + Protection)
├── /dashboard/creator (Creator Workspace - Content Submissions & Revisions)
├── /dashboard/reviewer (Reviewer Workspace - Content Audits & Evidence Check)
├── /dashboard/manager (Manager Workspace - Executive Approvals & Decisional Logs)
├── /dashboard/admin (Admin Center - Knowledge Base, Rules, RBAC, System Config)
├── /submit (Content Ingestion with Live Character/Word Analytics)
├── /review/[id] (Explainable Findings, Diff Viewer, One-Click Remediations)
├── /approvals (4-Stage Pipeline Tracker & Historical Search)
├── /threats (Unified Threat Intelligence Center)
│     ├── /threats/[id] (Deep Forensic Investigation & Evidence Viewer)
│     └── /threats/new (Manual Incident Registration)
├── /protection/domains (Website & Phishing Scanner)
├── /protection/social (Social Media Impersonation Monitor)
├── /protection/counterfeit (Counterfeit Listing & Product Inspection)
├── /protection/logos (Brand Asset Vault & Logo Abuse Detector)
├── /analytics (Enterprise Governance & Threat Telemetry)
└── /settings (User Identity, Brand Context, Theme Persistence)
```

---

## 5. Security & Privacy Guarantees

1. **Least-Privilege Principle:** Only `ADMIN` can alter brand guidelines, approved sources, or user roles. Only `MANAGER` can authorize final publishing status.
2. **SSRF Hardening:** No external URL fetching can probe localhost, AWS/GCP metadata APIs, or local Docker network subnets.
3. **Password Security:** Multi-round bcrypt hashing; passwords never logged or transmitted in cleartext.
4. **JWT Lifecycles:** Stateless signed tokens with explicit expiration and authorization headers.
5. **No Synthetic Telemetry:** All dashboard counters, severity bars, and threat matrices query real database rows. Empty states are displayed when no items are present.

