"""
Phase 1 tests — LLM Engine hardening.

Covers:
  - AI_PROVIDER=openai success path (mocked HTTP)
  - AI_PROVIDER=openai timeout then success (retry)
  - AI_PROVIDER=openai invalid JSON → fallback
  - AI_PROVIDER=openai HTTP 429 then success (retry)
  - AI_PROVIDER=gemini success path (mocked HTTP)
  - AI_PROVIDER=rule_fallback → immediate deterministic fallback, no HTTP call
  - engine_source is set programmatically, not from LLM text
  - Pydantic: malformed finding (bad category) dropped, valid ones kept
  - Live call: NOT run (no key set)

No live HTTP calls are made in this file.
"""

import asyncio
import json
from typing import Any, List
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

# ── Minimal DB mock ────────────────────────────────────────────────────────

class _FakeGuideline:
    id = 1
    title = "Financial Claims & Guarantees Policy"
    category = "Financial"
    description = "No guaranteed returns."
    is_active = True


class _FakeFact:
    id = 1
    category = "Fact"
    statement = "BrandGuard is a brand compliance engine."
    is_active = True


class _FakeQuery:
    def __init__(self, items):
        self.items = items

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self.items


class _FakeDB:
    def query(self, model):
        from app.models.guideline import ApprovedFact
        if model is ApprovedFact:
            return _FakeQuery([_FakeFact()])
        return _FakeQuery([_FakeGuideline()])


# ── Helpers ────────────────────────────────────────────────────────────────

def _make_engine():
    from app.ai_engine.llm_engine import LLMEngine
    return LLMEngine(_FakeDB())


def _openai_resp(findings: List[dict]) -> httpx.Response:
    body = json.dumps({
        "choices": [{"message": {"content": json.dumps(findings)}}]
    })
    req = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    return httpx.Response(200, content=body.encode(), request=req)


def _gemini_resp(findings: List[dict]) -> httpx.Response:
    body = json.dumps({
        "candidates": [{"content": {"parts": [{"text": json.dumps(findings)}]}}]
    })
    req = httpx.Request("POST", "https://generativelanguage.googleapis.com")
    return httpx.Response(200, content=body.encode(), request=req)


VALID_FINDING = {
    "category": "Unsupported Claim",
    "severity": "High",
    "matched_text": "guaranteed returns",
    "explanation": "Returns cannot be guaranteed.",
    "guideline_reference": "Financial Claims & Guarantees Policy",
    "evidence": [],
    "confidence": 0.9,
    "suggested_correction": "historically competitive returns",
}

# ── Tests ──────────────────────────────────────────────────────────────────

class TestLLMEngineOpenAISuccess:
    def test_openai_findings_returned_and_engine_source_set(self):
        """Happy path: OpenAI returns one valid finding; engine_source set by code, not LLM."""
        engine = _make_engine()
        mock_resp = _openai_resp([VALID_FINDING])

        async def _run():
            # Patch the already-imported 'settings' name inside the llm_engine module
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    inst = AsyncMock()
                    inst.__aenter__ = AsyncMock(return_value=inst)
                    inst.__aexit__ = AsyncMock(return_value=False)
                    inst.request = AsyncMock(return_value=mock_resp)
                    MockClient.return_value = inst

                    findings = await engine.analyze("Our fund offers guaranteed returns.")

            assert len(findings) == 1
            assert findings[0]["engine_source"] == "LLM Engine (OpenAI)"
            assert findings[0]["category"] == "Unsupported Claim"
            assert engine._last_mode == "ai"
            assert engine._last_provider == "openai"

        asyncio.run(_run())


class TestLLMEngineOpenAIRetryTimeout:
    def test_timeout_then_success_retries_once(self):
        """First call raises TimeoutException; second call succeeds."""
        engine = _make_engine()
        mock_resp = _openai_resp([VALID_FINDING])
        call_count = {"n": 0}

        async def fake_request(method, url, **kwargs):
            call_count["n"] += 1
            if call_count["n"] == 1:
                raise httpx.TimeoutException("timed out")
            return mock_resp

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.asyncio.sleep", new=AsyncMock()):
                    with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                        inst = AsyncMock()
                        inst.__aenter__ = AsyncMock(return_value=inst)
                        inst.__aexit__ = AsyncMock(return_value=False)
                        inst.request = AsyncMock(side_effect=fake_request)
                        MockClient.return_value = inst

                        findings = await engine.analyze("guaranteed returns")

            assert call_count["n"] == 2
            assert len(findings) == 1
            assert findings[0]["engine_source"] == "LLM Engine (OpenAI)"

        asyncio.run(_run())


class TestLLMEngineOpenAI429Retry:
    def test_429_then_success_retries_once(self):
        """First call returns HTTP 429; second succeeds."""
        engine = _make_engine()
        resp_429 = httpx.Response(429, content=b'{"error":"rate limited"}')
        resp_ok = _openai_resp([VALID_FINDING])
        call_count = {"n": 0}

        async def fake_request(method, url, **kwargs):
            call_count["n"] += 1
            if call_count["n"] == 1:
                return resp_429
            return resp_ok

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.asyncio.sleep", new=AsyncMock()):
                    with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                        inst = AsyncMock()
                        inst.__aenter__ = AsyncMock(return_value=inst)
                        inst.__aexit__ = AsyncMock(return_value=False)
                        inst.request = AsyncMock(side_effect=fake_request)
                        MockClient.return_value = inst

                        findings = await engine.analyze("guaranteed returns")

            assert call_count["n"] == 2
            assert len(findings) == 1

        asyncio.run(_run())


class TestLLMEngineInvalidJSONFallback:
    def test_invalid_json_from_llm_triggers_deterministic_fallback(self):
        """If LLM returns malformed JSON, engine falls back; engine_source = Fallback."""
        engine = _make_engine()

        bad_body = json.dumps({
            "choices": [{"message": {"content": "not valid json {"}}]
        })
        bad_resp = httpx.Response(200, content=bad_body.encode())

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    inst = AsyncMock()
                    inst.__aenter__ = AsyncMock(return_value=inst)
                    inst.__aexit__ = AsyncMock(return_value=False)
                    inst.request = AsyncMock(return_value=bad_resp)
                    MockClient.return_value = inst

                    # Pass a text that the fallback engine WILL catch
                    findings = await engine.analyze("guaranteed returns for investors")

            # Fallback triggered → engine_source is FALLBACK
            assert engine._last_mode == "rules"
            assert engine._last_provider == "fallback"
            # All findings from fallback carry fallback engine_source
            for f in findings:
                assert f["engine_source"] == "AI Engine (Fallback)"

        asyncio.run(_run())


class TestLLMEnginePydanticDropsMalformed:
    def test_malformed_finding_dropped_valid_kept(self):
        """LLM returns two items: one with unknown category (dropped), one valid (kept)."""
        engine = _make_engine()
        bad_finding = dict(VALID_FINDING, category="Invented Category")
        payload = [bad_finding, VALID_FINDING]
        mock_resp = _openai_resp(payload)

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    inst = AsyncMock()
                    inst.__aenter__ = AsyncMock(return_value=inst)
                    inst.__aexit__ = AsyncMock(return_value=False)
                    inst.request = AsyncMock(return_value=mock_resp)
                    MockClient.return_value = inst

                    findings = await engine.analyze("guaranteed returns")

            assert len(findings) == 1
            assert findings[0]["category"] == "Unsupported Claim"

        asyncio.run(_run())


class TestLLMEngineGeminiSuccess:
    def test_gemini_findings_returned_and_engine_source_set(self):
        """Gemini happy path: engine_source = 'LLM Engine (Gemini)'."""
        engine = _make_engine()
        mock_resp = _gemini_resp([VALID_FINDING])

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "gemini"
                mock_settings.OPENAI_API_KEY = None
                mock_settings.GEMINI_API_KEY = "gm-test"
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    inst = AsyncMock()
                    inst.__aenter__ = AsyncMock(return_value=inst)
                    inst.__aexit__ = AsyncMock(return_value=False)
                    inst.request = AsyncMock(return_value=mock_resp)
                    MockClient.return_value = inst

                    findings = await engine.analyze("guaranteed returns")

            assert len(findings) == 1
            assert findings[0]["engine_source"] == "LLM Engine (Gemini)"
            assert engine._last_mode == "ai"
            assert engine._last_provider == "gemini"

        asyncio.run(_run())


class TestLLMEngineRuleFallbackNoHTTP:
    def test_rule_fallback_provider_makes_no_http_call(self):
        """AI_PROVIDER=rule_fallback → no HTTP call, deterministic fallback immediately."""
        engine = _make_engine()

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "rule_fallback"
                mock_settings.OPENAI_API_KEY = None
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    findings = await engine.analyze("guaranteed returns for all investors")
                    MockClient.assert_not_called()

            assert engine._last_mode == "rules"
            for f in findings:
                assert f["engine_source"] == "AI Engine (Fallback)"

        asyncio.run(_run())


class TestLLMEngineEngineSourceNotFromLLM:
    def test_llm_engine_source_field_overwritten_by_code(self):
        """Even if LLM injects a different engine_source, the code overwrites it."""
        engine = _make_engine()
        tampered = dict(VALID_FINDING)
        tampered["engine_source"] = "INJECTED_VALUE"
        mock_resp = _openai_resp([tampered])

        async def _run():
            with patch("app.ai_engine.llm_engine.settings") as mock_settings:
                mock_settings.AI_PROVIDER = "openai"
                mock_settings.OPENAI_API_KEY = "sk-test"
                mock_settings.GEMINI_API_KEY = None
                with patch("app.ai_engine.llm_engine.httpx.AsyncClient") as MockClient:
                    inst = AsyncMock()
                    inst.__aenter__ = AsyncMock(return_value=inst)
                    inst.__aexit__ = AsyncMock(return_value=False)
                    inst.request = AsyncMock(return_value=mock_resp)
                    MockClient.return_value = inst

                    findings = await engine.analyze("guaranteed returns")

            # Must be overwritten by code, not from LLM
            assert findings[0]["engine_source"] == "LLM Engine (OpenAI)"

        asyncio.run(_run())
