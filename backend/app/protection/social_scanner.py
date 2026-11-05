import re
import json
import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from app.models.threat import ThreatItem, ThreatEvidence
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus
from app.protection.domain_analyzer import compute_levenshtein, normalize_homoglyphs

SUPPORTED_PLATFORMS = {
    "twitter": "X (Twitter)",
    "x": "X (Twitter)",
    "instagram": "Instagram",
    "linkedin": "LinkedIn",
    "facebook": "Facebook",
    "telegram": "Telegram",
    "youtube": "YouTube",
    "tiktok": "TikTok"
}

OFFICIAL_VERIFIED_HANDLES = {
    "twitter": ["finnovahq", "finnovatech", "finnovaofficial"],
    "x": ["finnovahq", "finnovatech", "finnovaofficial"],
    "instagram": ["finnova.official", "finnova_hq"],
    "linkedin": ["finnova-financial-technologies", "finnova"],
    "telegram": ["finnova_announcements"],
    "youtube": ["finnovatech"]
}

SCAM_INTENT_PATTERNS = [
    (r"(dm|message|contact)\s+(for|to)\s+(support|help|assistance|wallet|recovery)", "Soliciting Unsolicited Support DMs", 30.0),
    (r"(airdrop|giveaway|claim|bonus|free\s+token|gift)", "Cryptocurrency / Financial Airdrop Scam Lure", 35.0),
    (r"(send|deposit|transfer)\s+(\$?\d+|eth|btc|usdt|crypto)", "Demanding Direct Fund or Crypto Deposit", 40.0),
    (r"(connect|link)\s+(your\s+)?(wallet|seed\s+phrase|private\s+key)", "Credential / Wallet Seed Phishing", 45.0),
    (r"(official|verified|authorized|legit|real)\s+(support|helpdesk|desk|care|agent)", "Impersonating Official Customer Care Representative", 25.0),
    (r"(whatsapp|telegram)\s+(at|on|link|:|\+)", "Redirecting Victims to Unmonitored Messaging Channels", 25.0),
    (r"(guaranteed|100%|risk-free)\s+(return|profit|yield|roi)", "Unsupported Investment / Yield Guarantee", 30.0)
]

SUSPICIOUS_HANDLE_MODIFIERS = [
    "support", "help", "helpdesk", "care", "official", "real", "legit",
    "service", "assist", "customercare", "bot", "claims", "recovery", "verify"
]


class SocialMediaScanner:
    """
    Intelligent Social Media Impersonation Analysis Engine.
    Detects unauthorized brand accounts, fake customer care bots,
    unverified lookalike handles, and financial scam bio language.
    """

    def __init__(self, brand_name: str = "FinNova", official_canonical: str = "finnovahq"):
        self.brand_name = brand_name.lower()
        self.official_canonical = official_canonical.lower()

    def analyze_profile(
        self,
        platform: str,
        handle: str,
        display_name: Optional[str] = None,
        bio_text: Optional[str] = None,
        followers_count: Optional[int] = None,
        following_count: Optional[int] = None,
        is_verified: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates social media profile metadata and content for impersonation indicators.
        """
        norm_platform = platform.lower().strip()
        platform_label = SUPPORTED_PLATFORMS.get(norm_platform, platform)
        
        # Clean handle
        clean_handle = handle.strip().lstrip("@")
        clean_display = (display_name or clean_handle).strip()
        bio = (bio_text or "").strip()

        findings = []
        base_risk_score = 0.0

        # Step 1: Whitelist check (Official recognized brand handles)
        known_official = OFFICIAL_VERIFIED_HANDLES.get(norm_platform, [])
        if clean_handle.lower() in known_official and is_verified:
            return {
                "platform": platform_label,
                "handle": f"@{clean_handle}",
                "display_name": clean_display,
                "is_verified": True,
                "profile_url": f"https://{norm_platform}.com/{clean_handle}",
                "similarity_score": 100.0,
                "risk_score": 0.0,
                "risk_level": ThreatRiskLevel.INFO,
                "scam_intent_detected": False,
                "findings": [{
                    "rule_id": "SOC-OFFICIAL-001",
                    "severity": "INFO",
                    "title": "Verified Official Corporate Account",
                    "description": f"Handle @{clean_handle} matches verified corporate social asset registry.",
                    "evidence": f"Platform: {platform_label}, Handle: @{clean_handle}, Verified: True",
                    "recommendation": "Whitelisted corporate asset. No enforcement needed."
                }],
                "recommended_action": "Authorized official corporate channel."
            }

        # Step 2: Handle & Display Name Brand Similarity
        normalized_handle, homoglyphs = normalize_homoglyphs(clean_handle.lower())
        contains_brand_in_handle = self.brand_name in normalized_handle
        contains_brand_in_display = self.brand_name in clean_display.lower()

        # Compute Levenshtein similarity to canonical handle
        dist = compute_levenshtein(normalized_handle, self.official_canonical)
        max_len = max(len(normalized_handle), len(self.official_canonical), 1)
        handle_similarity = max(0.0, round((1.0 - (dist / max_len)) * 100.0, 1))

        if homoglyphs:
            base_risk_score += 40.0
            findings.append({
                "rule_id": "SOC-HOMOGLYPH-002",
                "severity": "CRITICAL",
                "title": "Homoglyph Impersonation in Social Handle",
                "description": "Profile username substitutes confusable Cyrillic/Greek characters mimicking official brand handle.",
                "evidence": f"Characters: {', '.join(homoglyphs)} in @{clean_handle}",
                "recommendation": "File urgent impersonation report with platform trust & safety team."
            })

        if contains_brand_in_handle or contains_brand_in_display:
            base_risk_score += 30.0
            findings.append({
                "rule_id": "SOC-BRAND-NAME-003",
                "severity": "HIGH",
                "title": "Unauthorized Corporate Brand Usage in Profile",
                "description": f"Profile leverages proprietary brand name '{self.brand_name.capitalize()}' without platform verification or company affiliation.",
                "evidence": f"Handle: @{clean_handle}, Display Name: '{clean_display}'",
                "recommendation": "Initiate trademark infringement and false impersonation takedown notice."
            })

        # Step 3: Handle Modifier & Fake Customer Support Pattern
        found_modifiers = [mod for mod in SUSPICIOUS_HANDLE_MODIFIERS if mod in normalized_handle]
        if found_modifiers and contains_brand_in_handle:
            base_risk_score += 25.0
            findings.append({
                "rule_id": "SOC-FAKE-SUPPORT-004",
                "severity": "CRITICAL",
                "title": "Deceptive Customer Care / Helpdesk Pretender",
                "description": f"Handle embeds official service qualifiers ({', '.join(found_modifiers)}) targeting customers seeking assistance.",
                "evidence": f"Qualifiers detected: {', '.join(found_modifiers)} in @{clean_handle}",
                "recommendation": "Issue immediate account freeze and abuse takedown request."
            })

        # Step 4: Verification Disparity (Unverified profile claiming authority)
        if (contains_brand_in_handle or contains_brand_in_display) and not is_verified:
            base_risk_score += 15.0
            findings.append({
                "rule_id": "SOC-UNVERIFIED-STATUS-005",
                "severity": "MEDIUM",
                "title": "Unverified High-Authority Impersonation",
                "description": "Account operates without official verification badge while representing financial services brand.",
                "evidence": f"Verified Status: False",
                "recommendation": "Advise customers through official channels that this handle is unauthorized."
            })

        # Step 5: Bio Content & Scam Pattern Analysis
        scam_intent_detected = False
        if bio:
            for pattern, title, weight in SCAM_INTENT_PATTERNS:
                if re.search(pattern, bio, re.IGNORECASE):
                    scam_intent_detected = True
                    base_risk_score += weight
                    findings.append({
                        "rule_id": "SOC-SCAM-BIO-006",
                        "severity": "CRITICAL",
                        "title": title,
                        "description": "Profile biography contains high-risk scam phraseology aimed at extracting funds or credentials.",
                        "evidence": f"Matched Bio Pattern: '{pattern}' in: \"{bio[:80]}...\"",
                        "recommendation": "Escalate to platform security abuse desk as malicious financial phishing operation."
                    })

        # Step 6: Follower-to-Following Anomaly Check
        if followers_count is not None and following_count is not None:
            if followers_count < 50 and following_count > 500 and contains_brand_in_handle:
                base_risk_score += 15.0
                findings.append({
                    "rule_id": "SOC-BOT-RATIO-007",
                    "severity": "LOW",
                    "title": "Artificial / Newly Created Account Profile",
                    "description": "Asymmetric follower-to-following ratio indicates a burner account or newly registered impersonation bot.",
                    "evidence": f"Followers: {followers_count}, Following: {following_count}",
                    "recommendation": "Monitor account activity and correlate with active phishing campaigns."
                })

        # Step 7: Final Risk Scoring
        risk_score = min(100.0, max(0.0, round(base_risk_score, 1)))

        if risk_score >= 80.0:
            risk_level = ThreatRiskLevel.CRITICAL
            recommended_action = f"EMERGENCY ENFORCEMENT: Submit impersonation takedown report directly to {platform_label} Trust & Safety. Issue public customer warning."
        elif risk_score >= 60.0:
            risk_level = ThreatRiskLevel.HIGH
            recommended_action = f"ACTIVE INFRINGEMENT: File trademark infringement report with {platform_label}. Add to BrandGuard active threat registry."
        elif risk_score >= 40.0:
            risk_level = ThreatRiskLevel.MEDIUM
            recommended_action = "ELEVATED CONCERN: Monitor bio changes and follower interactions for scam pivot."
        elif risk_score >= 20.0:
            risk_level = ThreatRiskLevel.LOW
            recommended_action = "LOW RISK: Retain record in historical audit index."
        else:
            risk_level = ThreatRiskLevel.INFO
            recommended_action = "BENIGN: No impersonation or trademark abuse indicators found."

        profile_url = f"https://{norm_platform}.com/{clean_handle}"
        if norm_platform == "telegram":
            profile_url = f"https://t.me/{clean_handle}"

        return {
            "platform": platform_label,
            "handle": f"@{clean_handle}",
            "display_name": clean_display,
            "is_verified": is_verified,
            "profile_url": profile_url,
            "followers_count": followers_count,
            "similarity_score": handle_similarity,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "scam_intent_detected": scam_intent_detected,
            "findings": findings,
            "recommended_action": recommended_action
        }

    def analyze_and_record(
        self,
        db: Session,
        platform: str,
        handle: str,
        display_name: Optional[str] = None,
        bio_text: Optional[str] = None,
        followers_count: Optional[int] = None,
        following_count: Optional[int] = None,
        is_verified: bool = False,
        auto_create_threat: bool = True
    ) -> Dict[str, Any]:
        """
        Analyzes profile, optionally creates a ThreatItem in threat_items table if risk >= 60,
        attaches structured evidence, and returns complete report.
        """
        analysis = self.analyze_profile(
            platform=platform,
            handle=handle,
            display_name=display_name,
            bio_text=bio_text,
            followers_count=followers_count,
            following_count=following_count,
            is_verified=is_verified
        )

        threat_id = None
        threat_code = None

        if auto_create_threat and analysis["risk_score"] >= 60.0:
            # Check if threat already exists for this handle/platform
            existing = db.query(ThreatItem).filter(
                (ThreatItem.source_url == analysis["profile_url"]) |
                (ThreatItem.title.contains(analysis["handle"]))
            ).first()

            if existing:
                threat_id = existing.id
                threat_code = existing.threat_code
            else:
                year = datetime.datetime.utcnow().year
                count = db.query(ThreatItem).count() + 1
                threat_code = f"THR-{year}-{count:03d}"

                new_threat = ThreatItem(
                    threat_code=threat_code,
                    category=ThreatCategory.SOCIAL_IMPERSONATION,
                    title=f"Social Impersonation: {analysis['platform']} {analysis['handle']}",
                    source_url=analysis["profile_url"],
                    target_brand="FinNova Financial Technologies",
                    risk_level=analysis["risk_level"],
                    confidence_score=analysis["risk_score"],
                    status=ThreatStatus.UNDER_INVESTIGATION,
                    explanation=(
                        f"Automated social intelligence identified unauthorized account {analysis['handle']} on {analysis['platform']}. "
                        f"Calculated risk: {analysis['risk_score']}%. "
                        f"Findings: {', '.join([f['title'] for f in analysis['findings'][:2]])}."
                    ),
                    recommended_action=analysis["recommended_action"],
                    detected_at=datetime.datetime.utcnow()
                )
                db.add(new_threat)
                db.flush()
                threat_id = new_threat.id

                # Attach evidence
                evidence_payload = {
                    "platform": analysis["platform"],
                    "handle": analysis["handle"],
                    "display_name": analysis["display_name"],
                    "bio": bio_text,
                    "is_verified": is_verified,
                    "findings": analysis["findings"]
                }
                evidence = ThreatEvidence(
                    threat_id=new_threat.id,
                    evidence_type="SOCIAL_PROFILE_METADATA",
                    data_payload=json.dumps(evidence_payload),
                    created_at=datetime.datetime.utcnow()
                )
                db.add(evidence)
                db.commit()

        analysis["threat_id"] = threat_id
        analysis["threat_code"] = threat_code
        return analysis
