from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.llm_engine import LLMEngine
from app.ai_engine.citation_validator import CitationValidator
from app.ai_engine.confidence_scorer import ConfidenceScorer

class AIReviewPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.rule_engine = RuleEngine(db)
        self.llm_engine = LLMEngine(db)
        self.citation_validator = CitationValidator(db)

    async def execute_review(self, text: str) -> Dict[str, Any]:
        # 1. Run Rule Engine
        rule_findings = self.rule_engine.analyze(text)

        # 2. Run Citation Validator
        citation_findings, citation_metrics = self.citation_validator.validate_citations(text)

        # 3. Run LLM Engine (or its fallback)
        llm_findings = await self.llm_engine.analyze(text)

        # 4. Merge and deduplicate findings (prefer rule engine for identical matched text)
        merged_findings = []
        seen_snippets = set()

        # Add rule findings first (deterministic high precision)
        for f in rule_findings:
            key = (f["matched_text"].lower(), f["category"])
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        # Add citation findings
        for f in citation_findings:
            key = (f["matched_text"].lower(), f["category"])
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        # Add LLM findings
        for f in llm_findings:
            key = (f.get("matched_text", "").lower(), f.get("category", ""))
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        # 5. Compute overall compliance score
        score = ConfidenceScorer.calculate_compliance_score(merged_findings)

        # 6. Generate summary
        critical_count = sum(1 for f in merged_findings if f["severity"] == "Critical")
        high_count = sum(1 for f in merged_findings if f["severity"] == "High")
        total_violations = len(merged_findings)

        if total_violations == 0:
            summary = "Brand compliance review passed with 100% adherence to FinNova Brand Guidelines."
        else:
            summary = (
                f"Review identified {total_violations} issue(s) ({critical_count} critical, {high_count} high severity). "
                f"Action required before regulatory approval."
            )

        return {
            "overall_score": score,
            "overall_status": "Completed" if score >= 80 else "Changes Required",
            "summary": summary,
            "provider": "Rule Engine + LLM Engine + Citation Validator",
            "findings": merged_findings,
            "citation_metrics": citation_metrics
        }
