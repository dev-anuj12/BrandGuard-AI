from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.llm_engine import LLMEngine
from app.ai_engine.citation_validator import CitationValidator
from app.ai_engine.confidence_scorer import ConfidenceScorer
from app.ai_engine.grounding import validate_finding
from app.models.guideline import BrandGuideline, ApprovedFact, ApprovedSource

class AIReviewPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.rule_engine = RuleEngine(db)
        self.llm_engine = LLMEngine(db)
        self.citation_validator = CitationValidator(db)

    async def execute_review(self, text: str) -> Dict[str, Any]:
        # 0. Retrieve active knowledge set for this review context
        guidelines = self.db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
        facts = self.db.query(ApprovedFact).filter(ApprovedFact.is_active == True).all()
        sources = self.db.query(ApprovedSource).all()
        retrieved_knowledge = {
            "guideline_ids": {g.id for g in guidelines},
            "fact_ids": {f.id for f in facts},
            "source_ids": {s.id for s in sources},
            "guidelines": guidelines,
            "facts": facts,
            "sources": sources
        }

        # 1. Run Rule Engine
        rule_findings = self.rule_engine.analyze(text)

        # 2. Run Citation Validator
        citation_findings, citation_metrics = self.citation_validator.validate_citations(text)

        # 3. Run LLM Engine (or its fallback)
        llm_findings = await self.llm_engine.analyze(text)

        # 4. Merge and deduplicate findings (prefer rule engine for identical matched text)
        merged_findings = []
        seen_snippets = set()

        for f in rule_findings:
            key = (f["matched_text"].lower(), f["category"])
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        for f in citation_findings:
            key = (f["matched_text"].lower(), f["category"])
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        for f in llm_findings:
            key = (f.get("matched_text", "").lower(), f.get("category", ""))
            if key not in seen_snippets:
                seen_snippets.add(key)
                f["confidence"] = ConfidenceScorer.calculate_finding_confidence(f)
                merged_findings.append(f)

        # 5. Validate Grounding & Attach Confidence Components
        for f in merged_findings:
            validate_finding(f, text, retrieved_knowledge)
            f["confidence_components"] = ConfidenceScorer.calculate_confidence_components(f)

        # 6. Compute overall compliance score on GROUNDED findings only
        score = ConfidenceScorer.calculate_compliance_score(merged_findings)

        # 7. Generate summary
        grounded_findings = [f for f in merged_findings if f.get("grounding_status") == "GROUNDED"]
        needs_review_findings = [f for f in merged_findings if f.get("grounding_status") == "NEEDS_HUMAN_REVIEW"]

        critical_count = sum(1 for f in grounded_findings if f.get("severity") == "Critical")
        high_count = sum(1 for f in grounded_findings if f.get("severity") == "High")
        total_violations = len(grounded_findings)
        unsupported_count = len(needs_review_findings)

        if total_violations == 0 and unsupported_count == 0:
            summary = "Brand compliance review passed with 100% adherence to Brand Guidelines."
        elif total_violations == 0:
            summary = (
                f"No confirmed violations. {unsupported_count} item(s) flagged for human verification."
            )
        else:
            summary = (
                f"Review identified {total_violations} confirmed issue(s) ({critical_count} critical, {high_count} high severity). "
                f"{f'({unsupported_count} ungrounded item(s) pending human review). ' if unsupported_count else ''}"
                f"Action required before regulatory approval."
            )

        return {
            "overall_score": score,
            "overall_status": "Completed" if score >= 80 else "Changes Required",
            "summary": summary,
            "provider": "Rule Engine + LLM Engine + Citation Validator",
            "findings": merged_findings,
            "grounded_findings": grounded_findings,
            "needs_human_review_findings": needs_review_findings,
            "citation_metrics": citation_metrics
        }
