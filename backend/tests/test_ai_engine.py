import pytest
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.citation_validator import CitationValidator
from app.ai_engine.confidence_scorer import ConfidenceScorer
from app.ai_engine.review_pipeline import AIReviewPipeline

def test_rule_engine_detects_banned_words(db):
    engine = RuleEngine(db)
    text = "We promise guaranteed returns and a risk-free investment on our new platform."
    findings = engine.analyze(text)
    
    matched_phrases = [f["matched_text"].lower() for f in findings]
    assert "guaranteed returns" in matched_phrases
    assert "risk-free investment" in matched_phrases

def test_rule_engine_detects_incorrect_terminology(db):
    engine = RuleEngine(db)
    text = "Download our money app today for wealth wizardry."
    findings = engine.analyze(text)
    
    matched_phrases = [f["matched_text"].lower() for f in findings]
    assert "money app" in matched_phrases

def test_citation_validator_unverified_source(db):
    validator = CitationValidator(db)
    text = "Check out our stats at https://random-blog-unverified.com/finnova"
    findings, metrics = validator.validate_citations(text)
    
    assert metrics["unverified_sources_count"] >= 1
    assert any("random-blog-unverified" in f["matched_text"] for f in findings)

def test_confidence_scorer_scoring():
    scorer = ConfidenceScorer()
    # Clean content = 100
    assert scorer.calculate_compliance_score([]) == 100.0

    # Critical violation deduction
    sample_findings = [{"severity": "Critical"}, {"severity": "High"}]
    score = scorer.calculate_compliance_score(sample_findings)
    assert score < 100.0

@pytest.mark.asyncio
async def test_full_ai_review_pipeline(db):
    pipeline = AIReviewPipeline(db)
    sample_text = (
        "FinNova is an ultra-fast money app that promises guaranteed returns for every customer! "
        "Our new platform provides a risk-free investment opportunity with 100% profit guaranteed."
    )
    result = await pipeline.execute_review(sample_text)
    
    assert "findings" in result
    assert len(result["findings"]) >= 3
    assert result["overall_score"] < 80.0
    assert result["overall_status"] == "Changes Required"

