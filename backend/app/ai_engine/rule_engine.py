import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.guideline import BannedWord, ApprovedTerminology, BrandGuideline
from app.models.enums import FindingCategory, SeverityLevel
from app.ai_engine.normalizer import (
    normalize_text,
    is_false_positive_context,
    has_required_disclaimer
)

class RuleEngine:
    def __init__(self, db: Session):
        self.db = db

    def analyze(self, text: str) -> List[Dict[str, Any]]:
        findings = []
        normalized_text = normalize_text(text)
        lowered_text = normalized_text.lower()

        # 1. Detect Banned Words and Phrases
        banned_words = self.db.query(BannedWord).filter(BannedWord.is_active == True).all()
        for bw in banned_words:
            words = re.split(r'[\s\-]+', bw.word_or_phrase.lower().strip())
            pattern = r'\b' + r'[\s\-]+'.join(re.escape(w) for w in words) + r'\b'
            matches = list(re.finditer(pattern, lowered_text))
            for match in matches:
                start, end = match.span()
                if is_false_positive_context(lowered_text, start, end):
                    continue
                matched_snippet = text[start:end] if end <= len(text) else normalized_text[start:end]
                findings.append({
                    "category": FindingCategory.BANNED_EXPRESSION,
                    "severity": bw.severity,
                    "matched_text": matched_snippet,
                    "explanation": bw.explanation,
                    "guideline_reference": f"Banned Expression: {bw.word_or_phrase}",
                    "evidence": [{
                        "source": "Brand Compliance Database",
                        "rule": "Banned Expression Registry",
                        "term": bw.word_or_phrase
                    }],
                    "confidence": 0.99,
                    "suggested_correction": bw.suggested_replacement or "appropriate financial phrasing",
                    "status": "Pending",
                    "engine_source": "Rule Engine"
                })

        # 2. Detect Incorrect Terminology
        terminologies = self.db.query(ApprovedTerminology).all()
        for term in terminologies:
            words = re.split(r'[\s\-]+', term.incorrect_term.lower().strip())
            pattern = r'\b' + r'[\s\-]+'.join(re.escape(w) for w in words) + r'\b'
            matches = list(re.finditer(pattern, lowered_text))
            for match in matches:
                start, end = match.span()
                if is_false_positive_context(lowered_text, start, end):
                    continue
                matched_snippet = text[start:end] if end <= len(text) else normalized_text[start:end]
                findings.append({
                    "category": FindingCategory.INCORRECT_TERMINOLOGY,
                    "severity": SeverityLevel.MEDIUM,
                    "matched_text": matched_snippet,
                    "explanation": f"'{matched_snippet}' violates brand terminology guidelines. Official approved term is '{term.approved_term}'.",
                    "guideline_reference": "Official Terminology Standard",
                    "evidence": [{
                        "source": "Brand Style & Terminology Glossary",
                        "context": term.context or "Official terminology requirement"
                    }],
                    "confidence": 0.96,
                    "suggested_correction": term.approved_term,
                    "status": "Pending",
                    "engine_source": "Rule Engine"
                })

        # 3. Detect Missing Mandatory Disclaimers for Financial Projections & Investment Products
        financial_indicators = [
            r'\breturn[s]?\b',
            r'\bprofit[s]?\b',
            r'\byield[s]?\b',
            r'\bwealth\s+accumulation\b',
            r'\bcapital\s+accumulation\b',
            r'\binvest\s+in\b',
            r'\binvesting\b',
            r'\binvestment\s+(opportunity|product|vehicle|scheme|fund|plan)\b',
            r'\b(growth|equity|bond|mutual)\s+fund\b',
            r'\bmodel\s+portfolio\b',
            r'\bportfolio\s+growth\b'
        ]
        has_financial_mention = any(re.search(pat, lowered_text) for pat in financial_indicators)
        has_disclaimer = has_required_disclaimer(lowered_text)

        if has_financial_mention and not has_disclaimer:
            findings.append({
                "category": FindingCategory.MISSING_DISCLAIMER,
                "severity": SeverityLevel.HIGH,
                "matched_text": "Missing Regulatory Disclosure",
                "explanation": "Content discusses financial growth or investments but omits mandatory regulatory risk disclaimers.",
                "guideline_reference": "Financial Claims & Guarantees Policy",
                "evidence": [{
                    "source": "Regulatory Advertising Framework",
                    "requirement": "Financial promotional material must include risk disclosure"
                }],
                "confidence": 0.94,
                "suggested_correction": "Investment products are subject to market risks. Please read all scheme-related documents carefully before investing.",
                "status": "Pending",
                "engine_source": "Rule Engine"
            })

        return findings

