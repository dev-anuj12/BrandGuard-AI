"""
BrandGuard AI — Comprehensive End-to-End Platform Verification Script
Exercises both Pillar 1 (Brand Governance) and Pillar 2 (Digital Brand Protection)
against the active running FastAPI backend.
"""

import sys
import json
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def request(endpoint: str, method: str = "GET", data: dict = None, token: str = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"detail": content}

def print_section(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def main():
    print_section("BRANDGUARD AI — SYSTEM HEALTH & CONNECTIVITY")
    status, health = request("/health")
    assert status == 200, f"Health check failed: {health}"
    print(f"[PASS] Health Check: {health.get('status')} | Service: {health.get('service')} | Company: {health.get('demo_company')}")

    print_section("AUTHENTICATION & ROLE-BASED ACCESS CONTROL")
    roles = {
        "ADMIN": ("admin@finnova.com", "Admin@123"),
        "MANAGER": ("manager@finnova.com", "Manager@123"),
        "REVIEWER": ("reviewer@finnova.com", "Reviewer@123"),
        "CREATOR": ("creator@finnova.com", "Creator@123")
    }
    tokens = {}
    for role, (email, pwd) in roles.items():
        status, auth = request("/api/v1/auth/login", "POST", {"email": email, "password": pwd})
        assert status == 200, f"Login failed for {email}: {auth}"
        tokens[role] = auth["access_token"]
        print(f"[PASS] Authenticated {role:<8} [{email}] -> JWT received ({auth['user']['full_name']})")

    print_section("BRAND KNOWLEDGE BASE INSPECTION (ADMIN)")
    admin_token = tokens["ADMIN"]
    status, rules = request("/api/v1/guidelines/rules", token=admin_token)
    assert status == 200, "Failed to fetch rules"
    status, banned = request("/api/v1/guidelines/banned-words", token=admin_token)
    assert status == 200, "Failed to fetch banned words"
    status, sources = request("/api/v1/guidelines/sources", token=admin_token)
    assert status == 200, "Failed to fetch approved sources"
    print(f"[PASS] Active Guidelines Rules: {len(rules)}")
    print(f"[PASS] Banned Words Configured: {len(banned)} (e.g., {banned[0].get('word_or_phrase') if banned else 'None'})")
    print(f"[PASS] Approved Fact Sources:   {len(sources)}")

    print_section("PILLAR 1: CONTENT SUBMISSION & AI COMPLIANCE REVIEW")
    creator_token = tokens["CREATOR"]
    submission_payload = {
        "title": "FinNova E2E Verification Campaign",
        "channel": "Social Media",
        "target_audience": "Retail Investors",
        "original_body": "Join FinNova today for guaranteed returns of 40% with zero risk! Our unregulated robo-advisor offers instant wealth. Sources: https://unverified-blog.org"
    }
    status, content_item = request("/api/v1/content/", "POST", submission_payload, token=creator_token)
    assert status in (200, 201), f"Content creation failed: {content_item}"
    content_id = content_item["id"]
    print(f"[PASS] Content Created: ID #{content_id} | Title: \"{content_item['title']}\"")

    # Run AI Review
    status, review_res = request(f"/api/v1/review/{content_id}/trigger", "POST", token=creator_token)
    assert status == 200, f"AI Review failed: {review_res}"
    score = review_res.get("overall_score", 0)
    findings = review_res.get("findings", [])
    suggestions = review_res.get("suggestions", [])
    print(f"[PASS] Multi-Engine AI Review Completed: Compliance Score = {score:.1f}%")
    print(f"[PASS] Violations Identified: {len(findings)} findings, {len(suggestions)} suggestions")
    for f in findings[:3]:
        cat = f.get('category', 'Violation')
        txt = f.get('matched_text', '')
        exp = f.get('explanation', '')[:65]
        print(f"   • [{f.get('severity')}] {cat}: \"{txt}\" -> {exp}...")

    print_section("PILLAR 1: WORKFLOW LIFECYCLE (REVIEWER VERIFY & MANAGER APPROVE)")
    reviewer_token = tokens["REVIEWER"]
    status, verify_res = request(f"/api/v1/approvals/verify/{content_id}", "POST", {"action": "verify", "comments": "Citations checked against knowledge base."}, token=reviewer_token)
    assert status == 200, f"Reviewer verification failed: {verify_res}"
    verify_val = verify_res.get('status') if isinstance(verify_res, dict) else verify_res
    print(f"[PASS] Reviewer Verified: Status advanced to \"{verify_val}\"")

    manager_token = tokens["MANAGER"]
    status, approve_res = request(f"/api/v1/approvals/decision/{content_id}", "POST", {"action": "Approved", "comments": "Executive sign-off granted for compliant deployment."}, token=manager_token)
    assert status == 200, f"Manager approval failed: {approve_res}"
    approve_val = approve_res.get('action') if isinstance(approve_res, dict) else approve_res
    print(f"[PASS] Manager Approved: Action Recorded = \"{approve_val}\"")

    print_section("PILLAR 2: WEBSITE & DOMAIN PROTECTION (SSRF GUARD)")
    # 1. SSRF block test
    status, ssrf_res = request("/api/v1/protection/domains/scan", "POST", {"url": "http://127.0.0.1:8000/internal", "auto_create_threat": True}, token=admin_token)
    assert status == 400, "SSRFGuard failed to block 127.0.0.1"
    print(f"[PASS] SSRFGuard Validation: Loopback address '127.0.0.1' successfully blocked (HTTP 400)")

    # 2. Phishing domain scan
    status, domain_res = request("/api/v1/protection/domains/scan", "POST", {"url": "https://finnova-secure-login.cc", "auto_create_threat": True}, token=admin_token)
    assert status in (200, 201), f"Domain scan failed: {domain_res}"
    print(f"[PASS] Phishing Domain Analyzed: {domain_res.get('domain_name')}")
    print(f"   • Risk Score: {domain_res.get('risk_score')}/100 | Level: {domain_res.get('risk_level')}")
    print(f"   • Credential Harvesting: {domain_res.get('credential_harvesting_detected')}")
    print(f"   • Threat Linked: {domain_res.get('threat_code')} (Auto-registered)")

    print_section("PILLAR 2: SOCIAL MEDIA IMPERSONATION PROTECTION")
    social_payload = {
        "platform": "telegram",
        "handle": "finnova_support_desk",
        "display_name": "FinNova Official Support Desk",
        "bio_text": "Official 24/7 Support Desk. DM for wallet recovery and KYC validation.",
        "is_verified": False,
        "auto_create_threat": True
    }
    status, social_res = request("/api/v1/protection/social/scan", "POST", social_payload, token=admin_token)
    assert status in (200, 201), f"Social scan failed: {social_res}"
    print(f"[PASS] Social Profile Analyzed: {social_res.get('platform')} {social_res.get('handle')}")
    print(f"   • Risk Score: {social_res.get('risk_score')}/100 | Level: {social_res.get('risk_level')}")
    print(f"   • Scam Intent Detected: {social_res.get('scam_intent_detected')}")
    print(f"   • Threat Linked: {social_res.get('threat_code')}")

    print_section("PILLAR 2: COUNTERFEIT PRODUCTS & LOGO MISUSE")
    prod_payload = {
        "marketplace": "AliExpress",
        "listing_title": "FinNova SmartGrowth Managed Portfolio 1:1 replica voucher",
        "listing_url": "https://aliexpress.com/item/e2e-test",
        "seller_name": "Shenzhen Liquidity Direct",
        "listed_price": 1200.0,
        "sku_or_product_id": "FNV-SGP-01",
        "description": "100% replica copy OEM surplus.",
        "auto_create_threat": True
    }
    status, prod_res = request("/api/v1/protection/products/scan", "POST", prod_payload, token=admin_token)
    assert status in (200, 201), f"Product scan failed: {prod_res}"
    print(f"[PASS] Marketplace Listing Analyzed: {prod_res.get('marketplace')} - {prod_res.get('matched_product')}")
    print(f"   • MSRP: ${prod_res.get('official_msrp')} vs Listed: ${prod_res.get('listed_price')} (Disparity: -{prod_res.get('price_disparity_pct')}%)")
    print(f"   • Authorized Seller: {prod_res.get('is_authorized_seller')} -> Risk: {prod_res.get('risk_score')}/100")

    logo_payload = {
        "partner_name": "Apex Crypto Yield Portal",
        "host_url": "https://apexyields.cc/partners",
        "asset_name": "FinNova Primary Corporate Emblem",
        "has_written_authorization": False,
        "is_color_palette_modified": True,
        "placed_on_unauthorized_collateral": True,
        "auto_create_threat": True
    }
    status, logo_res = request("/api/v1/protection/products/logo/scan", "POST", logo_payload, token=admin_token)
    assert status in (200, 201), f"Logo scan failed: {logo_res}"
    print(f"[PASS] Logo Misuse Analyzed: Partner \"{logo_res.get('partner_name')}\"")
    print(f"   • Risk Score: {logo_res.get('risk_score')}/100 | Authorized: {logo_res.get('has_written_authorization')}")

    print_section("THREAT INTELLIGENCE & UNIFIED TELEMETRY")
    status, threats = request("/api/v1/threats/", token=admin_token)
    assert status == 200, "Failed to list threats"
    print(f"[PASS] Total Tracked Digital Threats: {len(threats)}")

    status, unified = request("/api/v1/analytics/unified", token=admin_token)
    assert status == 200, "Failed to fetch unified telemetry"
    print(f"[PASS] Executive Unified Telemetry:")
    print(f"   • Total Content Reviewed:      {unified.get('total_content_reviewed')}")
    print(f"   • Brand Compliance Rating:     {unified.get('brand_compliance_score')}%")
    print(f"   • Total Detected Threats:      {unified.get('total_detected_threats')}")
    print(f"   • Critical / High Threats:     {unified.get('critical_high_threats')}")
    print(f"   • Threats Under Investigation: {unified.get('threats_investigating')}")

    print("\n" + "=" * 70)
    print("  ALL END-TO-END VERIFICATION CHECKS PASSED (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    main()
