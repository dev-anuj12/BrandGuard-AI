import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.database.init_db import init_db
from app.ai_engine.normalizer import (
    normalize_text,
    is_false_positive_context,
    has_required_disclaimer
)
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.llm_engine import LLMEngine
from app.models.guideline import BrandGuideline


@pytest.fixture(scope="module")
def tuned_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    init_db(db)
    yield db
    db.close()


def test_text_normalization_lookalikes_and_hyphens():
    # Test Cyrillic lookalike replacement
    obfuscated = "Our fund provides r\u0456sk-fr\u0435\u0435 opportunities."
    norm = normalize_text(obfuscated)
    assert "risk-free" in norm

    # Test single letter hyphens
    spaced = "We do not offer g-uaranteed returns to anyone."
    norm_spaced = normalize_text(spaced)
    assert "guaranteed" in norm_spaced

    # Test percentage leetspeak
    leetspeak = "Earn 1OO% profit on your assets."
    assert "100% profit" in normalize_text(leetspeak)

    # Test zero-width characters removal
    zero_width = "i\u200bn\u200bs\u200bt\u200ba\u200bn\u200bt wealth"
    assert "instant wealth" in normalize_text(zero_width)


def test_false_positive_guard_negation(tuned_db):
    engine = RuleEngine(tuned_db)
    text = "Our advisors never promise guaranteed returns to retail clients."
    findings = engine.analyze(text)
    banned_findings = [f for f in findings if f["category"] == "Banned Expression"]
    assert len(banned_findings) == 0


def test_false_positive_guard_attribution_and_quotes(tuned_db):
    engine = RuleEngine(tuned_db)
    text = 'Beware of unscrupulous firms claiming a "risk-free investment" in crypto.'
    findings = engine.analyze(text)
    banned_findings = [f for f in findings if f["category"] == "Banned Expression"]
    assert len(banned_findings) == 0


def test_false_positive_guard_definitions(tuned_db):
    engine = RuleEngine(tuned_db)
    text = "By definition, a risk-free investment cannot exist in liquid equity markets."
    findings = engine.analyze(text)
    banned_findings = [f for f in findings if f["category"] == "Banned Expression"]
    assert len(banned_findings) == 0


def test_missing_disclaimer_not_fired_when_disclaimer_present(tuned_db):
    engine = RuleEngine(tuned_db)
    text = "Invest in our international growth fund. Investments are subject to market risk."
    findings = engine.analyze(text)
    missing_disc = [f for f in findings if f["category"] == "Missing Disclaimer"]
    assert len(missing_disc) == 0


def test_semantic_fallback_cannot_lose_money(tuned_db):
    engine = LLMEngine(tuned_db)
    guidelines = tuned_db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    text = "With this novel structure, you simply cannot lose capital over the horizon."
    findings = engine._semantic_fallback_analysis(text, guidelines)
    assert len(findings) >= 1
    assert any("guarantee" in f["explanation"].lower() or "misleading" in str(f["category"]).lower() for f in findings)


def test_semantic_fallback_zero_downside(tuned_db):
    engine = LLMEngine(tuned_db)
    guidelines = tuned_db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    text = "This asset offers zero downside protection under volatile market swings."
    findings = engine._semantic_fallback_analysis(text, guidelines)
    assert len(findings) >= 1


def test_semantic_fallback_sensational_urgency(tuned_db):
    engine = LLMEngine(tuned_db)
    guidelines = tuned_db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    text = "Act now or regret forever as early subscriber seats are closing immediately!"
    findings = engine._semantic_fallback_analysis(text, guidelines)
    assert len(findings) >= 1
    assert any(f["category"] == "Tone Inconsistency" for f in findings)


def test_semantic_fallback_unsupported_metrics(tuned_db):
    engine = LLMEngine(tuned_db)
    guidelines = tuned_db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    text = "Our quantitative strategy achieved a 98% accuracy rate across benchmark cycles."
    findings = engine._semantic_fallback_analysis(text, guidelines)
    assert len(findings) >= 1
    assert any(f["category"] == "Unsupported Claim" for f in findings)


def test_semantic_fallback_bad_citation(tuned_db):
    engine = LLMEngine(tuned_db)
    guidelines = tuned_db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    text = "Rankings compiled by data.fake-financial-ratings.com placed us at the top."
    findings = engine._semantic_fallback_analysis(text, guidelines)
    assert len(findings) >= 1
