"""
Phase 1 — Organization Security Tests
Covers: fail-closed org isolation, default guideline fallback, role checks.
No live DB; uses FastAPI TestClient with dependency overrides.
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_org, get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.enums import UserRole


def _make_user(org, role=UserRole.CREATOR):
    u = MagicMock(spec=User)
    u.organization = org
    u.role = role
    u.id = 1
    u.email = "test@example.com"
    u.is_active = True
    u.full_name = "Test User"
    return u


def _make_db():
    """Return a MagicMock DB with deep chaining support."""
    db = MagicMock(spec=Session)
    chain = db.query.return_value
    chain.filter.return_value = chain
    chain.order_by.return_value = chain
    chain.offset.return_value = chain
    chain.limit.return_value = chain
    chain.all.return_value = []
    chain.first.return_value = None
    chain.count.return_value = 0
    return db


def _content_client(org):
    from app.api.v1.content import router as content_router
    user = _make_user(org)
    db = _make_db()
    app = FastAPI()
    app.include_router(content_router, prefix="/api/v1")
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app, raise_server_exceptions=False), db


# ---------------------------------------------------------------------------
# get_current_org unit tests
# ---------------------------------------------------------------------------
class TestGetCurrentOrg:
    def test_raises_403_when_org_is_none(self):
        with pytest.raises(HTTPException) as exc:
            get_current_org(_make_user(None))
        assert exc.value.status_code == 403

    def test_raises_403_when_org_is_empty_string(self):
        with pytest.raises(HTTPException) as exc:
            get_current_org(_make_user(""))
        assert exc.value.status_code == 403

    def test_raises_403_when_org_is_whitespace(self):
        with pytest.raises(HTTPException) as exc:
            get_current_org(_make_user("   "))
        assert exc.value.status_code == 403

    def test_returns_stripped_org_when_valid(self):
        assert get_current_org(_make_user("  AcmeCorp  ")) == "AcmeCorp"


# ---------------------------------------------------------------------------
# Content endpoint: missing / empty org → 403 (checked before any DB call)
# ---------------------------------------------------------------------------
class TestContentOrgIsolation:
    def test_list_content_missing_org_returns_403(self):
        client, _ = _content_client(None)
        assert client.get("/api/v1/content/").status_code == 403

    def test_list_content_empty_org_returns_403(self):
        client, _ = _content_client("")
        assert client.get("/api/v1/content/").status_code == 403

    def test_submit_content_missing_org_returns_403(self):
        client, _ = _content_client(None)
        payload = {"title": "T" * 3, "original_body": "B" * 5, "channel": "social_media"}
        assert client.post("/api/v1/content/", json=payload).status_code == 403

    def test_get_content_missing_org_returns_403(self):
        client, _ = _content_client(None)
        assert client.get("/api/v1/content/999").status_code == 403

    def test_get_revisions_missing_org_returns_403(self):
        client, _ = _content_client(None)
        assert client.get("/api/v1/content/999/revisions").status_code == 403

    def test_cross_org_content_returns_403(self):
        """User from OrgA must not access content owned by OrgB."""
        from app.models.content import Content
        from app.api.v1.content import router as content_router

        user = _make_user("OrgA")
        db = _make_db()
        content_obj = MagicMock(spec=Content)
        content_obj.organization = "OrgB"
        content_obj.id = 42
        # first() returns OrgB content for any filter chain
        db.query.return_value.filter.return_value.first.return_value = content_obj

        app = FastAPI()
        app.include_router(content_router, prefix="/api/v1")
        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: db
        client = TestClient(app, raise_server_exceptions=False)

        assert client.get("/api/v1/content/42").status_code == 403


# ---------------------------------------------------------------------------
# review_pipeline: default guideline fallback
# ---------------------------------------------------------------------------
class TestDefaultGuidelineFallback:
    def _make_pipeline(self, db):
        from app.ai_engine.review_pipeline import AIReviewPipeline
        pipeline = AIReviewPipeline(db)
        pipeline.rule_engine.analyze = MagicMock(return_value=[])
        pipeline.llm_engine.analyze = AsyncMock(return_value=[])
        pipeline.citation_validator.validate_findings = MagicMock(return_value=[])
        pipeline.citation_validator.validate_citations = MagicMock(return_value=([], {}))
        return pipeline

    @pytest.mark.asyncio
    async def test_org_with_no_guidelines_uses_default(self):
        from app.models.guideline import BrandGuideline
        db = _make_db()
        default_gl = MagicMock(spec=BrandGuideline)
        default_gl.id = 1
        default_gl.text = "Use brand colors."
        default_gl.organization = "BrandGuard Demo Enterprise"
        default_gl.is_active = True

        call_count = {"n": 0}
        def _all():
            call_count["n"] += 1
            return [] if call_count["n"] == 1 else [default_gl]

        db.query.return_value.filter.return_value.all.side_effect = _all

        pipeline = self._make_pipeline(db)
        with patch("app.ai_engine.review_pipeline.retrieve_kb_chunks", return_value=[]):
            result = await pipeline.execute_review("Sample text", org="UnknownOrg")

        assert result["using_default_guidelines"] is True

    @pytest.mark.asyncio
    async def test_missing_org_uses_default_guidelines(self):
        db = _make_db()
        pipeline = self._make_pipeline(db)
        with patch("app.ai_engine.review_pipeline.retrieve_kb_chunks", return_value=[]):
            result = await pipeline.execute_review("Sample text", org=None)
        assert result["using_default_guidelines"] is True

    @pytest.mark.asyncio
    async def test_org_with_own_guidelines_not_using_default(self):
        from app.models.guideline import BrandGuideline
        db = _make_db()
        own_gl = MagicMock(spec=BrandGuideline)
        own_gl.id = 10
        own_gl.text = "Use brand font."
        own_gl.organization = "AcmeCorp"
        own_gl.is_active = True
        db.query.return_value.filter.return_value.all.return_value = [own_gl]

        pipeline = self._make_pipeline(db)
        with patch("app.ai_engine.review_pipeline.retrieve_kb_chunks", return_value=[]):
            result = await pipeline.execute_review("Sample text", org="AcmeCorp")
        assert result["using_default_guidelines"] is False
