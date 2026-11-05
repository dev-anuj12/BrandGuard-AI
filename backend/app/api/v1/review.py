from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.content import Content, ContentRevision
from app.models.review import AIReview, Finding, Suggestion
from app.models.enums import SuggestionStatus, ContentStatus
from app.schemas.review import AIReviewOut, FindingOut, SuggestionAction, SuggestionOut
from app.api.deps import get_current_user
from app.models.user import User
from app.models.audit import AuditLog
from app.ai_engine.review_pipeline import AIReviewPipeline

router = APIRouter(prefix="/review", tags=["AI Review & Suggestions"])

@router.get("/{content_id}/latest", response_model=AIReviewOut)
def get_latest_review(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(AIReview).filter(AIReview.content_id == content_id).order_by(AIReview.id.desc()).first()
    if not review:
        raise HTTPException(status_code=404, detail="No AI review found for this content")
    return review

@router.post("/{content_id}/trigger", response_model=AIReviewOut)
async def trigger_ai_review(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")

    pipeline = AIReviewPipeline(db)
    review_result = await pipeline.execute_review(c.current_body)

    review = AIReview(
        content_id=c.id,
        overall_score=review_result["overall_score"],
        overall_status=review_result["overall_status"],
        summary=review_result["summary"],
        provider=review_result["provider"]
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    for f in review_result["findings"]:
        finding_record = Finding(
            review_id=review.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            explanation=f["explanation"],
            guideline_reference=f.get("guideline_reference"),
            evidence=f.get("evidence", []),
            confidence=f.get("confidence", 0.90),
            suggested_correction=f.get("suggested_correction"),
            status=f.get("status", "Pending"),
            engine_source=f.get("engine_source", "Rule Engine")
        )
        db.add(finding_record)
        db.commit()
        db.refresh(finding_record)

        if f.get("suggested_correction"):
            sugg = Suggestion(
                finding_id=finding_record.id,
                original_text=f["matched_text"],
                suggested_text=f["suggested_correction"],
                reason=f["explanation"],
                status=SuggestionStatus.PENDING
            )
            db.add(sugg)
    db.commit()

    # Update Content Status
    c.status = ContentStatus.AI_REVIEW_COMPLETED
    db.commit()

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="AI_REVIEW_TRIGGERED",
        entity_type="AIReview",
        entity_id=review.id,
        details=f"Ran review for Content #{c.id}. Score: {review.overall_score}%. Findings: {len(review_result['findings'])}"
    )
    db.add(audit)
    db.commit()

    db.refresh(review)
    return review

@router.post("/suggestions/{suggestion_id}/action", response_model=SuggestionOut)
def handle_suggestion_action(
    suggestion_id: int,
    action_in: SuggestionAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sugg = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not sugg:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    finding = db.query(Finding).filter(Finding.id == sugg.finding_id).first()
    review = db.query(AIReview).filter(AIReview.id == finding.review_id).first()
    content = db.query(Content).filter(Content.id == review.content_id).first()

    action_type = action_in.action.lower()

    if action_type == "accept":
        sugg.status = SuggestionStatus.ACCEPTED
        finding.status = "Resolved"
        sugg.applied_at = datetime.now(timezone.utc)

        # Replace matched phrase in current body
        if sugg.original_text in content.current_body:
            content.current_body = content.current_body.replace(sugg.original_text, sugg.suggested_text, 1)
        db.commit()

        audit_msg = f"Accepted suggestion #{sugg.id}: '{sugg.original_text}' -> '{sugg.suggested_text}'"

    elif action_type == "reject":
        sugg.status = SuggestionStatus.REJECTED
        finding.status = "Overridden"
        audit_msg = f"Rejected suggestion #{sugg.id} for '{sugg.original_text}'"

    elif action_type == "manual":
        sugg.status = SuggestionStatus.MANUALLY_EDITED
        finding.status = "Manually Resolved"
        sugg.applied_at = datetime.now(timezone.utc)
        if action_in.custom_text and sugg.original_text in content.current_body:
            content.current_body = content.current_body.replace(sugg.original_text, action_in.custom_text, 1)
        db.commit()

        audit_msg = f"Manually edited suggestion #{sugg.id}: replaced with '{action_in.custom_text}'"

    else:
        raise HTTPException(status_code=400, detail="Invalid action. Choose 'accept', 'reject', or 'manual'.")

    # Record Audit
    audit = AuditLog(
        user_id=current_user.id,
        action=f"SUGGESTION_{action_type.upper()}",
        entity_type="Suggestion",
        entity_id=sugg.id,
        details=audit_msg
    )
    db.add(audit)
    db.commit()
    db.refresh(sugg)
    return sugg
