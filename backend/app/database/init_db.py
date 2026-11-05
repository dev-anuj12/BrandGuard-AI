from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.enums import UserRole, SeverityLevel, ContentStatus, FindingCategory, ThreatCategory, ThreatRiskLevel, ThreatStatus
from app.models.user import User
from app.models.guideline import (
    BrandGuideline,
    ApprovedSource,
    ApprovedFact,
    BannedWord,
    ApprovedTerminology
)
from app.models.content import Content, ContentRevision
from app.models.review import AIReview, Finding, Suggestion
from app.models.audit import AuditLog
from sqlalchemy import text
from app.models.threat import ThreatItem, ThreatEvidence, DomainScan, BrandAsset, BrandProduct
from app.core.security import get_password_hash

def ensure_organization_columns() -> None:
    """Idempotently ensure organization column exists in tables for multi-tenant isolation."""
    with engine.connect() as conn:
        for table in ["users", "contents", "brand_guidelines", "threat_items"]:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN organization VARCHAR(100) DEFAULT 'FinNova Financial Technologies'"))
                conn.commit()
            except Exception:
                # Column already present or table not yet created
                pass

def init_db(db: Session = None) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    ensure_organization_columns()

    close_db_at_end = False
    if db is None:
        db = SessionLocal()
        close_db_at_end = True

    try:
        # Check if users already seeded
        if db.query(User).first():
            seed_threat_data(db)
            return

        print("--- Seeding Database with FinNova Demo Data ---")

        # 1. Seed Users (Admin, Creator, Reviewer, Manager)
        users = [
            User(
                email="admin@finnova.com",
                full_name="Lakshita Bisen (Admin)",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                is_active=True
            ),
            User(
                email="creator@finnova.com",
                full_name="Nakshatra Titarmare (Creator)",
                hashed_password=get_password_hash("Creator@123"),
                role=UserRole.CREATOR,
                is_active=True
            ),
            User(
                email="reviewer@finnova.com",
                full_name="Anuj Vishwakarma (Reviewer)",
                hashed_password=get_password_hash("Reviewer@123"),
                role=UserRole.REVIEWER,
                is_active=True
            ),
            User(
                email="manager@finnova.com",
                full_name="Elena Vance (Compliance Manager)",
                hashed_password=get_password_hash("Manager@123"),
                role=UserRole.MANAGER,
                is_active=True
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Seed Brand Guidelines
        guidelines = [
            BrandGuideline(
                title="Financial Claims & Guarantees Policy",
                category="Financial Claims",
                description="Marketing content must never state or imply guaranteed investment returns or zero-risk financial growth. All performance projections must include standardized regulatory disclosures.",
                rule_type="Deterministic",
                severity=SeverityLevel.CRITICAL
            ),
            BrandGuideline(
                title="Brand Tone & Communication Consistency",
                category="Tone",
                description="FinNova's communication tone must be Professional, Trustworthy, Clear, Customer-friendly, and Responsible. Avoid hype, sensationalism, and aggressive promises.",
                rule_type="AI_Analyzed",
                severity=SeverityLevel.HIGH
            ),
            BrandGuideline(
                title="Official Terminology Standard",
                category="Terminology",
                description="Use approved fintech terminology. Refer to FinNova offerings as 'digital financial services' and 'customer-focused solutions'. Avoid ambiguous or non-standard jargon.",
                rule_type="Deterministic",
                severity=SeverityLevel.MEDIUM
            ),
            BrandGuideline(
                title="Evidence & Citation Validation Requirement",
                category="Evidence",
                description="Any quantifiable statistic or market comparison must link directly to an approved official source or audited regulatory filing.",
                rule_type="Fact_Checked",
                severity=SeverityLevel.HIGH
            ),
        ]
        db.add_all(guidelines)
        db.commit()

        # 3. Seed Approved Sources
        sources = [
            ApprovedSource(
                name="FinNova Official Product Factsheet 2026",
                url="https://finnova-demo.com/docs/factsheet-2026.pdf",
                source_type="Product Documentation",
                description="Official product specifications, transaction security architecture, and regulatory certifications.",
                is_verified=True
            ),
            ApprovedSource(
                name="FinNova Annual Financial & Compliance Report 2025",
                url="https://finnova-demo.com/investor-relations/annual-report-2025",
                source_type="Regulatory Filing",
                description="Audited metrics on digital financial transaction volume, client satisfaction index, and security accreditations.",
                is_verified=True
            ),
            ApprovedSource(
                name="Reserve Bank / FinTech Regulatory Sandbox Verification",
                url="https://finnova-demo.com/compliance/regulatory-status",
                source_type="Regulatory Sandbox",
                description="Official framework validation for digital financial solutions.",
                is_verified=True
            ),
        ]
        db.add_all(sources)
        db.commit()

        # 4. Seed Approved Facts
        facts = [
            ApprovedFact(
                statement="FinNova provides digital financial services and wealth planning tools.",
                category="Company Overview",
                source_id=sources[0].id,
                guideline_id=guidelines[2].id
            ),
            ApprovedFact(
                statement="Product features and metrics must be supported by official documentation.",
                category="Compliance Policy",
                source_id=sources[0].id,
                guideline_id=guidelines[3].id
            ),
            ApprovedFact(
                statement="Financial performance claims require approved evidence and risk disclosures.",
                category="Regulatory Compliance",
                source_id=sources[1].id,
                guideline_id=guidelines[0].id
            ),
            ApprovedFact(
                statement="FinNova uses 256-bit encryption for all customer transactions.",
                category="Security",
                source_id=sources[0].id,
                guideline_id=guidelines[2].id
            ),
        ]
        db.add_all(facts)
        db.commit()

        # 5. Seed Banned Words & Phrases
        banned = [
            BannedWord(
                word_or_phrase="guaranteed returns",
                category="Financial Claims",
                severity=SeverityLevel.CRITICAL,
                explanation="Financial regulations strictly prohibit promising guaranteed returns on investment products.",
                suggested_replacement="market-competitive returns designed around your risk profile"
            ),
            BannedWord(
                word_or_phrase="risk-free investment",
                category="Financial Claims",
                severity=SeverityLevel.CRITICAL,
                explanation="No investment product is entirely free of risk. This phrase constitutes a regulatory violation.",
                suggested_replacement="structured risk-managed investment options"
            ),
            BannedWord(
                word_or_phrase="instant wealth",
                category="Tone & Marketing",
                severity=SeverityLevel.HIGH,
                explanation="FinNova strictly avoids hyperbole, get-rich-quick tropes, and predatory marketing phrases.",
                suggested_replacement="disciplined long-term wealth planning"
            ),
            BannedWord(
                word_or_phrase="100% profit",
                category="Financial Claims",
                severity=SeverityLevel.CRITICAL,
                explanation="Unverified and misleading profit guarantees violate advertising standards.",
                suggested_replacement="growth-oriented financial strategies"
            ),
            BannedWord(
                word_or_phrase="crypto moon",
                category="Tone & Brand Identity",
                severity=SeverityLevel.HIGH,
                explanation="Slang and meme terminology degrade institutional trust in FinNova's brand.",
                suggested_replacement="diversified digital asset allocation"
            ),
        ]
        db.add_all(banned)
        db.commit()

        # 6. Seed Approved Terminology
        terminology = [
            ApprovedTerminology(
                approved_term="digital financial services",
                incorrect_term="money app",
                context="Official descriptor of FinNova's technological ecosystem.",
                guideline_id=guidelines[2].id
            ),
            ApprovedTerminology(
                approved_term="secure transactions",
                incorrect_term="unhackable transfers",
                context="Describing transaction security protocols.",
                guideline_id=guidelines[2].id
            ),
            ApprovedTerminology(
                approved_term="financial planning",
                incorrect_term="wealth wizardry",
                context="Advisory and wealth allocation offerings.",
                guideline_id=guidelines[2].id
            ),
            ApprovedTerminology(
                approved_term="customer-focused solutions",
                incorrect_term="cheap banking hacks",
                context="Referring to client product suites.",
                guideline_id=guidelines[2].id
            ),
        ]
        db.add_all(terminology)
        db.commit()

        # 7. Seed Initial Sample Demonstration Content
        sample_body = (
            "FinNova is an ultra-fast money app that promises guaranteed returns for every customer! "
            "Our new wealth wizardry platform provides a risk-free investment opportunity with 100% profit guaranteed. "
            "Experience unhackable transfers and instant wealth today."
        )
        sample_content = Content(
            title="FinNova Wealth Launch Campaign [Sample Draft]",
            original_body=sample_body,
            current_body=sample_body,
            channel="Social Media Campaign",
            target_audience="Retail Investors & Young Professionals",
            status=ContentStatus.AI_REVIEW_COMPLETED,
            creator_id=users[1].id
        )
        db.add(sample_content)
        db.commit()

        # Seed initial revision
        rev1 = ContentRevision(
            content_id=sample_content.id,
            version=1,
            body=sample_body,
            revised_by_id=users[1].id,
            change_summary="Initial submission by creator"
        )
        db.add(rev1)
        db.commit()

        # Seed initial AI Review & Findings
        review1 = AIReview(
            content_id=sample_content.id,
            revision_id=rev1.id,
            overall_score=42.0,
            overall_status="Completed",
            summary="Multiple critical brand violations detected: 3 prohibited financial claims, 2 non-compliant terms, and inappropriate tone.",
            provider="Rule Engine + AI Fallback"
        )
        db.add(review1)
        db.commit()

        findings = [
            Finding(
                review_id=review1.id,
                category=FindingCategory.BANNED_EXPRESSION,
                severity=SeverityLevel.CRITICAL,
                matched_text="guaranteed returns",
                explanation="This statement makes a financial guarantee that violates FinNova Financial Claims Policy.",
                guideline_id=guidelines[0].id,
                guideline_reference="Financial Claims & Guarantees Policy",
                evidence=[{"source": "Regulatory Compliance Standard", "text": "Prohibits unconditional guarantee of investment yield"}],
                confidence=0.98,
                suggested_correction="market-competitive returns designed around your risk profile",
                status="Pending",
                engine_source="Rule Engine"
            ),
            Finding(
                review_id=review1.id,
                category=FindingCategory.BANNED_EXPRESSION,
                severity=SeverityLevel.CRITICAL,
                matched_text="risk-free investment",
                explanation="Financial regulations strictly prohibit describing investment portfolios as risk-free.",
                guideline_id=guidelines[0].id,
                guideline_reference="Financial Claims & Guarantees Policy",
                evidence=[{"source": "FinNova Compliance Manual", "text": "All investment literature must carry standard risk disclosure"}],
                confidence=0.97,
                suggested_correction="structured risk-managed investment options",
                status="Pending",
                engine_source="Rule Engine"
            ),
            Finding(
                review_id=review1.id,
                category=FindingCategory.INCORRECT_TERMINOLOGY,
                severity=SeverityLevel.MEDIUM,
                matched_text="money app",
                explanation="'money app' violates FinNova Official Terminology Standard. Use 'digital financial services'.",
                guideline_id=guidelines[2].id,
                guideline_reference="Official Terminology Standard",
                evidence=[{"source": "Brand Style Guide v2.4", "text": "Preserve institutional prestige and professional standing"}],
                confidence=0.95,
                suggested_correction="digital financial services",
                status="Pending",
                engine_source="Rule Engine"
            ),
            Finding(
                review_id=review1.id,
                category=FindingCategory.TONE_INCONSISTENCY,
                severity=SeverityLevel.HIGH,
                matched_text="instant wealth",
                explanation="Tone is sensationalized and predatory. FinNova promotes disciplined, responsible financial planning.",
                guideline_id=guidelines[1].id,
                guideline_reference="Brand Tone & Communication Consistency",
                evidence=[{"source": "Brand Tone Guidelines", "text": "Professional, Trustworthy, Clear, Customer-friendly, Responsible"}],
                confidence=0.92,
                suggested_correction="disciplined long-term wealth planning",
                status="Pending",
                engine_source="AI Engine"
            )
        ]
        db.add_all(findings)
        db.commit()

        # Seed initial suggestions linked to findings
        for f in findings:
            sugg = Suggestion(
                finding_id=f.id,
                original_text=f.matched_text,
                suggested_text=f.suggested_correction,
                reason=f.explanation,
                status="Pending"
            )
            db.add(sugg)
        db.commit()

        # Seed initial Audit Log
        audit = AuditLog(
            user_id=users[0].id,
            action="SYSTEM_INIT",
            entity_type="Database",
            entity_id=1,
            details="Database schema initialized and FinNova demonstration sample data seeded successfully."
        )
        db.add(audit)
        db.commit()

        print("--- Database seeding complete! ---")
        seed_threat_data(db)
    finally:
        if close_db_at_end:
            db.close()

def seed_threat_data(db: Session) -> None:
    # Check if threat data already seeded
    if db.query(ThreatItem).first():
        return

    print("--- Seeding Digital Brand Protection Baseline Records ---")

    # 1. Official Brand Assets
    assets = [
        BrandAsset(
            asset_name="FinNova Corporate Primary Logo",
            asset_type="Primary Logo",
            image_path="/assets/brand/finnova-logo-primary.svg",
            perceptual_hash="d41d8cd98f00b204e9800998ecf8427e",
            is_active=True
        ),
        BrandAsset(
            asset_name="FinNova App Icon & Shield Mark",
            asset_type="Icon Mark",
            image_path="/assets/brand/finnova-shield-mark.svg",
            perceptual_hash="9e107d9d372bb6826bd81d3542a419d6",
            is_active=True
        ),
        BrandAsset(
            asset_name="FinNova Verified Trust Badge",
            asset_type="Watermark",
            image_path="/assets/brand/finnova-trust-badge.png",
            perceptual_hash="c4ca4238a0b923820dcc509a6f75849b",
            is_active=True
        )
    ]
    db.add_all(assets)
    db.commit()

    # 2. Official Brand Products
    products = [
        BrandProduct(
            product_name="FinNova SmartGrowth Managed Portfolio",
            sku="FNV-SGP-01",
            official_msrp=10000.0,
            authorized_distributors='["FinNova Web Platform", "FinNova Mobile App", "SEBI Registered Advisors"]',
            reference_image_path="/assets/products/smartgrowth.png"
        ),
        BrandProduct(
            product_name="FinNova Prime Yield Flexible Deposit",
            sku="FNV-PYD-02",
            official_msrp=25000.0,
            authorized_distributors='["FinNova Wealth Portal", "HDFC Partner Branch Network"]',
            reference_image_path="/assets/products/prime-yield.png"
        )
    ]
    db.add_all(products)
    db.commit()

    # 3. Baseline Threat Incidents
    threats = [
        ThreatItem(
            threat_code="THR-2026-001",
            category=ThreatCategory.PHISHING_DOMAIN,
            title="Credential Harvesting Portal — finnova-secure-login.cc",
            source_url="https://finnova-secure-login.cc/auth/login",
            target_brand="FinNova Financial Technologies",
            risk_level=ThreatRiskLevel.CRITICAL,
            confidence_score=95.0,
            status=ThreatStatus.UNDER_INVESTIGATION,
            explanation="Lookalike domain mimicking FinNova client portal styling with unauthorized credential capture scripts.",
            recommended_action="Submit urgent registrar domain suspension notice to Cloudflare & Namecheap abuse desks."
        ),
        ThreatItem(
            threat_code="THR-2026-002",
            category=ThreatCategory.SOCIAL_IMPERSONATION,
            title="Impersonation Support Account — @finnova_refund_help",
            source_url="https://telegram.org/finnova_refund_help",
            target_brand="FinNova Financial Technologies",
            risk_level=ThreatRiskLevel.HIGH,
            confidence_score=89.0,
            status=ThreatStatus.NEW,
            explanation="Telegram handle claiming to be 'FinNova Instant Refund Desk', actively soliciting customer OTPs and PAN details.",
            recommended_action="File brand impersonation report with Telegram platform security team."
        ),
        ThreatItem(
            threat_code="THR-2026-003",
            category=ThreatCategory.COUNTERFEIT_PRODUCT,
            title="Unauthorized Investment Note — 40% Guaranteed SmartGrowth Bond",
            source_url="https://unregulated-p2p-market.in/listings/finnova-bonds-9842",
            target_brand="FinNova Financial Technologies",
            risk_level=ThreatRiskLevel.HIGH,
            confidence_score=92.0,
            status=ThreatStatus.VERIFIED_THREAT,
            explanation="Unregistered third-party entity offering bogus fixed-return promissory notes using FinNova SmartGrowth trademark.",
            recommended_action="Issue formal Cease & Desist letter and notify SEBI Market Intermediaries Regulation Department."
        ),
        ThreatItem(
            threat_code="THR-2026-004",
            category=ThreatCategory.UNAUTHORIZED_LOGO,
            title="Fraudulent Partner Endorsement — crypto-wealth-advisor.biz",
            source_url="https://crypto-wealth-advisor.biz/partners.html",
            target_brand="FinNova Financial Technologies",
            risk_level=ThreatRiskLevel.MEDIUM,
            confidence_score=84.0,
            status=ThreatStatus.RESOLVED,
            explanation="Cryptocurrency advisory site displaying FinNova primary logo in 'Institutional Partners' banner without agreement.",
            recommended_action="Takedown notice served; offending webmaster removed logo asset. Verified resolved."
        )
    ]
    db.add_all(threats)
    db.commit()

    # 4. Threat Evidence Items
    ev1 = ThreatEvidence(
        threat_id=threats[0].id,
        evidence_type="WHOIS",
        data_payload='{"registrar": "Namecheap Inc.", "creation_date": "2026-10-28", "nameservers": ["dns1.registrar-servers.com"], "registrant_country": "PA"}'
    )
    ev2 = ThreatEvidence(
        threat_id=threats[0].id,
        evidence_type="DOM_SNAPSHOT",
        data_payload='{"forms_detected": 1, "action": "/harvest.php", "title": "FinNova Client Portal - Sign In", "finnova_keywords_count": 8}'
    )
    ev3 = ThreatEvidence(
        threat_id=threats[1].id,
        evidence_type="PROFILE_METADATA",
        data_payload='{"handle": "@finnova_refund_help", "bio": "Official 24/7 FinNova Grievance Desk. DM with registered phone number.", "verified": false}'
    )
    ev4 = ThreatEvidence(
        threat_id=threats[2].id,
        evidence_type="LISTING_DETAILS",
        data_payload='{"listing_title": "FinNova SmartGrowth Bond Series IV", "promised_yield": "40% annual", "official_msrp_delta": "+300%", "seller": "Global Apex Capital"}'
    )
    db.add_all([ev1, ev2, ev3, ev4])
    db.commit()

    # 5. Initial Domain Scan
    scan1 = DomainScan(
        scanned_url="https://finnova-secure-login.cc/auth/login",
        domain_name="finnova-secure-login.cc",
        ip_address="198.51.100.42",
        is_https=True,
        ssl_valid=False,
        status_code=200,
        redirect_count=1,
        similarity_score=87.5,
        risk_score=94.0,
        threat_id=threats[0].id
    )
    db.add(scan1)
    db.commit()
    print("--- Digital Brand Protection Seed Complete! ---")


if __name__ == "__main__":
    init_db()

