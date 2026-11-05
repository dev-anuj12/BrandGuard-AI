from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.content import Content, ContentRevision
from app.models.enums import ContentStatus, UserRole
from app.models.user import User
from app.models.review import AIReview
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut, ContentRevisionOut
from app.api.deps import get_current_user
from app.models.audit import AuditLog
from app.ai_engine.review_pipeline import AIReviewPipeline

router = APIRouter(prefix="/content", tags=["Content"])

@router.post("/", response_model=ContentOut, status_code=status.HTTP_201_CREATED)
async def submit_content(
    content_in: ContentCreate,
    auto_review: bool = Query(True, description="Automatically trigger AI review on submission"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create content record
    initial_status = ContentStatus.SUBMITTED if auto_review else ContentStatus.DRAFT
    content = Content(
        title=content_in.title,
        original_body=content_in.original_body,
        current_body=content_in.original_body,
        channel=content_in.channel,
        target_audience=content_in.target_audience,
        status=initial_status,
        creator_id=current_user.id
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    # Create Initial Revision 1 (never overwrite original history)
    rev1 = ContentRevision(
        content_id=content.id,
        version=1,
        body=content_in.original_body,
        revised_by_id=current_user.id,
        change_summary="Initial submission by creator"
    )
    db.add(rev1)
    db.commit()
    db.refresh(rev1)

    # Record Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="CONTENT_CREATED",
        entity_type="Content",
        entity_id=content.id,
        details=f"Created content draft '{content.title}'"
    )
    db.add(audit)
    db.commit()

    # Automatically trigger AI Review if requested
    if auto_review:
        pipeline = AIReviewPipeline(db)
        review_result = await pipeline.execute_review(content.current_body)

        review = AIReview(
            content_id=content.id,
            revision_id=rev1.id,
            overall_score=review_result["overall_score"],
            overall_status=review_result["overall_status"],
            summary=review_result["summary"],
            provider=review_result["provider"]
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        # Store Findings and Suggestions
        from app.models.review import Finding, Suggestion
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
                    status="Pending"
                )
                db.add(sugg)
        db.commit()

        # Update Content Status
        content.status = ContentStatus.AI_REVIEW_COMPLETED
        db.commit()
        db.refresh(content)

    c_out = ContentOut.model_validate(content)
    c_out.creator_name = current_user.full_name
    c_out.revisions_count = 1
    return c_out

@router.get("/", response_model=List[ContentOut])
def list_content(
    status_filter: Optional[ContentStatus] = None,
    channel_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Content)

    # Creators only see their own content by default, unless Admin/Manager/Reviewer
    if current_user.role == UserRole.CREATOR:
        query = query.filter(Content.creator_id == current_user.id)

    if status_filter:
        query = query.filter(Content.status == status_filter)
    if channel_filter:
        query = query.filter(Content.channel == channel_filter)

    contents = query.order_by(Content.updated_at.desc()).all()
    results = []
    for c in contents:
        c_out = ContentOut.model_validate(c)
        if c.creator:
            c_out.creator_name = c.creator.full_name
        c_out.revisions_count = len(c.revisions)
        latest_rev = db.query(AIReview).filter(AIReview.content_id == c.id).order_by(AIReview.id.desc()).first()
        if latest_rev:
            c_out.latest_score = latest_rev.overall_score
            c_out.latest_review_id = latest_rev.id
        results.append(c_out)
    return results

@router.get("/{content_id}", response_model=ContentOut)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Creator permission check
    if current_user.role == UserRole.CREATOR and c.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")

    c_out = ContentOut.model_validate(c)
    if c.creator:
        c_out.creator_name = c.creator.full_name
    c_out.revisions_count = len(c.revisions)
    latest_rev = db.query(AIReview).filter(AIReview.content_id == c.id).order_by(AIReview.id.desc()).first()
    if latest_rev:
        c_out.latest_score = latest_rev.overall_score
        c_out.latest_review_id = latest_rev.id
    return c_out

@router.get("/{content_id}/revisions", response_model=List[ContentRevisionOut])
def get_content_revisions(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")
    return db.query(ContentRevision).filter(ContentRevision.content_id == content_id).order_by(ContentRevision.version.desc()).all()

@router.put("/{content_id}", response_model=ContentOut)
async def revise_content(
    content_id: int,
    update_in: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if current_user.role == UserRole.CREATOR and c.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this content")

    # Increment revision version
    max_v = db.query(ContentRevision.version).filter(ContentRevision.content_id == content_id).order_by(ContentRevision.version.desc()).first()
    next_version = (max_v[0] + 1) if max_v else 2

    # Update current body
    if update_in.title:
        c.title = update_in.title
    if update_in.current_body:
        c.current_body = update_in.current_body
    if update_in.channel:
        c.channel = update_in.channel
    if update_in.target_audience:
        c.target_audience = update_in.target_audience

    c.status = ContentStatus.RESUBMITTED
    db.commit()

    # Save new revision
    new_rev = ContentRevision(
        content_id=c.id,
        version=next_version,
        body=c.current_body,
        revised_by_id=current_user.id,
        change_summary=update_in.change_summary or f"Revision v{next_version} applied by {current_user.full_name}"
    )
    db.add(new_rev)
    db.commit()
    db.refresh(new_rev)

    # Re-run AI Review Pipeline automatically for the revision
    pipeline = AIReviewPipeline(db)
    review_result = await pipeline.execute_review(c.current_body)

    review = AIReview(
        content_id=c.id,
        revision_id=new_rev.id,
        overall_score=review_result["overall_score"],
        overall_status=review_result["overall_status"],
        summary=review_result["summary"],
        provider=review_result["provider"]
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    from app.models.review import Finding, Suggestion
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
                status="Pending"
            )
            db.add(sugg)
    db.commit()

    c.status = ContentStatus.AI_REVIEW_COMPLETED if review_result["overall_score"] < 90 else ContentStatus.PENDING_REVIEWER_VERIFICATION
    db.commit()
    db.refresh(c)

    # Record Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="CONTENT_REVISED",
        entity_type="Content",
        entity_id=c.id,
        details=f"Created revision v{next_version} for '{c.title}' (Compliance Score: {review_result['overall_score']}%)"
    )
    db.add(audit)
    db.commit()

    c_out = ContentOut.model_validate(c)
    if c.creator:
        c_out.creator_name = c.creator.full_name
    c_out.revisions_count = next_version
    c_out.latest_score = review.overall_score
    c_out.latest_review_id = review.id
    return c_out
