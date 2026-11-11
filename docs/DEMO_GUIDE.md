# BrandGuard AI — Comprehensive Enterprise Demonstration Guide

Welcome to **BrandGuard AI**, the AI-Powered Brand Governance & Digital Brand Protection Platform.

This guide provides an end-to-end walkthrough of the platform's features, demonstrating how organizations protect their brand identity across internal content workflows and the external digital perimeter.

---

## 1. Quick Access & Credentials

The application is running locally with seeded demonstration data for **FinNova Financial Technologies**:

* **Web Application:** `http://localhost:3000`
* **Backend API & Swagger Docs:** `http://127.0.0.1:8000/docs`

| Role | Email Address | Password | Primary Responsibilities & Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@finnova.com` | `Admin@123` | Brand Knowledge Base, Rule Configuration, Global Settings, Threat Intel |
| **Manager** | `manager@finnova.com` | `Manager@123` | Final Executive Approval, Risk Sign-Off, Rejection Handling, Analytics |
| **Reviewer** | `reviewer@finnova.com` | `Reviewer@123` | Citation Verification, AI Recommendations Audit, Issue Triage |
| **Creator** | `creator@finnova.com` | `Creator@123` | Multi-channel Content Drafting, AI Review Triggering, Revisions |

> **Tip:** You can quickly switch between roles using the 1-click demonstration buttons on the [`/login`](http://localhost:3000/login) page.

---

## 2. Walkthrough Part 1: Internal Content Governance Workflow

### Step 1: Submit Non-Compliant Marketing Copy (Creator)
1. Log in as **Creator** (`creator@finnova.com` / `Creator@123`) or click **Creator** on the login screen.
2. Navigate to **Create Submission** ([`/submit`](http://localhost:3000/submit)).
3. Select **Social Media Campaign** as the channel.
4. Input title: `"FinNova SmartGrowth Q4 Promotional Push"`.
5. Paste the following test copy containing intentional brand violations:
   ```text
   Invest in FinNova SmartGrowth today and unlock a guaranteed 40% annual return on your capital with zero risk! Our revolutionary crypto robo-advisor operates entirely unregulated for maximum financial freedom. For unverified details, check out https://unverified-blog-tips.com/finnova.
   ```
6. Click **Submit for AI Review**.

### Step 2: Explainable AI Review & Suggestions
1. The AI Review Engine evaluates the text using:
   * **Rule Engine:** Flags prohibited terms like `"guaranteed"`, `"unregulated"`, and `"zero risk"`.
   * **Citation Validator:** Identifies unapproved source `https://unverified-blog-tips.com`.
   * **Confidence Scorer:** Generates calibrated confidence ratings and an explainable compliance score.
2. Review the detected findings highlighted in the text.
3. Click **Accept Suggestion** on the recommendations to automatically replace prohibited claims with compliant brand-safe terminology.
4. Click **Submit Revised Version** to advance the submission into the human verification pipeline.

### Step 3: Reviewer Verification & Citation Audit (Reviewer)
1. Switch to **Reviewer** (`reviewer@finnova.com`).
2. Open the **Workflow Pipeline** ([`/approvals`](http://localhost:3000/approvals)) or Reviewer Workspace.
3. Open the pending submission.
4. Verify that citations match the official brand knowledge base.
5. Click **Verify & Escalate to Manager Approval**.

### Step 4: Executive Sign-off (Manager)
1. Switch to **Manager** (`manager@finnova.com`).
2. Navigate to the Manager Workspace ([`/dashboard/manager`](http://localhost:3000/dashboard/manager)).
3. Review the audit trail, compliance score improvement, and reviewer sign-off.
4. Click **Approve Content**. The status transitions to **Approved** and immutable audit logs are recorded.

---

## 3. Walkthrough Part 2: External Digital Brand Protection

BrandGuard AI continuously guards the external digital perimeter across three threat surfaces:

### Surface A: Website & Lookalike Domain Protection ([`/protection/domains`](http://localhost:3000/protection/domains))
1. Navigate to **Domain Protection** in the sidebar.
2. Use the **Quick Demonstration Scenarios**:
   * **Official Brand:** Click `FinNova Official Domain (https://finnova.com)` $\rightarrow$ Evaluates as **Safe (0% Risk)**, verifies official Digicert TLS certificate.
   * **Phishing Portal:** Click `Phishing Portal Lookalike (https://finnova-secure-login.cc)` $\rightarrow$ Evaluates as **Critical (100% Risk)**, detects credential harvesting heuristics, high-abuse `.cc` TLD, and unauthorized brand token.
   * **Homoglyph Mimic:** Click `Cyrillic Homoglyph Mimic (https://finnоvа-banking.top)` $\rightarrow$ Detects Cyrillic `о` (`\u043e`) and `а` (`\u0430`) confusable characters visually imitating FinNova.
   * **SSRF Attack Vector:** Click `SSRF Attack Vector (http://127.0.0.1:8000/admin)` $\rightarrow$ Demonstrates **SSRFGuard** blocking private IP subnets and loopback addresses with an explicit security alert.
3. Any scan scoring $\ge 60\%$ automatically generates a tracked case in the Threat Intelligence Center.

### Surface B: Social Media Impersonation Protection ([`/protection/social`](http://localhost:3000/protection/social))
1. Navigate to **Social Protection** in the sidebar.
2. Test the **Quick Demonstration Scenarios**:
   * **Fake Telegram Helpdesk:** Click `Fake Telegram Support Desk` (`@finnova_support_desk`) $\rightarrow$ Detects deceptive customer care qualifier (`support_desk`), unverified badge status, and scam bio language (`"DM for wallet recovery"`).
   * **Crypto Airdrop Bot:** Click `Crypto Airdrop Twitter Bot` (`@finnova_airdrop_bot`) $\rightarrow$ Flags financial scam phraseology (`"send 0.1 ETH to verify"`).
   * **Official Corporate Account:** Click `Official Verified Brand Profile` (`@finnovahq`) $\rightarrow$ Validates verified blue checkmark and whitelisted corporate social handle.

### Surface C: Counterfeit Products & Logo Misuse ([`/protection/counterfeit`](http://localhost:3000/protection/counterfeit))
1. Navigate to **Counterfeit & Assets** in the sidebar.
2. **Tab 1: Marketplace Product Authenticity Scanner**:
   * Click `Counterfeit Bond on AliExpress (88% Cut)`.
   * The engine compares the listed price ($1,200.00) against the official FinNova MSRP ($10,000.00), flags an **88% price undercut**, unauthorized merchant, and `"replica copy"` descriptor, assigning **Critical Risk**.
3. **Tab 2: Logo & Trademark Usage Inspector**:
   * Click `Unlicensed Crypto Yield Site`.
   * Flags unauthorized corporate emblem usage, altered color palettes, and placement on predatory collateral.

---

## 4. Walkthrough Part 3: Threat Intelligence & Legal Takedown Generator

1. Navigate to **Threat Intelligence** ([`/threats`](http://localhost:3000/threats)).
2. Filter threats by category (`Phishing Domain`, `Social Impersonation`, `Counterfeit Product`, `Unauthorized Logo`) or risk level.
3. Click on any threat row (e.g. `THR-2026-001` or `THR-2026-005`) to expand the **Investigation Drawer**.
4. Inspect the attached technical evidence repository (DNS records, WHOIS data, DOM snapshots, scam bio tokens).
5. Add an investigator triage note and update the status (`Under Investigation`, `Confirm Threat`, `Resolve Incident`).
6. Click **Generate Legal Notice**:
   * An interactive modal displays a statutory **Formal Notice of Trademark Infringement & Demand for Immediate Takedown** formatted for domain registrars, hosting ISPs, and platform trust & safety teams.
   * Click **Copy Notice** to instantly copy the legal declaration to your clipboard.

---

## 5. Walkthrough Part 4: Executive Unified Command Center

1. Navigate to **Unified Overview** ([`/dashboard`](http://localhost:3000/dashboard)).
2. Observe the synchronized real-time KPIs:
   * **Internal Compliance Score:** Live aggregated score across all reviewed content.
   * **Digital Threat Perimeter:** Total detected digital threats, critical severity incidents, and resolved takedowns.
   * **Unified Activity Stream:** Chronological feed merging internal governance approvals with external digital threat detections.
   * **Dual Analytics Charts:** Visualizing brand compliance trends alongside threat category distributions.

---

## 6. Running Automated Tests & Verification

### A. Automated Regression Pytest Suite
```powershell
& "backend\venv\Scripts\python.exe" -m pytest backend/tests/ -v
```
**Results:** `23 passed in 3.69s` (100% pass rate).

### B. End-to-End Platform Integration Verification
```powershell
python scripts/verify_e2e_platform.py
```
**Results:** Exercises health, RBAC authentication for all 4 roles, brand knowledge base, multi-engine content AI review, reviewer verification, manager approval, SSRFGuard validation, lookalike domain scanning, social impersonation scanning, counterfeit & logo scans, threat intelligence, and unified executive telemetry with 100% success.


