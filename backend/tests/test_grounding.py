import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.database.init_db import init_db
from app.models.guideline import BrandGuideline
from app.ai_engine.grounding import validate_finding

@pytest.fixture(scope="module")
def grounding_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    init_db(db)
    yield db
    db.close()

def test_grounding_fake_guideline_id():
    """(a) Fake guideline id -> NEEDS_HUMAN_REVIEW"""
    content = "Our portfolio offers market-competitive growth."
    retrieved_knowledge = {
        "guideline_ids": {1, 2, 3},
        "fact_ids": set(),
        "source_ids": set()
    }
    finding = {
        "engine_source": "LLM Engine",
        "category": "Tone Inconsistency",
        "matched_text": "market-competitive growth",
        "guideline_id": 9999,  # Fake ID
        "explanation": "Testing fake guideline ID",
        "evidence": [{"source": "Internal Policy"}],
        "evidence_state": "verified"
    }

    status, reasons = validate_finding(finding, content, retrieved_knowledge)
    assert status == "NEEDS_HUMAN_REVIEW"
    assert any("not in the retrieved knowledge set" in r for r in reasons)
    assert finding["grounding_status"] == "NEEDS_HUMAN_REVIEW"

def test_grounding_matched_text_not_in_content():
    """(b) matched_text not in content -> NEEDS_HUMAN_REVIEW"""
    content = "Our platform provides automated portfolio rebalancing."
    retrieved_knowledge = {
        "guideline_ids": {1},
        "fact_ids": set(),
        "source_ids": set()
    }
    finding = {
        "engine_source": "LLM Engine",
        "category": "Tone Inconsistency",
        "matched_text": "hallucinated phrase never written",
        "guideline_id": 1,
        "explanation": "Snippet hallucination test",
        "evidence": [{"source": "Guidelines"}],
        "evidence_state": "verified"
    }

    status, reasons = validate_finding(finding, content, retrieved_knowledge)
    assert status == "NEEDS_HUMAN_REVIEW"
    assert any("not a substring" in r for r in reasons)

def test_grounding_url_only_citation_never_verified():
    """(c) URL-only citation never verified"""
    content = "Review our research at https://unverified-stats.org/claim."
    retrieved_knowledge = {
        "guideline_ids": {1},
        "fact_ids": set(),
        "source_ids": set()
    }
    finding = {
        "engine_source": "Citation Validator",
        "category": "Unsupported Claim",
        "matched_text": "https://unverified-stats.org/claim",
        "guideline_id": 1,
        "explanation": "Unverified external citation",
        "evidence": ["https://unverified-stats.org/claim"],
        "evidence_state": "verified"  # should be downgraded
    }

    status, reasons = validate_finding(finding, content, retrieved_knowledge)
    assert status == "NEEDS_HUMAN_REVIEW"
    assert finding["evidence_state"] == "unverified_source"
    assert any("URL without an approved institutional authority" in r for r in reasons)

def test_grounding_valid_rule_finding():
    """(d) valid rule finding -> GROUNDED"""
    content = "We offer guaranteed returns across all investment plans."
    retrieved_knowledge = {
        "guideline_ids": {1, 2, 3},
        "fact_ids": set(),
        "source_ids": set()
    }
    finding = {
        "engine_source": "Rule Engine",
        "category": "Banned Expression",
        "matched_text": "guaranteed returns",
        "explanation": "Banned expression detected",
        "evidence": [{"source": "Brand Compliance Database", "rule": "Banned Expression Registry"}],
        "evidence_state": "verified"
    }

    status, reasons = validate_finding(finding, content, retrieved_knowledge)
    assert status == "GROUNDED"
    assert len(reasons) == 0
    assert finding["grounding_status"] == "GROUNDED"

def test_grounding_guideline_in_db_but_not_retrieved(grounding_db):
    """(e) guideline id exists in DB but not in the retrieved set -> NEEDS_HUMAN_REVIEW"""
    guideline = grounding_db.query(BrandGuideline).first()
    assert guideline is not None

    content = "Experience instant wealth with our financial app."
    # Retrieved set deliberately excludes the DB guideline's ID
    retrieved_knowledge = {
        "guideline_ids": set(),  # empty retrieved set
        "fact_ids": set(),
        "source_ids": set()
    }
    finding = {
        "engine_source": "LLM Engine",
        "category": "Banned Expression",
        "matched_text": "instant wealth",
        "guideline_id": guideline.id,
        "explanation": "Testing guideline in DB but not retrieved",
        "evidence": [{"source": "Guidelines"}],
        "evidence_state": "verified"
    }

    status, reasons = validate_finding(finding, content, retrieved_knowledge)
    assert status == "NEEDS_HUMAN_REVIEW"
    assert any("not in the retrieved knowledge set" in r for r in reasons)
