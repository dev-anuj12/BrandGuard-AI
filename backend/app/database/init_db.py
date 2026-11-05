from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.enums import UserRole, SeverityLevel, ContentStatus, FindingCategory
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
from app.core.security import get_password_hash

def init_db(db: Session = None) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)

    close_db_at_end = False
    if db is None:
        db = SessionLocal()
        close_db_at_end = True

    try:
        # Check if users already seeded
        if db.query(User).first():
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
    finally:
        if close_db_at_end:
            db.close()

if __name__ == "__main__":
    init_db()
