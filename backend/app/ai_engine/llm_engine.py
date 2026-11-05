import json
import re
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.guideline import BrandGuideline, ApprovedFact
from app.models.enums import FindingCategory, SeverityLevel

class LLMEngine:
    def __init__(self, db: Session):
        self.db = db

    async def analyze(self, text: str) -> List[Dict[str, Any]]:
        # Retrieve Brand Guidelines and Approved Facts from DB for grounding
        guidelines = self.db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
        facts = self.db.query(ApprovedFact).filter(ApprovedFact.is_active == True).all()

        guidelines_summary = "\n".join([f"- [{g.category}] {g.title}: {g.description}" for g in guidelines])
        facts_summary = "\n".join([f"- [{f.category}] {f.statement}" for f in facts])

        # Attempt external LLM if key is present
        if settings.OPENAI_API_KEY and settings.AI_PROVIDER == "openai":
            try:
                return await self._call_openai(text, guidelines_summary, facts_summary)
            except Exception as e:
                print(f"[LLM Engine] OpenAI call failed: {e}. Falling back to rule-based fallback.")
        elif settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                return await self._call_gemini(text, guidelines_summary, facts_summary)
            except Exception as e:
                print(f"[LLM Engine] Gemini call failed: {e}. Falling back to rule-based fallback.")

        # Robust Fallback Engine (Semantic & Heuristic pattern matching against FinNova Brand Guidelines)
        return self._semantic_fallback_analysis(text, guidelines)

    async def _call_openai(self, text: str, guidelines: str, facts: str) -> List[Dict[str, Any]]:
        system_prompt = f"""You are BrandGuard AI, an expert brand compliance auditor for FinNova Financial Technologies.
FinNova Brand Guidelines:
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
        system_instruction = f"""You are BrandGuard AI, brand compliance auditor for FinNova Financial Technologies.
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
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
            return json.loads(raw_text)

    def _semantic_fallback_analysis(self, text: str, guidelines: List[BrandGuideline]) -> List[Dict[str, Any]]:
        """Reliable deterministic fallback analyzer simulating AI tone & contextual consistency checks."""
        findings = []
        lowered = text.lower()

        # 1. Hype & Sensationalist Tone Checks
        hype_patterns = [
            (r'\b(unbelievable|crazy returns|insane growth|skyrocket|blow your mind|secret trick)\b', 
             "Sensationalized Hype",
             "Tone is sensationalized and inconsistent with FinNova's professional, trustworthy, and responsible identity.",
             "Brand Tone & Communication Consistency",
             "disciplined, long-term financial growth",
             SeverityLevel.HIGH,
             FindingCategory.TONE_INCONSISTENCY),
            (r'\b(never lose money|zero downside|foolproof)\b',
             "Misleading Guarantee",
             "Statement implies investment immunity from market forces, violating financial compliance standards.",
             "Financial Claims & Guarantees Policy",
             "risk-managed strategies aligned with your portfolio objectives",
             SeverityLevel.CRITICAL,
             FindingCategory.MISLEADING_STATEMENT),
            (r'\b(wealth wizardry|crypto moon|money hack)\b',
             "Unprofessional Slang",
             "Colloquial terminology undermines FinNova's institutional reputation as a licensed financial entity.",
             "Official Terminology Standard",
             "modern digital wealth management solutions",
             SeverityLevel.MEDIUM,
             FindingCategory.TONE_INCONSISTENCY),
            (r'\b(act now or regret forever|limited time rush|don\'t miss out)\b',
             "High-Pressure Urgency",
             "Urgency tactics contradict FinNova's principle of patient, customer-centric advisory.",
             "Brand Tone & Communication Consistency",
             "explore our options at your own pace",
             SeverityLevel.MEDIUM,
             FindingCategory.TONE_INCONSISTENCY)
        ]

        for pattern, label, explanation, guideline_ref, suggestion, severity, cat in hype_patterns:
            matches = list(re.finditer(pattern, lowered))
            for match in matches:
                start, end = match.span()
                matched_snippet = text[start:end]
                findings.append({
                    "category": cat,
                    "severity": severity,
                    "matched_text": matched_snippet,
                    "explanation": explanation,
                    "guideline_reference": guideline_ref,
                    "evidence": [{
                        "source": "FinNova Brand Tone Manual",
                        "rule": "Avoid aggressive marketing hype and misleading claims."
                    }],
                    "confidence": 0.91,
                    "suggested_correction": suggestion,
                    "status": "Pending",
                    "engine_source": "AI Engine (Fallback)"
                })

        return findings
