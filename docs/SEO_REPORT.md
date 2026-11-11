# BrandGuard AI — Technical SEO & Search Engine Hygiene Report

**Platform:** BrandGuard AI  
**Primary Domain:** `https://brandguard-ai-eight.vercel.app`  
**Audit Standard:** Google Search Essentials, Technical SEO, Structured Data, OpenGraph & Social Sharing  
**Date:** November 5, 2026  

---

## 1. Technical SEO Audit Overview

BrandGuard AI was configured with an enterprise-grade search architecture that maximizes organic discoverability for public product and authentication pages while strictly preventing search engine indexing of private enterprise compliance workflows and confidential threat intelligence data.

---

## 2. Robots & Indexing Architecture (`robots.ts`)

Generated dynamically at runtime and statically prerendered as `/robots.txt`:

```txt
# BrandGuard AI Dynamic Robots Configuration
User-agent: *
Allow: /
Allow: /login
Allow: /register
Disallow: /dashboard/
Disallow: /dashboard/*
Disallow: /review/
Disallow: /review/*
Disallow: /submit/
Disallow: /submit/*
Disallow: /approvals/
Disallow: /approvals/*
Disallow: /analytics/
Disallow: /analytics/*
Disallow: /threats/
Disallow: /threats/*
Disallow: /protection/
Disallow: /protection/*
Disallow: /settings/
Disallow: /settings/*
Disallow: /api/
Disallow: /api/*

Sitemap: https://brandguard-ai-eight.vercel.app/sitemap.xml
```

### Protection Guarantee:
- Enterprise campaign drafts, AI violation audits, executive approval logs, and confidential digital threat investigations are shielded from Googlebot, Bingbot, and other web crawlers.

---

## 3. Dynamic Sitemap (`sitemap.ts`)

Generated at `/sitemap.xml` with canonical routes, change frequencies, and search priority weighting:

| URL Path | Priority | Change Frequency | Target Purpose |
|---|---|---|---|
| `https://brandguard-ai-eight.vercel.app/` | **1.0** | Daily | Landing page, platform feature overview, interactive FinNova demo tour |
| `https://brandguard-ai-eight.vercel.app/login` | **0.8** | Monthly | Enterprise portal sign-in |
| `https://brandguard-ai-eight.vercel.app/register` | **0.8** | Monthly | Enterprise compliance account registration |

---

## 4. Metadata, Canonical URLs & OpenGraph

Configured in `frontend/app/layout.tsx`:
- **Metadata Base:** `https://brandguard-ai-eight.vercel.app`
- **Title Template:** `%s | BrandGuard AI — Brand Governance & Digital Protection`
- **Default Title:** `BrandGuard AI — AI-Powered Brand Governance & Digital Protection Platform`
- **Canonical URLs:** Explicit `alternates.canonical` pointing to primary HTTPS URL, eliminating duplicate content penalties.
- **OpenGraph Protocol:**
  - `og:type`: `website`
  - `og:locale`: `en_US`
  - `og:site_name`: `BrandGuard AI`
  - `og:image`: Configured high-resolution preview card.
- **Twitter Cards:** `summary_large_image` enabled with creator handle and description.

---

## 5. Structured Data (JSON-LD Schema)

Embedded in `frontend/app/page.tsx` for rich snippet eligibility in Google Search results:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BrandGuard AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Enterprise-grade AI platform for brand governance, content compliance, and external digital threat protection.",
  "author": {
    "@type": "Organization",
    "name": "BrandGuard AI"
  }
}
```

---

## 6. Progressive Web App (PWA) Manifest

Configured at `frontend/public/manifest.json`:
- `name`: `BrandGuard AI — Enterprise Brand Governance & Protection`
- `short_name`: `BrandGuard AI`
- `start_url`: `/`
- `display`: `standalone`
- `theme_color`: `#4f46e5`
- `background_color`: `#0f172a`

