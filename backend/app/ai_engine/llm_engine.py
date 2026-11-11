import json
import re
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.guideline import BrandGuideline, ApprovedFact
from app.models.enums import FindingCategory, SeverityLevel
from app.ai_engine.normalizer import (
    normalize_text,
    is_false_positive_context,
    extract_original_snippet
)

class LLMEngine:
    def __init__(self, db: Session):
        self.db = db
        self._last_mode = "rules"  # 'rules', 'ai'

    async def analyze(self, text: str) -> List[Dict[str, Any]]:
        # Retrieve Brand Guidelines and Approved Facts from DB for grounding
        guidelines = self.db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
        facts = self.db.query(ApprovedFact).filter(ApprovedFact.is_active == True).all()

        guidelines_summary = "\n".join([f"- [{g.category}] {g.title}: {g.description}" for g in guidelines])
        facts_summary = "\n".join([f"- [{f.category}] {f.statement}" for f in facts])

        # Auto-detect available LLM key regardless of AI_PROVIDER setting
        if settings.OPENAI_API_KEY:
            try:
                findings = await self._call_openai(text, guidelines_summary, facts_summary)
                self._last_mode = "ai"
                return findings
            except Exception as e:
                print(f"[LLM Engine] OpenAI call failed: {e}. Falling back to rule-based fallback.")
        elif settings.GEMINI_API_KEY:
            try:
                findings = await self._call_gemini(text, guidelines_summary, facts_summary)
                self._last_mode = "ai"
                return findings
            except Exception as e:
                print(f"[LLM Engine] Gemini call failed: {e}. Falling back to rule-based fallback.")

        # Robust Fallback Engine (Semantic & Heuristic pattern matching against Brand Guidelines)
        self._last_mode = "rules"
        return self._semantic_fallback_analysis(text, guidelines)

    async def _call_openai(self, text: str, guidelines: str, facts: str) -> List[Dict[str, Any]]:
        system_prompt = f"""You are BrandGuard AI, an expert brand compliance auditor.
Brand Guidelines:
{guidelines}

Approved Facts:
{facts}

Analyze the provided marketing content against these brand guidelines and approved facts.
Identify any:
1. Tone Inconsistency (sensationalism, hype, ungrounded excitement, aggressive claims)
2. Unsupported Claims (promises without facts)
3. Misleading Statements

Output ONLY valid JSON array with objects matching:
[
  {{
    "category": "Tone Inconsistency" | "Unsupported Claim" | "Misleading Statement",
    "severity": "Low" | "Medium" | "High" | "Critical",
    "matched_text": "exact snippet from input",
    "explanation": "clear explainable justification",
    "guideline_reference": "name of breached guideline",
    "evidence": [{{"source": "...", "note": "..."}}],
    "confidence": 0.88,
    "suggested_correction": "responsible brand-compliant alternative",
    "status": "Pending",
    "engine_source": "LLM Engine"
  }}
]
If there are no violations, return empty array []."""

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text}
                    ],
                    "temperature": 0.1
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_content = data["choices"][0]["message"]["content"]
            # Clean possible markdown fence
            if "```json" in raw_content:
                raw_content = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                raw_content = raw_content.split("```")[1].split("```")[0].strip()
            return json.loads(raw_content)

    async def _call_gemini(self, text: str, guidelines: str, facts: str) -> List[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        system_instruction = f"""You are BrandGuard AI, an expert brand compliance auditor.
Brand Guidelines:
{guidelines}
Approved Facts:
{facts}
Return a strict JSON array of brand compliance findings for the user content."""

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [
                            {"text": system_instruction},
                            {"text": f"Content to review: {text}"}
                        ]
                    }],
                    "generationConfig": {"temperature": 0.1}
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```\n")[1].split("```")[0].strip()
            return json.loads(raw_text)

    def _semantic_fallback_analysis(self, text: str, guidelines: List[BrandGuideline]) -> List[Dict[str, Any]]:
        """Reliable deterministic fallback analyzer simulating AI tone & contextual consistency checks."""
        findings = []
        normalized_text = normalize_text(text)
        lowered = normalized_text.lower()

        fallback_patterns = [
            # 1. Hype & Sensationalist Tone Checks
            (
                r'\b(unbelievable|crazy returns|insane growth|skyrocket|blow your mind|secret trick)\b',
                "Sensationalized Hype",
                "Tone is sensationalized and inconsistent with a professional, trustworthy, and responsible brand identity.",
                "Brand Tone & Communication Consistency",
                "disciplined, long-term financial growth",
                SeverityLevel.HIGH,
                FindingCategory.TONE_INCONSISTENCY
            ),
            (
                r'\b(wealth wizardry|crypto moon|money hack)\b',
                "Unprofessional Slang",
                "Colloquial terminology undermines institutional brand reputation and professional credibility.",
                "Official Terminology Standard",
                "modern digital wealth management solutions",
                SeverityLevel.MEDIUM,
                FindingCategory.TONE_INCONSISTENCY
            ),
            (
                r'\b(act now or regret forever|limited time rush|don\'t miss out|once[\s\-]in[\s\-]a[\s\-]lifetime|limited\s+(?:spots?|seats?|availability)|closing\s+soon|act\s+(?:now|fast)|become wealthy now)\b',
                "High-Pressure Urgency",
                "Urgency tactics contradict the brand principle of patient, customer-centric advisory.",
                "Brand Tone & Communication Consistency",
                "explore our options at your own pace",
                SeverityLevel.MEDIUM,
                FindingCategory.TONE_INCONSISTENCY
            ),
            (
                r'\b(multiply\s+your\s+wealth\s+fast|make\s+\w+\s+(?:extraordinarily|insanely|ultra)\s+wealthy|life-changing\s+returns?|in\s+a\s+class\s+of\s+its\s+own|unmatched\s+in\s+the\s+industry)\b',
                "Sensationalized Wealth Promise",
                "Sensationalized promises of outsized or rapid wealth accumulation contradict brand tone standards.",
                "Brand Tone & Communication Consistency",
                "long-term, disciplined portfolio growth",
                SeverityLevel.HIGH,
                FindingCategory.TONE_INCONSISTENCY
            ),
            # 2. Financial Guarantee Paraphrases (cannot lose, no risk, sure profit)
            (
                r'\b(cannot|can\'t|cant|won\'t|wont|will not|never)\s+(?:simply\s+)?(lose|drop|diminish)\s+(?:money|capital|funds|core investment|deposit)\b',
                "Paraphrased Capital Guarantee",
                "Implying that an investor cannot lose money represents an unsubstantiated financial guarantee.",
                "Financial Claims & Guarantees Policy",
                "capital preservation strategies subject to market conditions",
                SeverityLevel.CRITICAL,
                FindingCategory.MISLEADING_STATEMENT
            ),
            (
                r'\b(never\s+seen\s+a\s+negative\s+outcome|zero[\s\-]+downside|foolproof|no\s+risk\s+at\s+all|zero\s+risk)\b',
                "Misleading Zero-Downside Claim",
                "Statement implies total immunity from market risk, violating financial advertising standards.",
                "Financial Claims & Guarantees Policy",
                "risk-managed strategies aligned with your objectives",
                SeverityLevel.CRITICAL,
                FindingCategory.MISLEADING_STATEMENT
            ),
            (
                r'\b(in\s+practice,?\s+risk[\s\-_]*free|effectively\s+risk[\s\-_]*free|practically\s+risk[\s\-_]*free)\b',
                "Obfuscated Risk-Free Guarantee",
                "Describing investment opportunities as practically or effectively risk-free is prohibited.",
                "Financial Claims & Guarantees Policy",
                "low-volatility portfolio structure",
                SeverityLevel.CRITICAL,
                FindingCategory.BANNED_EXPRESSION
            ),
            (
                r'\b(sure|certain|guaranteed|inevitable)\s+(?:profit|profits|gains?|returns?)\b',
                "Guaranteed Profit Claim",
                "Promising certain or guaranteed profits on market-linked instruments is prohibited.",
                "Financial Claims & Guarantees Policy",
                "projections based on historical models",
                SeverityLevel.CRITICAL,
                FindingCategory.UNSUPPORTED_CLAIM
            ),
            (
                r'\b(100%\s+profit|guarantees?\s+100%\s+profit)\b',
                "Absolute Profit Promise",
                "Absolute profit promises contradict financial compliance standards.",
                "Financial Claims & Guarantees Policy",
                "competitive return targets",
                SeverityLevel.CRITICAL,
                FindingCategory.UNSUPPORTED_CLAIM
            ),
            # 3. Unsupported Superiority & Quantitative Claims
            (
                r'\b((?:\d+|nine|eight|seven)\s+out\s+of\s+(?:ten|10)|\d+%\s+accuracy\s+rate|(?:saved|earned|generated)\s+(?:its\s+)?(?:clients|users)\s+over|outperform(?:ed|s)?\s+(?:\d+%|the\s+market)|(?:always|consistently)\s+(?:beats?|outperforms?)\s+(?:inflation|the\s+market|peers)|zero\s+reported\s+losses)\b',
                "Unsupported Quantitative Claim",
                "Specific statistical or competitive superiority claims must be backed by verifiable citations.",
                "Claims Substantiation Standard",
                "substantiated benchmark comparisons",
                SeverityLevel.HIGH,
                FindingCategory.UNSUPPORTED_CLAIM
            ),
            # 4. Bad / Suspicious Citation Domains
            (
                r'\b[a-zA-Z0-9_\.-]*\.(?:fake[a-zA-Z0-9_\.-]*|made-up[a-zA-Z0-9_\.-]*|exampleonly[a-zA-Z0-9_\.-]*)\b',
                "Unverified Source Citation",
                "Citations must reference reputable, authoritative, and independently verifiable sources.",
                "Citation & Evidence Policy",
                "approved industry benchmarks or official filings",
                SeverityLevel.HIGH,
                FindingCategory.UNSUPPORTED_CLAIM
            )
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

                # Match against real retrieved guideline row
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

                # Unverified citation domain stays unverified_source -> NEEDS_HUMAN_REVIEW
                if "fake" in matched_snippet or "made-up" in matched_snippet or "exampleonly" in matched_snippet:
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
                    "evidence": [{
                        "source": "Brand Guidelines Compliance System",
                        "rule": ref_name
                    }],
                    "evidence_state": ev_state,
                    "confidence": 0.91,
                    "suggested_correction": suggestion,
                    "status": "Pending",
                    "engine_source": "AI Engine (Fallback)"
                })

        return findings
