import logging
from sqlalchemy import text, inspect
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
from app.models.threat import ThreatItem, ThreatEvidence, DomainScan, BrandAsset, BrandProduct
from app.models.brand import Brand
from app.core.security import get_password_hash
from app.core.config import settings

logger = logging.getLogger(__name__)

def ensure_columns_for_table(table_name: str, column_specs: list) -> None:
    """
    Idempotently and safely adds columns to an existing table if missing.
    - Pre-checks column existence using SQLAlchemy inspector.
    - Uses isolated per-column transactions with engine.begin() so a failure never
      poisons a PostgreSQL transaction block.
    - Adapts SQL dialect types for PostgreSQL vs SQLite (e.g. TIMESTAMP vs DATETIME).
    - Uses ADD COLUMN IF NOT EXISTS on PostgreSQL.
    """
    try:
        inspector = inspect(engine)
        if not inspector.has_table(table_name):
            return

        existing_cols = {c["name"].lower() for c in inspector.get_columns(table_name)}
        is_postgres = engine.dialect.name == "postgresql"

        for spec in column_specs:
            col_name = spec[0]
            if col_name.lower() in existing_cols:
                continue

            pg_type = spec[1]
            sq_type = spec[2] if len(spec) > 2 else pg_type
            col_type = pg_type if is_postgres else sq_type

            try:
                with engine.begin() as conn:
                    if is_postgres:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                    else:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))
                existing_cols.add(col_name.lower())
                logger.info(f"Added column {table_name}.{col_name} successfully.")
            except Exception as e:
                logger.warning(f"Could not add column {table_name}.{col_name}: {e}")
    except Exception as e:
        logger.warning(f"Inspection error on table {table_name}: {e}")

def ensure_security_columns() -> None:
    """Idempotently ensure security, OTP, lockout, session and MFA columns exist."""
    user_cols = [
        ("is_verified", "BOOLEAN DEFAULT TRUE", "BOOLEAN DEFAULT 1"),
        ("otp_hash", "VARCHAR(255)"),
        ("otp_expires_at", "TIMESTAMP", "DATETIME"),
        ("otp_attempts", "INTEGER DEFAULT 0"),
        ("otp_last_sent_at", "TIMESTAMP", "DATETIME"),
        ("failed_login_attempts", "INTEGER DEFAULT 0"),
        ("locked_until", "TIMESTAMP", "DATETIME"),
        ("password_changed_at", "TIMESTAMP", "DATETIME"),
        ("password_reset_token_hash", "VARCHAR(255)"),
        ("password_reset_expires_at", "TIMESTAMP", "DATETIME"),
        ("mfa_enabled", "BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
        ("mfa_secret", "VARCHAR(255)"),
        ("mfa_backup_codes", "TEXT"),
        ("organization", "VARCHAR(100) DEFAULT 'BrandGuard Demo Enterprise'"),
    ]
    ensure_columns_for_table("users", user_cols)

    # Ensure existing seeded users are marked verified
    try:
        is_postgres = engine.dialect.name == "postgresql"
        val = "TRUE" if is_postgres else "1"
        with engine.begin() as conn:
            conn.execute(text(f"UPDATE users SET is_verified = {val} WHERE is_verified IS NULL OR email LIKE '%@brandguard.io' OR email LIKE '%@finnova.com'"))
    except Exception:
        pass

def ensure_organization_columns() -> None:
    """Idempotently ensure organization column exists in tables for multi-tenant isolation."""
    for table in [
        "users", "contents", "brand_guidelines", "threat_items",
        "approved_sources", "approved_facts", "banned_words", "approved_terminology"
    ]:
        ensure_columns_for_table(table, [
            ("organization", "VARCHAR(100) DEFAULT 'BrandGuard Demo Enterprise'")
        ])

def ensure_finding_grounding_columns() -> None:
    """Idempotently ensure grounding_status, grounding_reasons, and evidence_state exist on findings."""
    finding_cols = [
        ("grounding_status", "VARCHAR(50) DEFAULT 'GROUNDED'"),
        ("grounding_reasons", "TEXT DEFAULT ''"),
        ("evidence_state", "VARCHAR(50) DEFAULT 'verified'")
    ]
    ensure_columns_for_table("findings", finding_cols)
    ensure_columns_for_table("ai_reviews", [
        ("analysis_mode", "VARCHAR(20) DEFAULT 'rules'")
    ])

def ensure_workflow_columns() -> None:
    """Idempotently ensure workflow verification, approval, version and audit columns exist."""
    content_cols = [
        ("verified_by_id", "INTEGER"),
        ("verified_revision_id", "INTEGER"),
        ("approved_by_id", "INTEGER"),
        ("approved_revision_id", "INTEGER"),
        ("version", "INTEGER DEFAULT 1")
    ]
    ensure_columns_for_table("contents", content_cols)

    audit_cols = [
        ("organization", "VARCHAR(100) DEFAULT 'BrandGuard Demo Enterprise'"),
        ("reason", "TEXT"),
        ("revision_id", "INTEGER"),
        ("prev_hash", "VARCHAR(64)"),
        ("hash", "VARCHAR(64)"),
        ("ip_address", "VARCHAR(50)"),
    ]
    ensure_columns_for_table("audit_logs", audit_cols)

def ensure_brand_and_asset_columns() -> None:
    """Idempotently ensure brand workspace and extended asset validation columns exist."""
    ensure_columns_for_table("contents", [
        ("brand_id", "INTEGER")
    ])
    ensure_columns_for_table("brand_guidelines", [
        ("brand_id", "INTEGER")
    ])
    ensure_columns_for_table("brand_assets", [
        ("organization", "VARCHAR(100) DEFAULT 'BrandGuard Demo Enterprise'"),
        ("category", "VARCHAR(50) DEFAULT 'logo'"),
        ("approval_status", "VARCHAR(30) DEFAULT 'approved'"),
        ("dimensions", "VARCHAR(50)"),
        ("file_size_kb", "FLOAT")
    ])

def ensure_all_schema_columns() -> None:
    """Runs all schema column migrations in safe sequence."""
    ensure_security_columns()
    ensure_organization_columns()
    ensure_finding_grounding_columns()
    ensure_workflow_columns()
    ensure_brand_and_asset_columns()

def backfill_audit_hashes(db: Session = None) -> None:
    """
    Backfill helper retained for backward compatibility.
    Preserves existing audit records without fabricating historical hashes.
    """
    pass

def ensure_guidelines(db: Session) -> None:
    """Idempotently ensures core and generic brand guidelines exist in the database."""
    standard_guidelines = [
        {
            "title": "Financial Claims & Guarantees Policy",
            "category": "Financial Claims",
            "description": "Marketing content must never state or imply guaranteed investment returns or zero-risk financial growth. All performance projections must include standardized regulatory disclosures.",
            "rule_type": "Deterministic",
            "severity": SeverityLevel.CRITICAL
        },
        {
            "title": "Financial Claims Policy",
            "category": "Financial Claims",
            "description": "All financial performance, return, and capital protection claims must be substantiated and accompanied by required disclaimers.",
            "rule_type": "Deterministic",
            "severity": SeverityLevel.CRITICAL
        },
        {
            "title": "Superlative Claims Policy",
            "category": "Tone",
            "description": "Unsubstantiated superlatives, peer superiority claims, and sensationalist wealth promises are strictly prohibited.",
            "rule_type": "Deterministic",
            "severity": SeverityLevel.HIGH
        },
        {
            "title": "Substantiation Policy",
            "category": "Evidence",
            "description": "All quantitative comparisons, accuracy statistics, survey ratios, and client performance metrics must be verifiable and independently cited.",
            "rule_type": "Fact_Checked",
            "severity": SeverityLevel.HIGH
        },
        {
            "title": "Brand Tone & Communication Consistency",
            "category": "Tone",
            "description": "Brand communication must be Professional, Trustworthy, Clear, Customer-focused, and Responsible. Avoid hype, sensationalism, and aggressive or misleading promises.",
            "rule_type": "AI_Analyzed",
            "severity": SeverityLevel.HIGH
        },
        {
            "title": "Official Terminology Standard",
            "category": "Terminology",
            "description": "Use approved brand terminology consistently across all channels. Avoid ambiguous, non-standard, or legally sensitive jargon in customer-facing content.",
            "rule_type": "Deterministic",
            "severity": SeverityLevel.MEDIUM
        },
        {
            "title": "Evidence & Citation Validation Requirement",
            "category": "Evidence",
            "description": "Any quantifiable statistic or market comparison must link directly to an approved official source or audited regulatory filing.",
            "rule_type": "Fact_Checked",
            "severity": SeverityLevel.HIGH
        }
    ]

    for g_data in standard_guidelines:
        existing = db.query(BrandGuideline).filter(BrandGuideline.title == g_data["title"]).first()
        if not existing:
            db.add(BrandGuideline(**g_data))
    db.commit()

def init_db(db: Session = None) -> None:
    # 1. Create any missing tables (e.g. user_sessions)
    Base.metadata.create_all(bind=engine)
    # 2. Safely add missing columns to existing tables before any queries
    ensure_all_schema_columns()

    close_db_at_end = False
    if db is None:
        db = SessionLocal()
        close_db_at_end = True

    try:
        is_production = settings.ENVIRONMENT.lower() == "production"

        # Check if users already seeded (or guidelines seeded in production)
        if db.query(User).first() or (is_production and db.query(BrandGuideline).first()):
            ensure_guidelines(db)
            seed_threat_data(db)
            return

        print("--- Seeding Database with BrandGuard Guidelines and Data ---")
        ensure_guidelines(db)

        # 1. Seed Users (Admin, Creator, Reviewer, Manager) - skip in production
        users = []
        if not is_production:
            users = [
                User(
                    email="admin@brandguard.io",
                    full_name="Alex Morgan (Admin)",
                    hashed_password=get_password_hash("Admin@123"),
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_verified=True
                ),
                User(
                    email="creator@brandguard.io",
                    full_name="Jordan Lee (Creator)",
                    hashed_password=get_password_hash("Creator@123"),
                    role=UserRole.CREATOR,
                    is_active=True,
                    is_verified=True
                ),
                User(
                    email="reviewer@brandguard.io",
                    full_name="Sam Taylor (Reviewer)",
                    hashed_password=get_password_hash("Reviewer@123"),
                    role=UserRole.REVIEWER,
                    is_active=True,
                    is_verified=True
                ),
                User(
                    email="manager@brandguard.io",
                    full_name="Morgan Vance (Compliance Manager)",
                    hashed_password=get_password_hash("Manager@123"),
                    role=UserRole.MANAGER,
                    is_active=True,
                    is_verified=True
                ),
            ]
            db.add_all(users)
            db.commit()

        # 2. Seed Brand Guidelines (idempotent)
        ensure_guidelines(db)
        guidelines = db.query(BrandGuideline).all()

        # 3. Seed Approved Sources
        sources = [
            ApprovedSource(
                name="Brand Compliance Reference Guide 2026",
                url="https://docs.example-brandguard.com/compliance/guide-2026.pdf",
                source_type="Product Documentation",
                description="Official product specifications, compliance architecture, and certification standards.",
                is_verified=True
            ),
            ApprovedSource(
                name="Annual Brand Governance & Compliance Report 2025",
                url="https://docs.example-brandguard.com/governance/annual-report-2025",
                source_type="Regulatory Filing",
                description="Audited metrics on brand compliance performance, customer trust index, and security accreditations.",
                is_verified=True
            ),
            ApprovedSource(
                name="Regulatory Sandbox Verification Certificate",
                url="https://docs.example-brandguard.com/compliance/regulatory-status",
                source_type="Regulatory Sandbox",
                description="Official framework validation for brand compliance and digital governance solutions.",
                is_verified=True
            ),
        ]
        db.add_all(sources)
        db.commit()

        # 4. Seed Approved Facts
        facts = [
            ApprovedFact(
                statement="BrandGuard Demo Enterprise provides brand compliance and content governance services.",
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
                statement="All customer data is protected using 256-bit encryption and enterprise-grade security standards.",
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
                explanation="Brand guidelines strictly avoid hyperbole, get-rich-quick tropes, and predatory marketing phrases.",
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
                explanation="Slang and meme terminology degrade institutional trust in brand credibility and professionalism.",
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
                context="Official descriptor of the organization's technological ecosystem.",
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

        # 7. Seed Initial Sample Demonstration Content (only if users were seeded)
        if users and len(users) > 1:
            sample_body = (
                "BrandGuard Demo Enterprise is an ultra-fast money app that promises guaranteed returns for every customer! "
                "Our new wealth wizardry platform provides a risk-free investment opportunity with 100% profit guaranteed. "
                "Experience unhackable transfers and instant wealth today."
            )
            sample_content = Content(
                title="Brand Compliance Review Sample [Demo Draft]",
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
                    explanation="This statement makes a financial guarantee that violates the Financial Claims & Guarantees Policy.",
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
                    evidence=[{"source": "Brand Compliance Manual", "text": "All investment literature must carry standard risk disclosure"}],
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
                    explanation="'money app' violates the Official Terminology Standard. Use 'digital financial services'.",
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
                    explanation="Tone is sensationalized and predatory. Brand guidelines promote disciplined, responsible financial planning.",
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
                details="Database schema initialized and BrandGuard demonstration sample data seeded successfully."
            )
            db.add(audit)
            db.commit()

        print("--- Database seeding complete! ---")
        ensure_default_brands(db)
        seed_threat_data(db)
    finally:
        if close_db_at_end:
            db.close()

def ensure_default_brands(db: Session) -> None:
    """Idempotently ensures default enterprise brands exist for multi-brand workspaces."""
    existing_brand = db.query(Brand).first()
    if not existing_brand:
        default_brands = [
            Brand(
                name="BrandGuard AI Core",
                code="BGAI-CORE",
                description="Primary Enterprise Brand Governance & Protection Platform",
                industry="Enterprise SaaS & AI",
                organization="BrandGuard Demo Enterprise",
                is_active=True
            ),
            Brand(
                name="BrandGuard Wealth",
                code="BGAI-WLTH",
                description="Wealth Management & Institutional Asset Governance",
                industry="Wealth Management",
                organization="BrandGuard Demo Enterprise",
                is_active=True
            ),
            Brand(
                name="FinNova Prime",
                code="FN-PRIME",
                description="Fintech Infrastructure & Cross-Border Treasury Solutions",
                industry="Fintech & Banking",
                organization="BrandGuard Demo Enterprise",
                is_active=True
            )
        ]
        db.add_all(default_brands)
        db.commit()
        existing_brand = default_brands[0]

    # Associate contents that have null brand_id with the primary brand
    try:
        if existing_brand:
            db.query(Content).filter(Content.brand_id.is_(None)).update({"brand_id": existing_brand.id})
            db.commit()
    except Exception as e:
        logger.warning(f"Could not link default brand to existing contents: {e}")

def seed_threat_data(db: Session) -> None:
    # Check if threat data already seeded
    if db.query(ThreatItem).first():
        return

    print("--- Seeding Digital Brand Protection Baseline Records ---")

    # 1. Official Brand Assets
    assets = [
        BrandAsset(
            asset_name="BrandGuard Corporate Primary Logo",
            asset_type="Primary Logo",
            image_path="/assets/brand/brandguard-logo-primary.svg",
            perceptual_hash="d41d8cd98f00b204e9800998ecf8427e",
            is_active=True
        ),
        BrandAsset(
            asset_name="BrandGuard App Icon & Shield Mark",
            asset_type="Icon Mark",
            image_path="/assets/brand/brandguard-shield-mark.svg",
            perceptual_hash="9e107d9d372bb6826bd81d3542a419d6",
            is_active=True
        ),
        BrandAsset(
            asset_name="BrandGuard Verified Trust Badge",
            asset_type="Watermark",
            image_path="/assets/brand/brandguard-trust-badge.png",
            perceptual_hash="c4ca4238a0b923820dcc509a6f75849b",
            is_active=True
        )
    ]
    db.add_all(assets)
    db.commit()

    # 2. Official Brand Products
    products = [
        BrandProduct(
            product_name="BrandGuard SmartGrowth Managed Portfolio",
            sku="BGD-SGP-01",
            official_msrp=10000.0,
            authorized_distributors='["BrandGuard Web Platform", "BrandGuard Mobile App", "Authorized Partners"]',
            reference_image_path="/assets/products/smartgrowth.png"
        ),
        BrandProduct(
            product_name="BrandGuard Prime Yield Flexible Deposit",
            sku="BGD-PYD-02",
            official_msrp=25000.0,
            authorized_distributors='["BrandGuard Wealth Portal", "Authorized Partner Network"]',
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
            title="Credential Harvesting Portal — yourbrand-secure-login.cc",
            source_url="https://yourbrand-secure-login.cc/auth/login",
            target_brand="BrandGuard Demo Enterprise",
            risk_level=ThreatRiskLevel.CRITICAL,
            confidence_score=95.0,
            status=ThreatStatus.UNDER_INVESTIGATION,
            explanation="Lookalike domain mimicking brand client portal styling with unauthorized credential capture scripts.",
            recommended_action="Submit urgent registrar domain suspension notice to Cloudflare & Namecheap abuse desks."
        ),
        ThreatItem(
            threat_code="THR-2026-002",
            category=ThreatCategory.SOCIAL_IMPERSONATION,
            title="Impersonation Support Account — @yourbrand_refund_help",
            source_url="https://telegram.org/yourbrand_refund_help",
            target_brand="BrandGuard Demo Enterprise",
            risk_level=ThreatRiskLevel.HIGH,
            confidence_score=89.0,
            status=ThreatStatus.NEW,
            explanation="Telegram handle claiming to be official brand support, actively soliciting customer OTPs and personal details.",
            recommended_action="File brand impersonation report with Telegram platform security team."
        ),
        ThreatItem(
            threat_code="THR-2026-003",
            category=ThreatCategory.COUNTERFEIT_PRODUCT,
            title="Unauthorized Investment Note — 40% Guaranteed SmartGrowth Bond",
            source_url="https://unregulated-p2p-market.in/listings/smartgrowth-bonds-9842",
            target_brand="BrandGuard Demo Enterprise",
            risk_level=ThreatRiskLevel.HIGH,
            confidence_score=92.0,
            status=ThreatStatus.VERIFIED_THREAT,
            explanation="Unregistered third-party entity offering bogus fixed-return promissory notes using brand SmartGrowth trademark.",
            recommended_action="Issue formal Cease & Desist letter and notify relevant regulatory authority."
        ),
        ThreatItem(
            threat_code="THR-2026-004",
            category=ThreatCategory.UNAUTHORIZED_LOGO,
            title="Fraudulent Partner Endorsement — crypto-wealth-advisor.biz",
            source_url="https://crypto-wealth-advisor.biz/partners.html",
            target_brand="BrandGuard Demo Enterprise",
            risk_level=ThreatRiskLevel.MEDIUM,
            confidence_score=84.0,
            status=ThreatStatus.RESOLVED,
            explanation="Cryptocurrency advisory site displaying brand primary logo in 'Institutional Partners' banner without agreement.",
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
        data_payload='{"forms_detected": 1, "action": "/harvest.php", "title": "Brand Client Portal - Sign In", "brand_keywords_count": 8}'
    )
    ev3 = ThreatEvidence(
        threat_id=threats[1].id,
        evidence_type="PROFILE_METADATA",
        data_payload='{"handle": "@yourbrand_refund_help", "bio": "Official 24/7 Brand Grievance Desk. DM with registered phone number.", "verified": false}'
    )
    ev4 = ThreatEvidence(
        threat_id=threats[2].id,
        evidence_type="LISTING_DETAILS",
        data_payload='{"listing_title": "SmartGrowth Bond Series IV", "promised_yield": "40% annual", "official_msrp_delta": "+300%", "seller": "Global Apex Capital"}'
    )
    db.add_all([ev1, ev2, ev3, ev4])
    db.commit()

    # 5. Initial Domain Scan
    scan1 = DomainScan(
        scanned_url="https://yourbrand-secure-login.cc/auth/login",
        domain_name="yourbrand-secure-login.cc",
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

