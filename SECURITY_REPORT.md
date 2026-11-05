# BrandGuard AI — Application Security & Hardening Audit Report

**Platform:** BrandGuard AI  
**Scope:** OWASP Top 10, SSRFGuard Web Scraper Architecture, JWT Authentication, RBAC, HTTP Security Headers  
**Date:** November 5, 2026  
**Auditor:** Application Security Engineer  

---

## 1. Executive Security Assessment

The BrandGuard AI application was evaluated against the **OWASP Top 10 Web Application Security Risks**. All critical threat vectors—including Server-Side Request Forgery (SSRF) in threat scraping modules, Broken Access Control, Injection, and Insecure Headers—have been remediated and verified with automated test suites.

| OWASP Category | Threat Vector | Mitigation Strategy | Status |
|---|---|---|---|
| **A01: Broken Access Control** | Unauthorized actions across roles | Backend JWT role verification via `get_current_user` and `role` dependencies. | **SECURE** |
| **A02: Cryptographic Failures** | Insecure password hashes / JWT leakage | Passwords hashed using Bcrypt with strong salt. JWT signed with HMAC-SHA256. | **SECURE** |
| **A03: Injection** | SQL Injection & XSS | SQLAlchemy ORM parameterized queries; React automatic JSX escaping; nosniff headers. | **SECURE** |
| **A04: Insecure Design** | Unrestricted scraping / SSRF | Custom `SSRFGuard` resolver blocking loopback, RFC 1918 private IPs, and metadata endpoints. | **SECURE** |
| **A05: Security Misconfiguration** | Missing HTTP headers & CORS leaks | Strict HTTP headers injected by FastAPI middleware & Next.js config; restricted credentials CORS. | **SECURE** |
| **A07: Identification & Auth** | Credential brute-forcing | Timing-safe password comparisons; role-bound claims. | **SECURE** |

---

## 2. SSRFGuard Deep Dive (Pillar 2 Scraper Protection)

### Threat Context:
The Pillar 2 Digital Protection engine accepts external domains, URLs, and social profiles for threat analysis and lookalike scanning. If an attacker submits `http://127.0.0.1:8000`, `http://169.254.169.254/latest/meta-data/`, or internal VPC IP ranges, an unshielded scraper could perform internal port scanning or cloud metadata credential theft.

### SSRFGuard Implementation:
Located in `backend/app/core/security.py`:
1. **Scheme Validation:** Rejects any protocol other than `http` and `https` (blocks `file://`, `gopher://`, `dict://`).
2. **DNS Pre-Resolution:** Resolves target domain hostnames to IP addresses before initiating HTTP connections.
3. **Blacklisted IP Ranges:** Blocks:
   - Loopback addresses (`127.0.0.0/8`, `::1`)
   - Private RFC 1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Cloud Link-Local / Metadata endpoints (`169.254.0.0/16`)
   - Broadcast and multicast addresses.

### Automated Test Proof:
`backend/tests/test_domain_protection.py::test_ssrf_blocks_private_and_loopback` confirms that any attempt to submit `127.0.0.1` or `169.254.169.254` triggers an immediate HTTP 400 Bad Request exception before any outbound network socket is opened.

---

## 3. HTTP Security Headers

Injected on 100% of responses from Next.js and FastAPI:

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
```

- **Clickjacking Protection:** `X-Frame-Options: DENY` ensures BrandGuard AI cannot be embedded in `<iframe>` or `<frame>` elements on unauthorized domains.
- **MIME Confusion Protection:** `X-Content-Type-Options: nosniff` forces browsers to adhere strictly to declared MIME types.
- **Feature Restrictions:** `Permissions-Policy` disables camera, microphone, and geolocation access across all frames.

---

## 4. Role-Based Access Control (RBAC) Architecture

Enforced at the backend API layer in `backend/app/api/deps.py`:

```
+------------------+-----------------------------------------------------------+
| Role             | Permitted API Scope                                       |
+------------------+-----------------------------------------------------------+
| Creator          | Create content, submit for review, view own revisions.    |
| Reviewer         | Verify AI findings, add compliance comments, advance to mgr.|
| Manager          | Approve content, reject with feedback, view audit trails. |
| Admin            | Manage brand rules, terminology, users, threat escalations.|
+------------------+-----------------------------------------------------------+
```
Attempts by lower-privilege roles to invoke admin endpoints (e.g. `/api/v1/guidelines/rules` updates) return HTTP 403 Forbidden.
