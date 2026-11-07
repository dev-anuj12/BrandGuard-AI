import pytest
from app.database.session import SessionLocal
from app.protection.counterfeit_analyzer import CounterfeitAnalyzer, LogoMisuseAnalyzer
from app.models.enums import ThreatRiskLevel


def test_counterfeit_severe_discount():
    """Verify listing with severe price undercutting and unauthorized seller is flagged critical."""
    db = SessionLocal()
    try:
        analyzer = CounterfeitAnalyzer()
        res = analyzer.analyze_listing(
            db=db,
            marketplace="AliExpress",
            listing_title="BrandGuard SecureKey Token 1:1 replica clone hardware wallet",
            listing_url="https://aliexpress.com/item/100500912",
            seller_name="Shenzhen Discount Tech Ltd",
            listed_price=24.99,
            sku_or_product_id="BG-SEC-01",
            description="OEM factory surplus 1:1 copy of BrandGuard hardware token."
        )
        assert res["risk_score"] >= 80.0
        assert res["risk_level"] == ThreatRiskLevel.CRITICAL
        assert res["is_authorized_seller"] is False
        assert res["price_disparity_pct"] > 80.0
        assert len(res["findings"]) >= 3
    finally:
        db.close()


def test_authorized_distributor_listing():
    """Verify official authorized distributor listing evaluates as safe."""
    db = SessionLocal()
    try:
        analyzer = CounterfeitAnalyzer()
        res = analyzer.analyze_listing(
            db=db,
            marketplace="Amazon",
            listing_title="BrandGuard SecureKey Hardware Token - Official Edition",
            listing_url="https://amazon.com/dp/B09XYZ",
            seller_name="BrandGuard Official Store",
            listed_price=199.99,
            sku_or_product_id="BG-SEC-01",
            description="Official authenticated hardware token directly from BrandGuard."
        )
        assert res["risk_score"] == 0.0
        assert res["risk_level"] == ThreatRiskLevel.INFO
        assert res["is_authorized_seller"] is True
    finally:
        db.close()


def test_logo_misuse_unauthorized_partner():
    """Verify unauthorized commercial logo display is flagged high/critical."""
    db = SessionLocal()
    try:
        analyzer = LogoMisuseAnalyzer()
        res = analyzer.analyze_asset_usage(
            db=db,
            partner_name="Apex High-Yield Lending Portal",
            host_url="https://apexyields.cc",
            asset_name="BrandGuard Primary Emblem",
            has_written_authorization=False,
            is_color_palette_modified=True,
            placed_on_unauthorized_collateral=True
        )
        assert res["risk_score"] >= 80.0
        assert res["risk_level"] == ThreatRiskLevel.CRITICAL
        assert res["has_written_authorization"] is False
    finally:
        db.close()
