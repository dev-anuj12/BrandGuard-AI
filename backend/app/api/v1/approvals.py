from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.content import Content
from app.models.workflow import Approval, ReviewerAssignment, Comment
from app.models.enums import ContentStatus, UserRole, ApprovalAction
from app.schemas.workflow import (
    ApprovalDecision, ApprovalOut,
    ReviewerVerificationDecision, ReviewerAssignmentOut,
    CommentCreate, CommentOut, AuditLogOut
)
from app.models.user import User
from app.models.audit import AuditLog
from app.api.deps import get_current_user, require_roles, get_current_org
from app.services import workflow

router = APIRouter(prefix="/approvals", tags=["Human Approval Workflow"])

# 1. Reviewer Verification (Reviewer Role)
@router.post("/verify/{content_id}", response_model=ContentStatus)
def verify_content(
    content_id: int,
    decision: ReviewerVerificationDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.REVIEWER, UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    content = db.query(Content).filter(Content.id == content_id, Content.organization == org).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    # Delegate validation, transitions, reason requirements and audit logging to workflow engine
    workflow.execute_transition(
        db=db,
        content=content,
        user=current_user,
        action=decision.action,
        reason=decision.comments
    )

    # Record assignment completion
    assignment = db.query(ReviewerAssignment).filter(
        ReviewerAssignment.content_id == content_id,
        ReviewerAssignment.reviewer_id == current_user.id
    ).first()
    if not assignment:
        assignment = ReviewerAssignment(
            content_id=content_id,
            reviewer_id=current_user.id,
            status=decision.action.capitalize(),
            completed_at=datetime.now(timezone.utc)
        )
        db.add(assignment)
    else:
        assignment.status = decision.action.capitalize()
        assignment.completed_at = datetime.now(timezone.utc)

    # Add comment if provided
    if decision.comments:
        c_obj = Comment(
            content_id=content_id,
            user_id=current_user.id,
            comment_text=f"[Verification Note] {decision.comments}"
        )
        db.add(c_obj)
    db.commit()

    return content.status

# 2. Manager Final Approval (Manager Role)
@router.post("/decision/{content_id}", response_model=ApprovalOut)
def manager_decision(
    content_id: int,
    decision: ApprovalDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    content = db.query(Content).filter(Content.id == content_id, Content.organization == org).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    action_map = {
        ApprovalAction.APPROVED: "approve",
        ApprovalAction.REJECTED: "reject",
        ApprovalAction.CHANGES_REQUESTED: "request_changes",
    }
    action_str = action_map.get(decision.action, str(decision.action.value))

    # Delegate state transition, reason check, optimistic locking, and audit log to workflow engine
    workflow.execute_transition(
        db=db,
        content=content,
        user=current_user,
        action=action_str,
        reason=decision.comments
    )

    approval = Approval(
        content_id=content_id,
        manager_id=current_user.id,
        action=decision.action,
        comments=decision.comments
    )
    db.add(approval)

    if decision.comments:
        c_obj = Comment(
            content_id=content_id,
            user_id=current_user.id,
            comment_text=f"[Manager Decision: {decision.action.value}] {decision.comments}"
        )
        db.add(c_obj)

    db.commit()
    db.refresh(approval)

    app_out = ApprovalOut.model_validate(approval)
    app_out.manager_name = current_user.full_name
    return app_out

# 3. Content Comments
@router.get("/{content_id}/comments", response_model=List[CommentOut])
def get_content_comments(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    content = db.query(Content).filter(Content.id == content_id, Content.organization == org).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    comments = db.query(Comment).filter(Comment.content_id == content_id).order_by(Comment.created_at.asc()).all()
    out = []
    for c in comments:
        c_out = CommentOut.model_validate(c)
        if c.author:
            c_out.user_name = c.author.full_name
            c_out.user_role = c.author.role.value
        out.append(c_out)
    return out

@router.post("/{content_id}/comments", response_model=CommentOut)
def add_comment(
    content_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    content = db.query(Content).filter(Content.id == content_id, Content.organization == org).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    comment = Comment(
        content_id=content_id,
        user_id=current_user.id,
        comment_text=comment_in.comment_text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    c_out = CommentOut.model_validate(comment)
    c_out.user_name = current_user.full_name
    c_out.user_role = current_user.role.value
    return c_out

# 4. Audit Logs (Admin & Manager)
@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER])),
    org: str = Depends(get_current_org)
):
    logs = (
        db.query(AuditLog)
        .filter((AuditLog.organization == org) | (AuditLog.organization == None))
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    results = []
    for l in logs:
        l_out = AuditLogOut.model_validate(l)
        if l.user:
            l_out.user_email = l.user.email
        results.append(l_out)
    return results

@router.get("/notifications")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    """
    Returns recent workflow/audit events (flagged, approved, rejected, change requested)
    for the current user's organization.
    """
    target_actions = [
        "WORKFLOW_APPROVE",
        "WORKFLOW_REJECT",
        "WORKFLOW_REQUEST_CHANGES",
        "AI_REVIEW_TRIGGERED",
        "CONTENT_SUBMITTED"
    ]
    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.organization == org,
            AuditLog.action.in_(target_actions)
        )
        .order_by(AuditLog.id.desc())
        .limit(20)
        .all()
    )
    notifications = []
    for log in logs:
        action_type = "flagged"
        if "APPROVE" in log.action:
            action_type = "approved"
        elif "REJECT" in log.action:
            action_type = "rejected"
        elif "CHANGES" in log.action:
            action_type = "change_requested"
        elif "REVIEW" in log.action or "SUBMIT" in log.action:
            action_type = "flagged"

        notifications.append({
            "id": log.id,
            "type": action_type,
            "action": log.action,
            "details": log.details or f"Action {log.action} on Content #{log.entity_id}",
            "entity_id": log.entity_id,
            "entity_type": log.entity_type,
            "created_at": log.created_at.isoformat() if log.created_at else None
        })
    return notifications


