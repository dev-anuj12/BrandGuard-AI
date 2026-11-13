"""
Phase 2 tests — Knowledge Base Chunk Retrieval & Grounding.

Covers:
1. Multi-tenant organization isolation of KB retrieval (BM25 term scoring).
2. Text extraction and deterministic chunking with offset tracking.
3. Grounding validation:
   - Finding with no retrieved evidence -> marked NEEDS_HUMAN_REVIEW.
   - Finding referencing a valid retrieved KB chunk -> marked GROUNDED.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.guideline import KBChunk, BrandGuideline
from app.services.kb_retrieval import (
    chunk_text,
    retrieve_kb_chunks,
    save_document_chunks,
    bm25_score_chunks,
)
from app.ai_engine.grounding import validate_finding


@pytest.fixture
def kb_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


class TestKBTextChunking:
    def test_chunking_sample_txt(self):
        sample_text = (
            "BrandGuard AI compliance rules mandate that all marketing materials "
            "must contain the official investment disclaimer. Never use colloquial terms "
            "like crypto moon or guaranteed returns in institutional communications. "
            "All claims regarding investment performance must be substantiated by official audits."
        )
        chunks = chunk_text(sample_text, chunk_size=120, overlap=20)
        assert len(chunks) >= 2
        for i, c in enumerate(chunks):
            assert c["chunk_index"] == i
            assert c["offset"] >= 0
            assert len(c["text"]) > 0
            # Offset correctly matches start position in original text
            assert sample_text.startswith(c["text"][:10], c["offset"])

    def test_chunking_empty_or_whitespace_returns_empty(self):
        assert chunk_text("") == []
        assert chunk_text("   \n\t  ") == []


class TestKBOrganizationIsolation:
    def test_org_isolation_of_retrieval(self, kb_db):
        org_a = "Acme Corp"
        org_b = "Beta Technologies"

        # Org A chunks
        save_document_chunks(
            kb_db,
            filename="acme_guidelines.txt",
            text="Acme Corp requires all financial products to state that investments involve risk.",
            org=org_a
        )

        # Org B chunks with high term overlap for "financial products investments risk"
        save_document_chunks(
            kb_db,
            filename="beta_guidelines.txt",
            text="Beta Technologies confidential policy: financial products investments risk disclaimer.",
            org=org_b
        )

        # Query retrieval for Org A
        query = "financial products investments risk"
        results_a = retrieve_kb_chunks(kb_db, org=org_a, query_text=query, top_k=5)
        results_b = retrieve_kb_chunks(kb_db, org=org_b, query_text=query, top_k=5)

        # Org A must receive only Org A's chunks
        assert len(results_a) > 0
        for chunk in results_a:
            assert chunk.organization == org_a
            assert chunk.organization != org_b

        # Org B must receive only Org B's chunks
        assert len(results_b) > 0
        for chunk in results_b:
            assert chunk.organization == org_b
            assert chunk.organization != org_a

    def test_retrieval_no_match_returns_empty(self, kb_db):
        save_document_chunks(
            kb_db,
            filename="doc.txt",
            text="Blue ocean strategy for corporate branding.",
            org="Acme Corp"
        )
        results = retrieve_kb_chunks(kb_db, org="Acme Corp", query_text="xylophone quantum physics", top_k=5)
        assert results == []


class TestKBGroundingEvidence:
    def test_finding_with_no_retrieved_evidence_marked_needs_human_review(self):
        """A semantic finding referencing an unretrieved guideline ID or lacking evidence is marked NEEDS_HUMAN_REVIEW."""
        content = "Get guaranteed returns on our investment platform today."
        finding = {
            "category": "Unsupported Claim",
            "severity": "High",
            "matched_text": "guaranteed returns",
            "explanation": "Guaranteed returns claim lacks substantiation.",
            "guideline_id": 9999,  # ID not in retrieved knowledge set
            "evidence": [],
            "engine_source": "AI Engine (Fallback)"
        }

        retrieved_knowledge = {
            "guideline_ids": {1, 2, 3},  # 9999 is missing
            "chunk_ids": set()
        }

        status, reasons = validate_finding(finding, content, retrieved_knowledge)
        assert status == "NEEDS_HUMAN_REVIEW"
        assert any("9999" in r for r in reasons)
        assert finding["grounding_status"] == "NEEDS_HUMAN_REVIEW"

    def test_finding_with_valid_retrieved_chunk_grounded(self):
        """A finding referencing a valid retrieved KB chunk is marked GROUNDED."""
        content = "We offer unmatched portfolio stability."
        finding = {
            "category": "Tone Inconsistency",
            "severity": "Medium",
            "matched_text": "unmatched portfolio stability",
            "explanation": "Superlative claims must be substantiated.",
            "chunk_id": 42,
            "evidence": [{"source": "KB: guidelines.txt", "offset": 100}],
            "evidence_state": "verified",
            "engine_source": "AI Engine (Fallback)"
        }

        retrieved_knowledge = {
            "guideline_ids": set(),
            "chunk_ids": {42}  # 42 is present in retrieved knowledge
        }

        status, reasons = validate_finding(finding, content, retrieved_knowledge)
        assert status == "GROUNDED"
        assert reasons == []
        assert finding["grounding_status"] == "GROUNDED"

    def test_finding_with_unretrieved_chunk_marked_needs_human_review(self):
        """A finding referencing a chunk_id not in retrieved chunks is flagged."""
        content = "We offer unmatched portfolio stability."
        finding = {
            "category": "Tone Inconsistency",
            "severity": "Medium",
            "matched_text": "unmatched portfolio stability",
            "explanation": "Superlative claims must be substantiated.",
            "chunk_id": 888,
            "evidence": [{"source": "KB: guidelines.txt"}],
            "evidence_state": "verified",
            "engine_source": "AI Engine (Fallback)"
        }

        retrieved_knowledge = {
            "guideline_ids": set(),
            "chunk_ids": {42}  # 888 is NOT retrieved
        }

        status, reasons = validate_finding(finding, content, retrieved_knowledge)
        assert status == "NEEDS_HUMAN_REVIEW"
        assert any("888" in r for r in reasons)
