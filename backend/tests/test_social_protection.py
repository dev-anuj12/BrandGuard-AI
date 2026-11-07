import pytest
from app.protection.social_scanner import SocialMediaScanner
from app.models.enums import ThreatRiskLevel


def test_official_social_profile_evaluation():
    """Verify official verified handle evaluates as safe with 0 risk."""
    scanner = SocialMediaScanner()
    res = scanner.analyze_profile(
        platform="twitter",
        handle="brandguardhq",
        display_name="BrandGuard AI Enterprise",
        is_verified=True
    )
    assert res["risk_level"] == ThreatRiskLevel.INFO
    assert res["risk_score"] == 0.0
    assert res["is_verified"] is True


def test_impersonation_fake_support_bot():
    """Verify detection of fake support handles with scam bio intent."""
    scanner = SocialMediaScanner()
    res = scanner.analyze_profile(
        platform="telegram",
        handle="brandguard_support_desk",
        display_name="BrandGuard Official Support Desk",
        bio_text="Official 24/7 Support Desk. DM for wallet recovery and KYC validation. Send deposit to verify.",
        is_verified=False
    )
    assert res["risk_score"] >= 80.0
    assert res["risk_level"] == ThreatRiskLevel.CRITICAL
    assert res["scam_intent_detected"] is True
    assert len(res["findings"]) >= 3


def test_homoglyph_in_social_handle():
    """Verify Cyrillic homoglyph in social handle is detected."""
    scanner = SocialMediaScanner()
    # Using Cyrillic 'а' (\u0430)
    res = scanner.analyze_profile(
        platform="twitter",
        handle="br\u0430ndguard_care",
        display_name="BrandGuard Care",
        is_verified=False
    )
    assert res["risk_score"] >= 60.0
    assert any(f["rule_id"] == "SOC-HOMOGLYPH-002" for f in res["findings"])
