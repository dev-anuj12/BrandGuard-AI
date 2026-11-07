import pytest
from app.protection.ssrf_guard import validate_and_resolve_url, SSRFSecurityError
from app.protection.domain_analyzer import DomainAnalyzer, normalize_homoglyphs, compute_levenshtein
from app.models.enums import ThreatRiskLevel


def test_ssrf_blocks_private_and_loopback():
    """Verify SSRFGuard strictly rejects internal/loopback IP addresses and metadata."""
    forbidden_targets = [
        "http://127.0.0.1",
        "http://localhost:8000",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/admin",
        "http://192.168.1.1",
        "ftp://example.com/file",
        "file:///etc/passwd"
    ]
    for target in forbidden_targets:
        with pytest.raises(SSRFSecurityError):
            validate_and_resolve_url(target)


def test_homoglyph_detection():
    """Verify Cyrillic confusable characters are normalized and flagged."""
    # Using Cyrillic 'а' (\u0430) and 'о' (\u043e) in finnova
    cyrillic_domain = "finn\u043ev\u0430-secure.com"
    normalized, homoglyphs = normalize_homoglyphs(cyrillic_domain)
    assert "finnova-secure.com" == normalized
    assert len(homoglyphs) == 2


def test_levenshtein_distance():
    """Verify string distance calculation for typosquatting."""
    assert compute_levenshtein("finnova", "finnova") == 0
    assert compute_levenshtein("finova", "finnova") == 1
    assert compute_levenshtein("finnnova", "finnova") == 1
    assert compute_levenshtein("fin-nova", "finnova") == 1


def test_official_brand_domain_evaluation():
    """Verify the official canonical domain evaluates as safe with 0 risk."""
    analyzer = DomainAnalyzer()
    res = analyzer.analyze_domain("https://brandguard.io")
    assert res["risk_level"] == ThreatRiskLevel.INFO
    assert res["risk_score"] == 0.0
    assert res["similarity_score"] == 100.0


def test_phishing_lookalike_domain_evaluation():
    """Verify high-risk phishing and lookalike domain detection."""
    analyzer = DomainAnalyzer()
    res = analyzer.analyze_domain("https://brandguard-secure-login.cc")
    assert res["risk_score"] >= 60.0
    assert res["risk_level"] in (ThreatRiskLevel.HIGH, ThreatRiskLevel.CRITICAL)
    assert res["credential_harvesting_detected"] is True
    assert len(res["findings"]) >= 2
