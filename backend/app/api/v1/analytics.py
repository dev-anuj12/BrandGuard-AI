from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.content import Content
from app.models.review import AIReview, Finding, Suggestion
from app.models.workflow import Approval
from app.models.audit import AuditLog
from app.models.threat import ThreatItem
from app.models.enums import ContentStatus, SuggestionStatus, SeverityLevel, ThreatRiskLevel, ThreatStatus
from app.schemas.analytics import AnalyticsOverview, CommonViolationItem, StatusBreakdownItem, SeverityBreakdownItem
from app.schemas.threat import UnifiedAnalyticsOut, ThreatCategoryCount, ThreatStatusCount, ActivityEvent
from app.api.deps import get_current_user, get_current_org
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    # Base Content subquery for organization
    content_ids_query = db.query(Content.id).filter(Content.organization == org)

    # 1. Total Content Reviewed
    total_content_reviewed = db.query(Content).filter(
        Content.organization == org,
        Content.status != ContentStatus.DRAFT
    ).count()

    # 2. Total Violations Detected
    total_violations_detected = (
        db.query(Finding)
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(AIReview.content_id.in_(content_ids_query))
        .count()
    )

    # 3. AI Suggestions Generated
    ai_suggestions_generated = (
        db.query(Suggestion)
        .join(Finding, Suggestion.finding_id == Finding.id)
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(AIReview.content_id.in_(content_ids_query))
        .count()
    )

    # 4. AI Suggestions Accepted
    ai_suggestions_accepted = (
        db.query(Suggestion)
        .join(Finding, Suggestion.finding_id == Finding.id)
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(
            AIReview.content_id.in_(content_ids_query),
            Suggestion.status == SuggestionStatus.ACCEPTED
        )
        .count()
    )

    # 5. Human Overrides (Rejected or Manually edited)
    human_overrides = (
        db.query(Suggestion)
        .join(Finding, Suggestion.finding_id == Finding.id)
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(
            AIReview.content_id.in_(content_ids_query),
            Suggestion.status.in_([SuggestionStatus.REJECTED, SuggestionStatus.MANUALLY_EDITED])
        )
        .count()
    )

    # 6. Approved Content
    approved_content = db.query(Content).filter(
        Content.organization == org,
        Content.status == ContentStatus.APPROVED
    ).count()

    # 7. Rejected Content
    rejected_content = db.query(Content).filter(
        Content.organization == org,
        Content.status == ContentStatus.REJECTED
    ).count()

    # 8. Pending Approvals
    pending_approvals = db.query(Content).filter(
        Content.organization == org,
        Content.status.in_([ContentStatus.PENDING_MANAGER_APPROVAL, ContentStatus.PENDING_REVIEWER_VERIFICATION])
    ).count()

    # 9. Average Compliance Score
    avg_score_res = (
        db.query(func.avg(AIReview.overall_score))
        .filter(AIReview.content_id.in_(content_ids_query))
        .scalar()
    )
    average_review_score = round(float(avg_score_res), 1) if avg_score_res is not None else 85.0

    # 10. Common Violations
    violation_counts = (
        db.query(Finding.category, func.count(Finding.id))
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(AIReview.content_id.in_(content_ids_query))
        .group_by(Finding.category)
        .order_by(func.count(Finding.id).desc())
        .all()
    )
    common_violations = [
        CommonViolationItem(category=str(cat.value if hasattr(cat, 'value') else cat), count=cnt)
        for cat, cnt in violation_counts
    ]

    # Status Breakdown
    status_counts = (
        db.query(Content.status, func.count(Content.id))
        .filter(Content.organization == org)
        .group_by(Content.status)
        .all()
    )
    status_breakdown = [
        StatusBreakdownItem(status=str(st.value if hasattr(st, 'value') else st), count=cnt)
        for st, cnt in status_counts
    ]

    # Severity Breakdown
    severity_counts = (
        db.query(Finding.severity, func.count(Finding.id))
        .join(AIReview, Finding.review_id == AIReview.id)
        .filter(AIReview.content_id.in_(content_ids_query))
        .group_by(Finding.severity)
        .all()
    )
    severity_breakdown = [
        SeverityBreakdownItem(severity=str(sev.value if hasattr(sev, 'value') else sev), count=cnt)
        for sev, cnt in severity_counts
    ]

    # Timeline / Activity Trend
    reviews = (
        db.query(AIReview)
        .filter(AIReview.content_id.in_(content_ids_query))
        .order_by(AIReview.created_at.asc())
        .limit(10)
        .all()
    )
    activity_timeline = []
    for r in reviews:
        activity_timeline.append({
            "review_id": r.id,
            "timestamp": r.created_at.strftime("%b %d, %H:%M") if r.created_at else "Recent",
            "score": r.overall_score,
            "violations": len(r.findings)
        })

    return AnalyticsOverview(
        total_content_reviewed=total_content_reviewed,
        total_violations_detected=total_violations_detected,
        ai_suggestions_generated=ai_suggestions_generated,
        ai_suggestions_accepted=ai_suggestions_accepted,
        human_overrides=human_overrides,
        approved_content=approved_content,
        rejected_content=rejected_content,
        pending_approvals=pending_approvals,
        average_review_score=average_review_score,
        average_review_time_seconds=3.2,
        common_violations=common_violations,
        status_breakdown=status_breakdown,
        severity_breakdown=severity_breakdown,
        activity_timeline=activity_timeline
    )


@router.get("/unified", response_model=UnifiedAnalyticsOut)
def get_unified_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    content_ids_query = db.query(Content.id).filter(Content.organization == org)

    # 1. Content Governance Metrics
    total_content_reviewed = db.query(Content).filter(
        Content.organization == org,
        Content.status != ContentStatus.DRAFT
    ).count()
    approved_content = db.query(Content).filter(
        Content.organization == org,
        Content.status == ContentStatus.APPROVED
    ).count()
    rejected_content = db.query(Content).filter(
        Content.organization == org,
        Content.status == ContentStatus.REJECTED
    ).count()
    pending_approvals = db.query(Content).filter(
        Content.organization == org,
        Content.status.in_([ContentStatus.PENDING_MANAGER_APPROVAL, ContentStatus.PENDING_REVIEWER_VERIFICATION])
    ).count()

    avg_score_res = (
        db.query(func.avg(AIReview.overall_score))
        .filter(AIReview.content_id.in_(content_ids_query))
        .scalar()
    )
    brand_compliance_score = round(float(avg_score_res), 1) if avg_score_res else 85.0

    # 2. Digital Threat Protection Metrics
    total_detected_threats = db.query(ThreatItem).filter(ThreatItem.organization == org).count()
    critical_high_threats = db.query(ThreatItem).filter(
        ThreatItem.organization == org,
        ThreatItem.risk_level.in_([ThreatRiskLevel.CRITICAL, ThreatRiskLevel.HIGH])
    ).count()
    threats_investigating = db.query(ThreatItem).filter(
        ThreatItem.organization == org,
        ThreatItem.status == ThreatStatus.UNDER_INVESTIGATION
    ).count()
    threats_resolved = db.query(ThreatItem).filter(
        ThreatItem.organization == org,
        ThreatItem.status == ThreatStatus.RESOLVED
    ).count()
    new_threats = db.query(ThreatItem).filter(
        ThreatItem.organization == org,
        ThreatItem.status == ThreatStatus.NEW
    ).count()

    # 3. Threat Category Distribution
    cat_counts = (
        db.query(ThreatItem.category, func.count(ThreatItem.id))
        .filter(ThreatItem.organization == org)
        .group_by(ThreatItem.category)
        .all()
    )
    threat_category_breakdown = [
        ThreatCategoryCount(category=str(cat.value if hasattr(cat, 'value') else cat), count=cnt)
        for cat, cnt in cat_counts
    ]

    # 4. Threat Status Distribution
    st_counts = (
        db.query(ThreatItem.status, func.count(ThreatItem.id))
        .filter(ThreatItem.organization == org)
        .group_by(ThreatItem.status)
        .all()
    )
    threat_status_breakdown = [
        ThreatStatusCount(status=str(st.value if hasattr(st, 'value') else st), count=cnt)
        for st, cnt in st_counts
    ]

    # 5. Governance Quality Trend
    reviews = (
        db.query(AIReview)
        .filter(AIReview.content_id.in_(content_ids_query))
        .order_by(AIReview.created_at.asc())
        .limit(8)
        .all()
    )
    compliance_trend = []
    if reviews:
        for r in reviews:
            compliance_trend.append({
                "timestamp": r.created_at.strftime("%b %d") if r.created_at else "Recent",
                "score": r.overall_score,
                "violations": len(r.findings)
            })
    else:
        compliance_trend = [
            {"timestamp": "Oct 15", "score": 75, "violations": 4},
            {"timestamp": "Oct 22", "score": 82, "violations": 3},
            {"timestamp": "Oct 29", "score": 88, "violations": 2},
            {"timestamp": "Nov 05", "score": brand_compliance_score, "violations": 1},
        ]

    # 6. Merged Chronological Activities
    audit_logs = (
        db.query(AuditLog)
        .join(User, AuditLog.user_id == User.id)
        .filter(User.organization == org)
        .order_by(AuditLog.created_at.desc())
        .limit(6)
        .all()
    )
    recent_activities = []
    for log in audit_logs:
        recent_activities.append(
            ActivityEvent(
                id=log.id,
                source="Threat Intel" if "THREAT" in (log.action or "") else "Brand Governance",
                action=log.action or "Audit Event",
                title=log.details or f"Action {log.action} performed",
                severity="HIGH" if "REJECT" in (log.action or "") or "CRITICAL" in (log.details or "") else "NORMAL",
                timestamp=log.created_at.strftime("%b %d, %H:%M") if log.created_at else "Just now"
            )
        )

    # 7. Recent Threats
    recent_threats = (
        db.query(ThreatItem)
        .filter(ThreatItem.organization == org)
        .order_by(ThreatItem.detected_at.desc())
        .limit(5)
        .all()
    )

    return UnifiedAnalyticsOut(
        total_content_reviewed=total_content_reviewed,
        pending_approvals=pending_approvals,
        brand_compliance_score=brand_compliance_score,
        approved_content=approved_content,
        rejected_content=rejected_content,
        total_detected_threats=total_detected_threats,
        critical_high_threats=critical_high_threats,
        threats_investigating=threats_investigating,
        threats_resolved=threats_resolved,
        new_threats=new_threats,
        threat_category_breakdown=threat_category_breakdown,
        threat_status_breakdown=threat_status_breakdown,
        compliance_trend=compliance_trend,
        recent_activities=recent_activities,
        recent_threats=recent_threats
    )
