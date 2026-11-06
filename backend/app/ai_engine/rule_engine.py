import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.guideline import BannedWord, ApprovedTerminology, BrandGuideline
from app.models.enums import FindingCategory, SeverityLevel

class RuleEngine:
    def __init__(self, db: Session):
        self.db = db

    def analyze(self, text: str) -> List[Dict[str, Any]]:
        findings = []
        lowered_text = text.lower()

        # 1. Detect Banned Words and Phrases
        banned_words = self.db.query(BannedWord).filter(BannedWord.is_active == True).all()
        for bw in banned_words:
            pattern = r'\b' + re.escape(bw.word_or_phrase.lower()) + r'\b'
            matches = list(re.finditer(pattern, lowered_text))
            for match in matches:
                # Capture exact original casing from input
                start, end = match.span()
                matched_snippet = text[start:end]
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
            pattern = r'\b' + re.escape(term.incorrect_term.lower()) + r'\b'
            matches = list(re.finditer(pattern, lowered_text))
            for match in matches:
                start, end = match.span()
                matched_snippet = text[start:end]
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

        # 3. Detect Missing Mandatory Disclaimers for Financial Projections
        financial_indicators = ["return", "returns", "profit", "growth", "invest", "wealth", "yield", "portfolio"]
        has_financial_mention = any(re.search(r'\b' + word + r'\b', lowered_text) for word in financial_indicators)
        disclaimer_phrases = ["subject to market risks", "terms and conditions apply", "past performance is no guarantee", "risk disclosure"]
        has_disclaimer = any(phrase in lowered_text for phrase in disclaimer_phrases)

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

