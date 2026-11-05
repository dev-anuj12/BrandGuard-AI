import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.guideline import ApprovedSource, ApprovedFact
from app.models.enums import FindingCategory, SeverityLevel

class CitationValidator:
    def __init__(self, db: Session):
        self.db = db

    def validate_citations(self, text: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        findings = []
        
        # 1. Extract URLs or citation mentions from text
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        detected_urls = re.findall(url_pattern, text)
        
        # Fetch approved sources from database
        approved_sources = self.db.query(ApprovedSource).all()
        approved_urls = [s.url.lower().rstrip('/') for s in approved_sources]
        approved_domains = [s.url.split('/')[2].lower() if '://' in s.url else s.url.lower() for s in approved_sources]

        # 2. Check each detected URL
        verified_sources_count = 0
        unverified_sources_count = 0

        for url in detected_urls:
            clean_url = url.lower().rstrip('/')
            domain_match = any(domain in clean_url for domain in approved_domains)
            exact_match = any(clean_url == a_url or clean_url.startswith(a_url) for a_url in approved_urls)

            if exact_match or domain_match:
                verified_sources_count += 1
            else:
                unverified_sources_count += 1
                findings.append({
                    "category": FindingCategory.UNVERIFIED_SOURCE,
                    "severity": SeverityLevel.HIGH,
                    "matched_text": url,
                    "explanation": f"The cited source '{url}' is not in FinNova's pre-approved regulatory source registry.",
                    "guideline_reference": "Evidence & Citation Validation Requirement",
                    "evidence": [{
                        "source": "FinNova Approved Source Registry",
                        "status": "Unverified External Source",
                        "detected_url": url
                    }],
                    "confidence": 0.95,
                    "suggested_correction": "Replace with official citations from FinNova's Product Factsheet or Investor Relations portal.",
                    "status": "Pending",
                    "engine_source": "Citation Validator"
                })

        # 3. Check for factual claims without citations (numerical/percentage claims)
        # e.g., "50% increase", "10x return", "#1 rated", "fastest growing"
        superlative_patterns = [
            (r'\b(#1|number one|top rated|best in class|fastest growing|market leader)\b', "Superlative Claim"),
            (r'\b(\d+(\.\d+)?%\s*(gain|profit|growth|return|increase))\b', "Quantifiable Metric Claim")
        ]

        for pat, label in superlative_patterns:
            matches = list(re.finditer(pat, text, re.IGNORECASE))
            for match in matches:
                matched_snippet = match.group(0)
                # Check if an approved fact explicitly backs this statement
                facts = self.db.query(ApprovedFact).filter(ApprovedFact.is_active == True).all()
                supported = any(matched_snippet.lower() in f.statement.lower() for f in facts)

                if not supported:
                    findings.append({
                        "category": FindingCategory.UNSUPPORTED_CLAIM,
                        "severity": SeverityLevel.HIGH,
                        "matched_text": matched_snippet,
                        "explanation": f"The statement '{matched_snippet}' makes a {label.lower()} with no approved source evidence or regulatory verification.",
                        "guideline_reference": "Evidence & Citation Validation Requirement",
                        "evidence": [{
                            "status": "Missing Supporting Evidence",
                            "note": "Not found in FinNova Approved Facts or Annual Reports"
                        }],
                        "confidence": 0.88,
                        "suggested_correction": "Support this claim with approved facts or rephrase with substantiated qualitative language.",
                        "status": "Pending",
                        "engine_source": "Citation Validator"
                    })

        citation_metrics = {
            "detected_urls_count": len(detected_urls),
            "verified_sources_count": verified_sources_count,
            "unverified_sources_count": unverified_sources_count,
            "has_citations": len(detected_urls) > 0
        }

        return findings, citation_metrics

