from datetime import datetime, timezone
from typing import Dict, Tuple, Optional, Any, Set
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.content import Content, ContentRevision
from app.models.user import User
from app.models.enums import ContentStatus, UserRole
from app.models.audit import AuditLog

# ONE Central Transition Table: (current_status, role, action) -> (new_status, reason_required)
TRANSITION_TABLE: Dict[Tuple[ContentStatus, UserRole, str], Tuple[ContentStatus, bool]] = {
    # Creator actions
    (ContentStatus.DRAFT, UserRole.CREATOR, "submit"): (ContentStatus.PENDING_REVIEWER_VERIFICATION, False),
    (ContentStatus.CHANGES_REQUIRED, UserRole.CREATOR, "resubmit"): (ContentStatus.RESUBMITTED, False),

    # Reviewer verification actions
    (ContentStatus.PENDING_REVIEWER_VERIFICATION, UserRole.REVIEWER, "verify"): (ContentStatus.PENDING_MANAGER_APPROVAL, False),
    (ContentStatus.PENDING_REVIEWER_VERIFICATION, UserRole.REVIEWER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),
    (ContentStatus.SUBMITTED, UserRole.REVIEWER, "verify"): (ContentStatus.PENDING_MANAGER_APPROVAL, False),
    (ContentStatus.SUBMITTED, UserRole.REVIEWER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),
    (ContentStatus.AI_REVIEW_COMPLETED, UserRole.REVIEWER, "verify"): (ContentStatus.PENDING_MANAGER_APPROVAL, False),
    (ContentStatus.AI_REVIEW_COMPLETED, UserRole.REVIEWER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),
    (ContentStatus.RESUBMITTED, UserRole.REVIEWER, "verify"): (ContentStatus.PENDING_MANAGER_APPROVAL, False),
    (ContentStatus.RESUBMITTED, UserRole.REVIEWER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),

    # Manager final sign-off actions
    (ContentStatus.PENDING_MANAGER_APPROVAL, UserRole.MANAGER, "approve"): (ContentStatus.APPROVED, False),
    (ContentStatus.PENDING_MANAGER_APPROVAL, UserRole.MANAGER, "reject"): (ContentStatus.REJECTED, True),
    (ContentStatus.PENDING_MANAGER_APPROVAL, UserRole.MANAGER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),
    (ContentStatus.VERIFIED, UserRole.MANAGER, "approve"): (ContentStatus.APPROVED, False),
    (ContentStatus.VERIFIED, UserRole.MANAGER, "reject"): (ContentStatus.REJECTED, True),
    (ContentStatus.VERIFIED, UserRole.MANAGER, "request_changes"): (ContentStatus.CHANGES_REQUIRED, True),
}

# Role-allowed actions whitelist (enforces unauthorized role -> 403)
# Admin may view and configure but must not bypass transitions unless the table explicitly allows it.
ROLE_ALLOWED_ACTIONS: Dict[UserRole, Set[str]] = {
    UserRole.CREATOR: {"submit", "resubmit"},
    UserRole.REVIEWER: {"verify", "request_changes"},
    UserRole.MANAGER: {"approve", "reject", "request_changes"},
    UserRole.ADMIN: set(),
}

def normalize_action(action: str) -> str:
    """Normalize input action string to canonical representation."""
    norm = action.strip().lower().replace(" ", "_")
    if norm in ("changes_requested", "request_changes"):
        return "request_changes"
    if norm in ("approved", "approve"):
        return "approve"
    if norm in ("rejected", "reject"):
        return "reject"
    if norm in ("verified", "verify"):
        return "verify"
    if norm in ("submitted", "submit"):
        return "submit"
    if norm in ("resubmitted", "resubmit"):
        return "resubmit"
    return norm


def execute_transition(
    db: Session,
    content: Content,
    user: User,
    action: str,
    reason: Optional[str] = None,
    expected_status: Optional[ContentStatus] = None,
    custom_details: Optional[str] = None,
) -> Content:
    """
    Enforces centralized workflow state machine rules, segregation of duties,
    reason requirements, optimistic locking concurrency, and append-only audit logging.
    """
    # 1. Multi-tenant organization isolation (Fail-closed)
    user_org = getattr(user, "organization", None)
    content_org = getattr(content, "organization", None)
    if not user_org or not content_org or str(user_org).strip() != str(content_org).strip():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-organization workflow transition prohibited."
        )

    # 2. Canonicalize role and action
    user_role = user.role if isinstance(user.role, UserRole) else UserRole(user.role)
    norm_action = normalize_action(action)

    # 3. Segregation of Duties:
    # - A creator cannot verify or approve their own content
    if content.creator_id == user.id and norm_action in ("verify", "approve"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Segregation of duties violation: Creator cannot verify or approve their own content."
        )

    # - The reviewer who verified cannot also approve
    if getattr(content, "verified_by_id", None) == user.id and norm_action == "approve":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Segregation of duties violation: The reviewer who verified cannot approve the same content."
        )

    # 4. Role authorization check (unauthorized role -> HTTP 403)
    allowed_actions = ROLE_ALLOWED_ACTIONS.get(user_role, set())
    if norm_action not in allowed_actions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{user_role.value}' is not authorized to perform action '{norm_action}'."
        )

    # 5. Status Transition check against TRANSITION_TABLE
    current_status = content.status if isinstance(content.status, ContentStatus) else ContentStatus(content.status)

    if expected_status and current_status != expected_status:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Content status '{current_status.value}' does not match expected status '{expected_status.value}'."
        )

    transition_key = (current_status, user_role, norm_action)
    if transition_key not in TRANSITION_TABLE:
        # Invalid transition -> HTTP 409
        # (e.g. manager cannot approve unless status is Verified / Pending Manager Approval)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Invalid workflow transition: Cannot perform action '{norm_action}' "
                f"on content with status '{current_status.value}'."
            )
        )

    new_status, reason_required = TRANSITION_TABLE[transition_key]

    # 6. Reason requirement check (min 10 characters for reject, request_changes)
    clean_reason = reason.strip() if reason else ""
    if reason_required:
        if not clean_reason or len(clean_reason) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A reason of at least 10 characters is required for action '{norm_action}'."
            )

    # 7. Fetch latest revision for provenance linkage
    latest_rev = (
        db.query(ContentRevision)
        .filter(ContentRevision.content_id == content.id)
        .order_by(ContentRevision.version.desc())
        .first()
    )
    latest_rev_id = latest_rev.id if latest_rev else None

    # 8. Optimistic Locking Concurrency Check
    current_version = content.version or 1
    update_values: Dict[str, Any] = {
        "status": new_status,
        "version": current_version + 1,
        "updated_at": datetime.now(timezone.utc),
    }

    if norm_action == "verify":
        update_values["verified_by_id"] = user.id
        update_values["verified_revision_id"] = latest_rev_id
    elif norm_action == "approve":
        update_values["approved_by_id"] = user.id
        update_values["approved_revision_id"] = latest_rev_id

    rows_updated = (
        db.query(Content)
        .filter(
            Content.id == content.id,
            Content.version == current_version,
            Content.status == current_status,
        )
        .update(update_values)
    )

    if rows_updated == 0:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Concurrency conflict: Content was updated concurrently by another transaction. Please reload."
        )

    # 9. Append-Only Audit Log
    details = (
        custom_details
        or f"{user.full_name} ({user_role.value}) executed '{norm_action}'. Reason: {clean_reason or 'None'}"
    )
    audit = AuditLog(
        user_id=user.id,
        action=f"WORKFLOW_{norm_action.upper()}",
        entity_type="Content",
        entity_id=content.id,
        previous_state={"status": current_status.value},
        new_state={"status": new_status.value},
        details=details,
        reason=clean_reason or None,
        revision_id=latest_rev_id,
        organization=content.organization,
    )
    db.add(audit)
    db.commit()
    db.refresh(content)
    return content


def mark_verification_stale_on_revision(
    db: Session,
    content: Content,
    user: User,
    new_revision_id: Optional[int] = None,
) -> None:
    """
    When content is revised after reviewer verification, resets status to Resubmitted
    and records an audit event marking earlier verification stale.
    """
    was_verified = (
        getattr(content, "verified_by_id", None) is not None
        or content.status in (ContentStatus.VERIFIED, ContentStatus.PENDING_MANAGER_APPROVAL)
    )
    prev_status = content.status.value if hasattr(content.status, "value") else str(content.status)

    content.status = ContentStatus.RESUBMITTED
    content.verified_by_id = None
    content.verified_revision_id = None
    content.approved_by_id = None
    content.approved_revision_id = None
    content.version = (content.version or 1) + 1
    content.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(content)

    if was_verified:
        audit = AuditLog(
            user_id=user.id,
            action="VERIFICATION_STALE",
            entity_type="Content",
            entity_id=content.id,
            previous_state={"status": prev_status},
            new_state={"status": ContentStatus.RESUBMITTED.value},
            details="Content revised after reviewer verification; earlier verification marked stale and status reset to Resubmitted.",
            organization=content.organization,
            revision_id=new_revision_id,
        )
        db.add(audit)
        db.commit()
