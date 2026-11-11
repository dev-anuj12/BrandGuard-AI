import re
from typing import Dict, Any, Tuple, List, Optional
from app.ai_engine.normalizer import normalize_text

VALID_EVIDENCE_STATES = {
    "verified",
    "unverified_source",
    "source_unavailable",
    "unsupported_claim",
    "missing_citation"
}

def validate_finding(
    finding: Dict[str, Any],
    content_text: str,
    retrieved_knowledge: Optional[Dict[str, Any]] = None
) -> Tuple[str, List[str]]:
    """Validates an AI or rule compliance finding against the content text

    and the specific knowledge items retrieved for this review.

    Returns:
        (status, reasons) where status is either 'GROUNDED' or 'NEEDS_HUMAN_REVIEW'
    """
    reasons: List[str] = []
    retrieved = retrieved_knowledge or {}
    retrieved_guideline_ids = set(retrieved.get("guideline_ids", set()))
    retrieved_fact_ids = set(retrieved.get("fact_ids", set()))
    retrieved_source_ids = set(retrieved.get("source_ids", set()))

    engine_source = finding.get("engine_source", "")
    matched_text = finding.get("matched_text", "")
    evidence = finding.get("evidence", [])
    evidence_state = finding.get("evidence_state", "verified")

    # 1. Text Grounding: matched_text must exist in content_text (unless regulatory missing placeholder)
    is_missing_disclaimer_placeholder = (
        finding.get("category") == "Missing Disclaimer"
        or "missing regulatory" in matched_text.lower()
    )

    if not is_missing_disclaimer_placeholder and matched_text:
        norm_matched = re.sub(r'\s+', ' ', normalize_text(matched_text).lower()).strip()
        norm_content = re.sub(r'\s+', ' ', normalize_text(content_text).lower()).strip()

        if norm_matched not in norm_content:
            reasons.append(f"Matched text '{matched_text}' is not a substring of the campaign content.")

    # 2. Knowledge Grounding (retrieved guideline / fact / source references)
    guideline_id = finding.get("guideline_id")
    fact_id = finding.get("fact_id")
    source_id = finding.get("source_id")

    has_explicit_id = False
    if guideline_id is not None:
        has_explicit_id = True
        if guideline_id not in retrieved_guideline_ids:
            reasons.append(f"Referenced guideline ID {guideline_id} was not in the retrieved knowledge set for this review.")

    if fact_id is not None:
        has_explicit_id = True
        if fact_id not in retrieved_fact_ids:
            reasons.append(f"Referenced fact ID {fact_id} was not in the retrieved knowledge set for this review.")

    if source_id is not None:
        has_explicit_id = True
        if source_id not in retrieved_source_ids:
            reasons.append(f"Referenced source ID {source_id} was not in the retrieved knowledge set for this review.")

    # Rule-engine findings are grounded by design if text matches
    if engine_source == "Rule Engine":
        if not evidence_state or evidence_state not in VALID_EVIDENCE_STATES:
            evidence_state = "verified"
    else:
        # Non-rule engine findings (Semantic Fallback, LLM Engine, Citation Validator)
        # Check evidence grounding
        evidence_texts = []
        is_url_only = False
        if evidence:
            for ev in evidence:
                if isinstance(ev, str):
                    evidence_texts.append(ev)
                    if re.match(r'^https?://[^\s]+$', ev.strip()):
                        is_url_only = True
                elif isinstance(ev, dict):
                    src = ev.get("source", "")
                    url = ev.get("url", "")
                    if url and not src:
                        is_url_only = True
                    evidence_texts.append(str(ev))

        # A URL alone is never "verified"
        if is_url_only or evidence_state == "unverified_source":
            evidence_state = "unverified_source"
            reasons.append("Citations containing only a URL without an approved institutional authority cannot be verified.")
        elif finding.get("category") == "Unsupported Claim":
            evidence_state = "unsupported_claim"
        elif not evidence and not has_explicit_id and not finding.get("guideline_reference"):
            evidence_state = "missing_citation"
            reasons.append("No supporting guideline reference or verified evidence provided.")

    if evidence_state not in VALID_EVIDENCE_STATES:
        evidence_state = "source_unavailable"
        reasons.append(f"Invalid or unavailable evidence state '{evidence_state}'.")

    if evidence_state in {"unverified_source", "source_unavailable", "unsupported_claim", "missing_citation"}:
        if not any(evidence_state in r for r in reasons):
            reasons.append(f"Evidence state is flagged as '{evidence_state}'.")

    finding["evidence_state"] = evidence_state

    # Status Determination: GROUNDED or NEEDS_HUMAN_REVIEW
    if reasons:
        status = "NEEDS_HUMAN_REVIEW"
    else:
        status = "GROUNDED"

    finding["grounding_status"] = status
    finding["grounding_reasons"] = "; ".join(reasons)

    return status, reasons
