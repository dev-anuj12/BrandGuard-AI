from typing import List, Dict, Any
from app.models.enums import SeverityLevel

class ConfidenceScorer:
    @staticmethod
    def calculate_finding_confidence(finding: Dict[str, Any]) -> float:
        engine = finding.get("engine_source", "")
        evidence = finding.get("evidence", [])
        severity = finding.get("severity")

        # Base confidence by engine type
        if engine == "Rule Engine":
            base = 0.95
        elif engine == "Citation Validator":
            base = 0.90
        else: # LLM Engine
            base = 0.85

        # Evidence bonus
        if evidence and len(evidence) > 0:
            base += 0.04

        # Severity calibration
        if severity == SeverityLevel.CRITICAL:
            base += 0.01

        return min(0.99, round(base, 2))

    @staticmethod
    def get_confidence_tier(confidence: float) -> str:
        if confidence >= 0.90:
            return "High Confidence"
        elif confidence >= 0.75:
            return "Medium Confidence"
        else:
            return "Low Confidence"

    @staticmethod
    def calculate_compliance_score(findings: List[Dict[str, Any]]) -> float:
        if not findings:
            return 100.0

        deductions = 0.0
        for f in findings:
            sev = f.get("severity")
            if sev == SeverityLevel.CRITICAL:
                deductions += 25.0
            elif sev == SeverityLevel.HIGH:
                deductions += 15.0
            elif sev == SeverityLevel.MEDIUM:
                deductions += 8.0
            else:
                deductions += 4.0

        score = max(0.0, 100.0 - deductions)
        return round(score, 1)
