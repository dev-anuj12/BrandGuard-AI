"""
LLM Engine — Phase 1 hardened implementation.

Provider selection:
  AI_PROVIDER=openai   → OpenAI gpt-4o-mini (requires OPENAI_API_KEY)
  AI_PROVIDER=gemini   → Gemini 1.5 Flash (requires GEMINI_API_KEY)
  AI_PROVIDER=<other>  → Deterministic semantic fallback immediately

Retry: one retry after 2 s on timeout or HTTP 429/5xx.
Output: each raw LLM dict is validated with LLMFinding (Pydantic); invalid items are dropped.
engine_source is set programmatically, never trusted from LLM prompt output.
"""

import asyncio
import json
import re
from typing import List, Dict, Any, Optional

import httpx
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.guideline import BrandGuideline, ApprovedFact
from app.models.enums import FindingCategory, SeverityLevel
from app.ai_engine.normalizer import (
    normalize_text,
    is_false_positive_context,
    extract_original_snippet,
)

# ── Pydantic output schema for a single LLM finding ─────────────────────────

_VALID_CATEGORIES = {
    "Tone Inconsistency", "Unsupported Claim", "Misleading Statement",
    "Banned Expression", "Missing Disclaimer",
}
_VALID_SEVERITIES = {"Low", "Medium", "High", "Critical"}


class LLMFinding(BaseModel):
    category: str
    severity: str
    matched_text: str
    explanation: str
    guideline_reference: Optional[str] = None
    evidence: Optional[List[Any]] = None
    confidence: Optional[float] = None
    suggested_correction: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in _VALID_CATEGORIES:
            raise ValueError(f"Unknown category '{v}'")
        return v

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        # Accept title-case or upper-case
        title = v.title()
        if title not in _VALID_SEVERITIES:
            raise ValueError(f"Unknown severity '{v}'")
        return title

    @field_validator("matched_text")
    @classmethod
    def non_empty_matched_text(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("matched_text must not be empty")
        return v.strip()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _strip_fence(text: str) -> str:
    """Remove markdown code fences from LLM output."""
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0]
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0]
    return text.strip()


def _parse_and_validate_llm_output(raw: str, engine_source: str) -> List[Dict[str, Any]]:
    """Parse JSON array from raw LLM text; validate each item; drop malformed."""
    cleaned = _strip_fence(raw)
    parsed = json.loads(cleaned)  # raises json.JSONDecodeError on bad JSON
    if not isinstance(parsed, list):
        raise ValueError("LLM returned non-list JSON")

    results: List[Dict[str, Any]] = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        try:
            validated = LLMFinding.model_validate(item)
        except Exception:
            # Drop individual malformed findings; do not crash entire call
            continue
        result_dict = validated.model_dump()
        # engine_source always set programmatically — never from LLM text
        result_dict["engine_source"] = engine_source
        result_dict["status"] = "Pending"
        result_dict["evidence_state"] = "verified"
        if result_dict["evidence"] is None:
            result_dict["evidence"] = []
        results.append(result_dict)

    return results


async def _call_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs,
) -> httpx.Response:
    """Make one HTTP call; retry once after 2 s on timeout or 429/5xx."""
    for attempt in range(2):
        try:
            resp = await client.request(method, url, **kwargs)
            if attempt == 0 and resp.status_code in (429, 500, 502, 503, 504):
                await asyncio.sleep(2)
                continue
            resp.raise_for_status()
            return resp
        except httpx.TimeoutException:
            if attempt == 0:
                await asyncio.sleep(2)
                continue
            raise
    # Second attempt — let any exception propagate
    resp = await client.request(method, url, **kwargs)
    resp.raise_for_status()
    return resp


# ── LLMEngine ────────────────────────────────────────────────────────────────

class LLMEngine:
    ENGINE_SOURCE_LLM_OPENAI = "LLM Engine (OpenAI)"
    ENGINE_SOURCE_LLM_GEMINI = "LLM Engine (Gemini)"
    ENGINE_SOURCE_FALLBACK = "AI Engine (Fallback)"

    def __init__(self, db: Session):
        self.db = db
        self._last_mode: str = "rules"   # 'rules' | 'ai'
        self._last_provider: str = "fallback"  # 'openai' | 'gemini' | 'fallback'

    async def analyze(self, text: str) -> List[Dict[str, Any]]:
        """
        Analyze text for brand compliance.

        Provider is selected by AI_PROVIDER env var:
          'openai'  → OpenAI (requires OPENAI_API_KEY)
          'gemini'  → Gemini (requires GEMINI_API_KEY)
          anything else → immediate deterministic fallback
        On any LLM error: falls back to deterministic engine; engine_source
        and analysis_mode reflect the fallback truthfully.
        """
        guidelines = self.db.query(BrandGuideline).filter(
            BrandGuideline.is_active == True
        ).all()
        facts = self.db.query(ApprovedFact).filter(
            ApprovedFact.is_active == True
        ).all()

        provider = (settings.AI_PROVIDER or "rule_fallback").lower()

        if provider == "openai":
            if not settings.OPENAI_API_KEY:
                print("[LLM Engine] AI_PROVIDER=openai but OPENAI_API_KEY is not set. Falling back.")
            else:
                try:
                    findings = await self._call_openai(
                        text,
                        "\n".join(f"- [{g.category}] {g.title}: {g.description}" for g in guidelines),
                        "\n".join(f"- [{f.category}] {f.statement}" for f in facts),
                    )
                    self._last_mode = "ai"
                    self._last_provider = "openai"
                    return findings
                except Exception as exc:
                    print(f"[LLM Engine] OpenAI call failed: {exc}. Falling back to deterministic engine.")

        elif provider == "gemini":
            if not settings.GEMINI_API_KEY:
                print("[LLM Engine] AI_PROVIDER=gemini but GEMINI_API_KEY is not set. Falling back.")
            else:
                try:
                    findings = await self._call_gemini(
                        text,
                        "\n".join(f"- [{g.category}] {g.title}: {g.description}" for g in guidelines),
                        "\n".join(f"- [{f.category}] {f.statement}" for f in facts),
                    )
                    self._last_mode = "ai"
                    self._last_provider = "gemini"
                    return findings
                except Exception as exc:
                    print(f"[LLM Engine] Gemini call failed: {exc}. Falling back to deterministic engine.")

        # Deterministic fallback (also reached when AI_PROVIDER is 'rule_fallback' or unrecognised)
        self._last_mode = "rules"
        self._last_provider = "fallback"
        return self._semantic_fallback_analysis(text, guidelines)

    # ── Private: OpenAI ───────────────────────────────────────────────────────

    async def _call_openai(
        self, text: str, guidelines: str, facts: str
    ) -> List[Dict[str, Any]]:
        system_prompt = (
            "You are BrandGuard AI, an expert brand compliance auditor.\n"
            f"Brand Guidelines:\n{guidelines}\n\n"
            f"Approved Facts:\n{facts}\n\n"
            "Analyze the marketing content for compliance violations.\n"
            "Return ONLY a valid JSON array. Each object must have:\n"
            '  "category": one of "Tone Inconsistency","Unsupported Claim","Misleading Statement","Banned Expression","Missing Disclaimer"\n'
            '  "severity": one of "Low","Medium","High","Critical"\n'
            '  "matched_text": exact substring from the input\n'
            '  "explanation": clear justification\n'
            '  "guideline_reference": name of the breached guideline\n'
            '  "evidence": []\n'
            '  "confidence": 0.0-1.0\n'
            '  "suggested_correction": compliant alternative\n'
            "If no violations, return []."
        )
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await _call_with_retry(
                client, "POST",
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text},
                    ],
                    "temperature": 0.1,
                },
            )
        raw = resp.json()["choices"][0]["message"]["content"]
        return _parse_and_validate_llm_output(raw, self.ENGINE_SOURCE_LLM_OPENAI)

    # ── Private: Gemini ───────────────────────────────────────────────────────

    async def _call_gemini(
        self, text: str, guidelines: str, facts: str
    ) -> List[Dict[str, Any]]:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        )
        instruction = (
            "You are BrandGuard AI, an expert brand compliance auditor.\n"
            f"Brand Guidelines:\n{guidelines}\n"
            f"Approved Facts:\n{facts}\n"
            "Return a JSON array of findings only. Each item: category, severity, "
            "matched_text, explanation, guideline_reference, evidence, confidence, suggested_correction."
        )
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await _call_with_retry(
                client, "POST", url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [
                            {"text": instruction},
                            {"text": f"Content to review:\n{text}"},
                        ]
                    }],
                    "generationConfig": {"temperature": 0.1},
                },
            )
        raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return _parse_and_validate_llm_output(raw, self.ENGINE_SOURCE_LLM_GEMINI)

    # ── Private: Deterministic Semantic Fallback ─────────────────────────────

    def _semantic_fallback_analysis(
        self, text: str, guidelines: List[BrandGuideline]
    ) -> List[Dict[str, Any]]:
        """Deterministic heuristic engine. engine_source always set to FALLBACK."""
        findings: List[Dict[str, Any]] = []
        normalized_text = normalize_text(text)
        lowered = normalized_text.lower()

        fallback_patterns = [
            # 1. Hype & Sensationalist Tone
            (
                r'\b(unbelievable|crazy returns|insane growth|skyrocket|blow your mind|secret trick)\b',
                "Sensationalized Hype",
                "Tone is sensationalized and inconsistent with a professional, trustworthy, and responsible brand identity.",
                "Brand Tone & Communication Consistency",
                "disciplined, long-term financial growth",
                SeverityLevel.HIGH,
                FindingCategory.TONE_INCONSISTENCY,
            ),
            (
                r'\b(wealth wizardry|crypto moon|money hack)\b',
                "Unprofessional Slang",
                "Colloquial terminology undermines institutional brand reputation and professional credibility.",
                "Official Terminology Standard",
                "modern digital wealth management solutions",
                SeverityLevel.MEDIUM,
                FindingCategory.TONE_INCONSISTENCY,
            ),
            (
                r"\b(act now or regret forever|limited time rush|don\'t miss out|once[\s\-]in[\s\-]a[\s\-]lifetime|limited\s+(?:spots?|seats?|availability)|closing\s+soon|act\s+(?:now|fast)|become wealthy now)\b",
                "High-Pressure Urgency",
                "Urgency tactics contradict the brand principle of patient, customer-centric advisory.",
                "Brand Tone & Communication Consistency",
                "explore our options at your own pace",
                SeverityLevel.MEDIUM,
                FindingCategory.TONE_INCONSISTENCY,
            ),
            (
                r'\b(multiply\s+your\s+wealth\s+fast|make\s+\w+\s+(?:extraordinarily|insanely|ultra)\s+wealthy|life-changing\s+returns?|in\s+a\s+class\s+of\s+its\s+own|unmatched\s+in\s+the\s+industry)\b',
                "Sensationalized Wealth Promise",
                "Sensationalized promises of outsized or rapid wealth accumulation contradict brand tone standards.",
                "Brand Tone & Communication Consistency",
                "long-term, disciplined portfolio growth",
                SeverityLevel.HIGH,
                FindingCategory.TONE_INCONSISTENCY,
            ),
            # 2. Financial Guarantee Paraphrases
            (
                r"\b(cannot|can\'t|cant|won\'t|wont|will not|never)\s+(?:simply\s+)?(lose|drop|diminish)\s+(?:money|capital|funds|core investment|deposit)\b",
                "Paraphrased Capital Guarantee",
                "Implying that an investor cannot lose money represents an unsubstantiated financial guarantee.",
                "Financial Claims & Guarantees Policy",
                "capital preservation strategies subject to market conditions",
                SeverityLevel.CRITICAL,
                FindingCategory.MISLEADING_STATEMENT,
            ),
            (
                r'\b(never\s+seen\s+a\s+negative\s+outcome|zero[\s\-]+downside|foolproof|no\s+risk\s+at\s+all|zero\s+risk)\b',
                "Misleading Zero-Downside Claim",
                "Statement implies total immunity from market risk, violating financial advertising standards.",
                "Financial Claims & Guarantees Policy",
                "risk-managed strategies aligned with your objectives",
                SeverityLevel.CRITICAL,
                FindingCategory.MISLEADING_STATEMENT,
            ),
            (
                r'\b(in\s+practice,?\s+risk[\s\-_]*free|effectively\s+risk[\s\-_]*free|practically\s+risk[\s\-_]*free)\b',
                "Obfuscated Risk-Free Guarantee",
                "Describing investment opportunities as practically or effectively risk-free is prohibited.",
                "Financial Claims & Guarantees Policy",
                "low-volatility portfolio structure",
                SeverityLevel.CRITICAL,
                FindingCategory.BANNED_EXPRESSION,
            ),
            (
                r'\b(sure|certain|guaranteed|inevitable)\s+(?:profit|profits|gains?|returns?)\b',
                "Guaranteed Profit Claim",
                "Promising certain or guaranteed profits on market-linked instruments is prohibited.",
                "Financial Claims & Guarantees Policy",
                "projections based on historical models",
                SeverityLevel.CRITICAL,
                FindingCategory.UNSUPPORTED_CLAIM,
            ),
            (
                r'\b(100%\s+profit|guarantees?\s+100%\s+profit)\b',
                "Absolute Profit Promise",
                "Absolute profit promises contradict financial compliance standards.",
                "Financial Claims & Guarantees Policy",
                "competitive return targets",
                SeverityLevel.CRITICAL,
                FindingCategory.UNSUPPORTED_CLAIM,
            ),
            # 3. Unsupported Superiority & Quantitative Claims
            (
                r'\b((?:\d+|nine|eight|seven)\s+out\s+of\s+(?:ten|10)|\d+%\s+accuracy\s+rate|(?:saved|earned|generated)\s+(?:its\s+)?(?:clients|users)\s+over|outperform(?:ed|s)?\s+(?:\d+%|the\s+market)|(?:always|consistently)\s+(?:beats?|outperforms?)\s+(?:inflation|the\s+market|peers)|zero\s+reported\s+losses)\b',
                "Unsupported Quantitative Claim",
                "Specific statistical or competitive superiority claims must be backed by verifiable citations.",
                "Claims Substantiation Standard",
                "substantiated benchmark comparisons",
                SeverityLevel.HIGH,
                FindingCategory.UNSUPPORTED_CLAIM,
            ),
            # 4. Bad / Suspicious Citation Domains
            (
                r'\b[a-zA-Z0-9_\.-]*\.(?:fake[a-zA-Z0-9_\.-]*|made-up[a-zA-Z0-9_\.-]*|exampleonly[a-zA-Z0-9_\.-]*)\b',
                "Unverified Source Citation",
                "Citations must reference reputable, authoritative, and independently verifiable sources.",
                "Citation & Evidence Policy",
                "approved industry benchmarks or official filings",
                SeverityLevel.HIGH,
                FindingCategory.UNSUPPORTED_CLAIM,
            ),
        ]

        guideline_by_title = {g.title.lower(): g for g in (guidelines or [])}
        guideline_by_cat = {g.category.lower(): g for g in (guidelines or [])}

        for pattern, label, explanation, guideline_ref, suggestion, severity, cat in fallback_patterns:
            matches = list(re.finditer(pattern, lowered))
            for match in matches:
                start, end = match.span()
                if is_false_positive_context(lowered, start, end):
                    continue
                norm_snippet = normalized_text[start:end]
                matched_snippet = extract_original_snippet(text, norm_snippet)

                matched_guideline = (
                    guideline_by_title.get(guideline_ref.lower())
                    or guideline_by_cat.get(guideline_ref.lower())
                    or (guideline_by_title.get("financial claims & guarantees policy") if "financial" in guideline_ref.lower() or "guarantee" in guideline_ref.lower() else None)
                    or (guideline_by_title.get("financial claims policy") if "claims" in guideline_ref.lower() else None)
                    or (guideline_by_title.get("substantiation policy") if "substantiation" in guideline_ref.lower() or "claim" in guideline_ref.lower() else None)
                    or (guideline_by_title.get("superlative claims policy") if "superlative" in guideline_ref.lower() or "tone" in guideline_ref.lower() else None)
                    or (guideline_by_title.get("brand tone & communication consistency") if "tone" in guideline_ref.lower() else None)
                    or (guideline_by_title.get("evidence & citation validation requirement") if "evidence" in guideline_ref.lower() or "citation" in guideline_ref.lower() else None)
                )
                gid = matched_guideline.id if matched_guideline else None
                ref_name = matched_guideline.title if matched_guideline else guideline_ref

                if any(kw in matched_snippet for kw in ("fake", "made-up", "exampleonly")):
                    ev_state = "unverified_source"
                else:
                    ev_state = "verified"

                findings.append({
                    "category": cat,
                    "severity": severity,
                    "matched_text": matched_snippet,
                    "explanation": explanation,
                    "guideline_id": gid,
                    "guideline_reference": ref_name,
                    "evidence": [{"source": "Brand Guidelines Compliance System", "rule": ref_name}],
                    "evidence_state": ev_state,
                    "confidence": 0.91,
                    "suggested_correction": suggestion,
                    "status": "Pending",
                    # engine_source always set programmatically
                    "engine_source": self.ENGINE_SOURCE_FALLBACK,
                })

        return findings
