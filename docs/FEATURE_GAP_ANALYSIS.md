# BRANDGUARD AI — FEATURE GAP ANALYSIS

**Document Version:** 1.0.0  
**Date:** November 5, 2026  
**Scope:** Comparative Analysis between Existing Brand Governance Foundation and Complete Dual-Pillar Platform (Brand Governance + Digital Brand Protection).

---

## 1. Executive Summary

BrandGuard AI currently possesses a functional, verified **Brand Governance** foundation (content compliance checking, deterministic rule validation, evidence grounding, human approval workflows, and role dashboards). However, the second strategic pillar — **Digital Brand Protection** (fake website/phishing detection, social media impersonation, counterfeit listing analysis, unauthorized logo detection, and centralized threat intelligence) — is completely missing from both backend and frontend.

Furthermore, the existing dashboards operate in silos rather than presenting a unified executive view of both internal content compliance and external digital brand risks.

---

## 2. Comprehensive Module-by-Module Gap Analysis

### 2.1 Unified Product Dashboard
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Total content reviews & compliance score | Available in `/analytics` | Integrated on primary dashboard | Surface directly on unified landing overview. |
| Total detected threats & active alerts | Not implemented | Display real threat metrics | Add threat telemetry aggregations from `ThreatItem` table. |
| Risk severity breakdown (Critical, High) | Only for content findings | Unified for content & digital threats | Aggregate content findings + digital threat levels. |
| Threats under investigation & resolved | Not implemented | Status counters (New, Investigating, Resolved) | Query threat investigation workflow records. |
| Unified recent activity feed | Content actions only | Merged feed (reviews + threats) | Combine audit log entries and threat detection events. |
| Zero fake statistics guarantee | Followed | Followed strictly | Ensure all numbers originate from live database queries. |

---

### 2.2 Brand Governance Module (Refinement)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Creator Content Submission | Working (`/submit`) | Enhanced with drag & drop / preview | Minor UX refinement; working functionally. |
| AI Compliance Audit & Explainability | Working (`/review/[id]`) | Retain with citation grounding | Verified working; preserve without breaking changes. |
| Reviewer Workspace & Comments | Working (`/dashboard/reviewer`) | Add direct thread responses | Threaded comment responses between creator & reviewer. |
| Manager Workspace & Decisions | Working (`/dashboard/manager`) | Enhanced revision comparison view | Add direct inline side-by-side diff viewer. |
| Admin Knowledge Base | Working (`/dashboard/admin`) | Add bulk import / export | Retain working CRUD; add JSON/CSV rule import. |

---

### 2.3 Website & Domain Protection Module (NEW)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Suspicious URL Analyzer | Not implemented | Scan engine with SSL, DNS, HTTP inspection | Build `WebsiteScanner` service with timeout & redirect controls. |
| Lookalike & Typo-Squatting Detection | Not implemented | Levenshtein & homoglyph generator for official brand domains (e.g. `finnova.com`) | Implement brand domain permutation algorithm identifying confusingly similar registrations. |
| SSRF Egress Security Protection | Not implemented | Hardened egress validator blocking private IPs, metadata endpoints (`169.254.169.254`), loopbacks | Implement `SSRFGuard` utility wrapping all outbound network calls. |
| Domain Scan History & Findings | Not implemented | Database table storing scan records, headers, risk ratings, and screenshots/DOM samples | Create `DomainScan` and `ThreatItem` models with relational linkages. |
| Frontend Scan & Inspection UI | Not implemented | Interactive scan submission page with real-time risk breakdown and explainable findings | Build `/protection/domains` UI with URL input, loading skeletons, and risk meters. |

---

### 2.4 Social Media Protection Module (NEW)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Impersonation Account Scanner | Not implemented | Account heuristic scanner comparing handles with official brand accounts | Build `SocialMediaScanner` comparing usernames, bio text, and verified status. |
| Brand Discrepancy Scoring | Not implemented | Explainable risk score based on handle similarity, suspicious bio links, and lack of verification | Implement heuristic scoring engine with structured evidence JSON. |
| Account Evidence Storage | Not implemented | Store profile metadata, profile URL, screenshot references, and risk levels | Add `social_account` category support in unified `ThreatItem` model. |
| Frontend Social Protection UI | Not implemented | Search, scan, and monitor interface for Twitter/X, Instagram, LinkedIn, Telegram | Build `/protection/social` workspace. |

---

### 2.5 Counterfeit Product Detection Module (NEW)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Reference Product Registry | Not implemented | Store official product images, specifications, price ranges, and authorized sellers | Create `BrandProduct` model in database. |
| Listing Text & Similarity Scrutiny | Not implemented | Check suspicious pricing (e.g. 90% below MSRP), unofficial distributors, and unauthorized claims | Implement `CounterfeitScanner` comparing listing details with authorized specs. |
| Visual Similarity & Discrepancy Checks | Not implemented | Image perceptual hashing (dHash/pHash) and visual comparison | Implement Python PIL/imagehash visual similarity scoring. |
| Frontend Counterfeit UI | Not implemented | Upload marketplace listing URL/image with side-by-side comparison | Build `/protection/counterfeit` workspace. |

---

### 2.6 Logo & Image Protection Module (NEW)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Official Brand Asset Vault | Not implemented | Repository of authorized SVG/PNG logos, trademarks, and watermarks | Create `BrandAsset` model storing official vectors and raster hashes. |
| Logo Misuse & Modification Detection | Not implemented | Detect cropped, color-inverted, or distorted unauthorized logo appearances | Implement perceptual hash & aspect ratio similarity engine. |
| Side-by-Side Comparison Viewer | Not implemented | Visual diff between authorized master asset and suspected infringing image | Build `/protection/logos` workspace with visual comparison cards. |

---

### 2.7 Unified Threat Intelligence Center (NEW)
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| Centralized Threat Database | Not implemented | Unified table holding all threat types (Domain, Social, Counterfeit, Logo) | Build `threat_items` and `threat_evidence` tables with indexes. |
| Threat Lifecycle Management | Not implemented | Status transitions: `New` $\rightarrow$ `Under Investigation` $\rightarrow$ `Verified` / `False Positive` $\rightarrow$ `Resolved` | Implement state machine API with audit logging on transitions. |
| Investigator Collaboration | Not implemented | Assign investigator, write investigation notes, set triage priority | Add `assigned_to_id`, `investigation_notes` field and comments. |
| Search, Filter, Sort & Export | Not implemented | Multi-facet filtering by category, severity, status, date range; CSV/JSON export | Build `/threats` list and `/threats/[id]` deep investigation view. |

---

### 2.8 Cross-Cutting Security & Privacy
| Requirement | Current State | Target State | Gap & Action Required |
|---|---|---|---|
| SSRF Egress Safeguards | None (no external fetching) | Strict egress firewall preventing internal network access | Mandatory before activating Website Scanner. |
| File Upload Validation | None (pure text submission) | Magic byte inspection, mime-type whitelisting, size limits ($<10$ MB), SVG sanitization | Implement `SecureUploadHandler` in FastAPI backend. |
| Rate Limiting on External Scans | None | Sliding-window rate limiter per user/IP on scan endpoints | Prevent denial of service or abuse of scanner endpoints. |

---

## 3. Prioritized Implementation Sequence

1. **Step 1:** Establish Data Models (`ThreatItem`, `ThreatEvidence`, `DomainScan`, `BrandAsset`, `BrandProduct`) via Alembic/SQLAlchemy.
2. **Step 2:** Build Backend Digital Protection Engines (`SSRFGuard`, `DomainAnalyzer`, `SocialAnalyzer`, `ImageAnalyzer`).
3. **Step 3:** Implement Unified Threat Intelligence API (`/api/v1/threats/`) with full status lifecycles.
4. **Step 4:** Build Unified Product Dashboard linking Content Governance and Threat Intelligence.
5. **Step 5:** Build Dedicated Digital Protection Workspaces (Domains, Social, Counterfeit, Logos).
6. **Step 6:** Execute Comprehensive Functional & Security Test Suite.

