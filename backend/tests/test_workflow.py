import pytest
from fastapi import HTTPException
from app.models.content import Content, ContentRevision
from app.models.user import User
from app.models.enums import ContentStatus, UserRole
from app.models.audit import AuditLog
from app.services import workflow

def create_test_user(db, email: str, role: UserRole, org: str = "BrandGuard Demo Enterprise") -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing
    user = User(
        email=email,
        full_name=f"Test {role.value}",
        hashed_password="hashed_pw_dummy",
        role=role,
        organization=org
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_content(db, creator: User, status: ContentStatus, verified_by: User = None) -> Content:
    content = Content(
        title="Workflow Spec Content",
        original_body="Initial marketing copy text for testing workflow transitions.",
        current_body="Initial marketing copy text for testing workflow transitions.",
        channel="Website/Blog",
        target_audience="Retail Investors",
        status=status,
        creator_id=creator.id,
        organization=creator.organization,
        version=1,
        verified_by_id=verified_by.id if verified_by else None
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    rev = ContentRevision(
        content_id=content.id,
        version=1,
        body=content.current_body,
        revised_by_id=creator.id,
        change_summary="Initial revision"
    )
    db.add(rev)
    db.commit()
    return content


# 1. Parameterized Matrix Test: (role, action, status) -> expected outcome
MATRIX_CASES = [
    # Creator valid transitions
    (UserRole.CREATOR, "submit", ContentStatus.DRAFT, "allowed", ContentStatus.PENDING_REVIEWER_VERIFICATION),
    (UserRole.CREATOR, "resubmit", ContentStatus.CHANGES_REQUIRED, "allowed", ContentStatus.RESUBMITTED),
    # Creator invalid status transitions -> 409
    (UserRole.CREATOR, "submit", ContentStatus.PENDING_REVIEWER_VERIFICATION, 409, None),
    (UserRole.CREATOR, "resubmit", ContentStatus.DRAFT, 409, None),
    # Creator unauthorized actions -> 403
    (UserRole.CREATOR, "verify", ContentStatus.PENDING_REVIEWER_VERIFICATION, 403, None),
    (UserRole.CREATOR, "approve", ContentStatus.PENDING_MANAGER_APPROVAL, 403, None),
    (UserRole.CREATOR, "reject", ContentStatus.PENDING_MANAGER_APPROVAL, 403, None),

    # Reviewer valid transitions
    (UserRole.REVIEWER, "verify", ContentStatus.PENDING_REVIEWER_VERIFICATION, "allowed", ContentStatus.PENDING_MANAGER_APPROVAL),
    (UserRole.REVIEWER, "verify", ContentStatus.RESUBMITTED, "allowed", ContentStatus.PENDING_MANAGER_APPROVAL),
    (UserRole.REVIEWER, "request_changes", ContentStatus.PENDING_REVIEWER_VERIFICATION, "allowed", ContentStatus.CHANGES_REQUIRED),
    # Reviewer invalid status transitions -> 409
    (UserRole.REVIEWER, "verify", ContentStatus.DRAFT, 409, None),
    (UserRole.REVIEWER, "verify", ContentStatus.APPROVED, 409, None),
    # Reviewer unauthorized actions -> 403
    (UserRole.REVIEWER, "submit", ContentStatus.DRAFT, 403, None),
    (UserRole.REVIEWER, "approve", ContentStatus.PENDING_MANAGER_APPROVAL, 403, None),
    (UserRole.REVIEWER, "reject", ContentStatus.PENDING_MANAGER_APPROVAL, 403, None),

    # Manager valid transitions
    (UserRole.MANAGER, "approve", ContentStatus.PENDING_MANAGER_APPROVAL, "allowed", ContentStatus.APPROVED),
    (UserRole.MANAGER, "reject", ContentStatus.PENDING_MANAGER_APPROVAL, "allowed", ContentStatus.REJECTED),
    (UserRole.MANAGER, "request_changes", ContentStatus.PENDING_MANAGER_APPROVAL, "allowed", ContentStatus.CHANGES_REQUIRED),
    # Manager invalid status transitions -> 409 (cannot approve from Draft or Changes Required)
    (UserRole.MANAGER, "approve", ContentStatus.DRAFT, 409, None),
    (UserRole.MANAGER, "approve", ContentStatus.CHANGES_REQUIRED, 409, None),
    (UserRole.MANAGER, "approve", ContentStatus.RESUBMITTED, 409, None),
    # Manager unauthorized actions -> 403
    (UserRole.MANAGER, "verify", ContentStatus.PENDING_REVIEWER_VERIFICATION, 403, None),
    (UserRole.MANAGER, "submit", ContentStatus.DRAFT, 403, None),

    # Admin unauthorized for workflow actions (Admin views/configures only) -> 403
    (UserRole.ADMIN, "verify", ContentStatus.PENDING_REVIEWER_VERIFICATION, 403, None),
    (UserRole.ADMIN, "approve", ContentStatus.PENDING_MANAGER_APPROVAL, 403, None),
    (UserRole.ADMIN, "submit", ContentStatus.DRAFT, 403, None),
]

@pytest.mark.parametrize("role,action,status_val,expected_outcome,expected_status", MATRIX_CASES)
def test_workflow_matrix_transitions(db, role, action, status_val, expected_outcome, expected_status):
    creator = create_test_user(db, f"creator_matrix_{role.value.lower()}@test.com", UserRole.CREATOR)
    actor = create_test_user(db, f"actor_{role.value.lower()}_{action}_{status_val.name.lower()}@test.com", role)
    content = create_test_content(db, creator, status_val)

    reason = "Valid justification text exceeding ten chars."

    if expected_outcome == "allowed":
        updated = workflow.execute_transition(db, content, actor, action, reason=reason)
        assert updated.status == expected_status
    elif isinstance(expected_outcome, int):
        with pytest.raises(HTTPException) as exc_info:
            workflow.execute_transition(db, content, actor, action, reason=reason)
        assert exc_info.value.status_code == expected_outcome


# 2. Segregation of Duties: Creator cannot verify or approve own content
def test_creator_cannot_verify_or_approve_own_content(db):
    creator = create_test_user(db, "creator_self@test.com", UserRole.CREATOR)
    content = create_test_content(db, creator, ContentStatus.PENDING_REVIEWER_VERIFICATION)

    # Creator verify own content -> 403
    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content, creator, "verify")
    assert exc_info.value.status_code == 403
    assert "Creator cannot verify or approve" in exc_info.value.detail

    # Creator approve own content -> 403
    content.status = ContentStatus.PENDING_MANAGER_APPROVAL
    db.commit()
    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content, creator, "approve")
    assert exc_info.value.status_code == 403
    assert "Creator cannot verify or approve" in exc_info.value.detail


# 3. Segregation of Duties: Reviewer who verified cannot also approve
def test_reviewer_who_verified_cannot_approve(db):
    creator = create_test_user(db, "creator_sod@test.com", UserRole.CREATOR)
    dual_user = create_test_user(db, "dual_role@test.com", UserRole.MANAGER)
    content = create_test_content(db, creator, ContentStatus.PENDING_MANAGER_APPROVAL, verified_by=dual_user)

    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content, dual_user, "approve")
    assert exc_info.value.status_code == 403
    assert "reviewer who verified cannot approve" in exc_info.value.detail


# 4. Reason requirement: reject and request_changes require minimum 10 characters
def test_reason_requirement_for_reject_and_request_changes(db):
    creator = create_test_user(db, "creator_reason@test.com", UserRole.CREATOR)
    reviewer = create_test_user(db, "reviewer_reason@test.com", UserRole.REVIEWER)
    manager = create_test_user(db, "manager_reason@test.com", UserRole.MANAGER)

    content_rev = create_test_content(db, creator, ContentStatus.PENDING_REVIEWER_VERIFICATION)
    content_mgr = create_test_content(db, creator, ContentStatus.PENDING_MANAGER_APPROVAL)

    # Empty reason on request_changes -> 400
    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content_rev, reviewer, "request_changes", reason="")
    assert exc_info.value.status_code == 400

    # Short reason (< 10 chars) on request_changes -> 400
    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content_rev, reviewer, "request_changes", reason="fix this")
    assert exc_info.value.status_code == 400

    # Valid reason (>= 10 chars) on request_changes -> succeeds
    updated = workflow.execute_transition(
        db, content_rev, reviewer, "request_changes", reason="Disclaimers are missing from paragraph two."
    )
    assert updated.status == ContentStatus.CHANGES_REQUIRED

    # Short reason on reject -> 400
    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content_mgr, manager, "reject", reason="bad")
    assert exc_info.value.status_code == 400

    # Valid reason on reject -> succeeds
    rejected = workflow.execute_transition(
        db, content_mgr, manager, "reject", reason="Non-compliant risk guarantees violate policy."
    )
    assert rejected.status == ContentStatus.REJECTED


# 5. Content revision resets status to Resubmitted and marks verification stale
def test_revision_resets_verified_content_status(db, client):
    # Register creator, reviewer, manager
    res_c = client.post("/api/v1/auth/register", json={
        "email": "rev_reset_creator@test.com", "full_name": "Reset Creator",
        "password": "Password@123", "role": "CREATOR", "organization": "Reset Org"
    })
    token_c = res_c.json()["access_token"]
    headers_c = {"Authorization": f"Bearer {token_c}"}

    res_r = client.post("/api/v1/auth/register", json={
        "email": "rev_reset_reviewer@test.com", "full_name": "Reset Reviewer",
        "password": "Password@123", "role": "REVIEWER", "organization": "Reset Org"
    })
    token_r = res_r.json()["access_token"]
    headers_r = {"Authorization": f"Bearer {token_r}"}

    # Submit content with auto_review=True so initial status is Submitted (ready for reviewer verification)
    res_create = client.post("/api/v1/content/?auto_review=true", headers=headers_c, json={
        "title": "Revision Reset Test", "original_body": "Original text body.",
        "channel": "Website/Blog", "target_audience": "Retail Investors"
    })
    assert res_create.status_code == 201
    cid = res_create.json()["id"]

    # Verify content as reviewer
    res_v = client.post(f"/api/v1/approvals/verify/{cid}", headers=headers_r, json={
        "action": "verify", "comments": "Pre-screen verified."
    })
    assert res_v.status_code == 200
    assert res_v.json() == ContentStatus.PENDING_MANAGER_APPROVAL.value

    # Creator applies a revision
    res_put = client.put(f"/api/v1/content/{cid}", headers=headers_c, json={
        "current_body": "Updated body after verification.",
        "change_summary": "Revised post-verification"
    })
    assert res_put.status_code == 200
    assert res_put.json()["status"] == ContentStatus.RESUBMITTED.value

    # Check decision history includes VERIFICATION_STALE audit entry
    res_dec = client.get(f"/api/v1/content/{cid}/decisions", headers=headers_c)
    assert res_dec.status_code == 200
    actions = [d["action"] for d in res_dec.json()]
    assert "VERIFICATION_STALE" in actions


# 6. Concurrency / Optimistic locking: Conflict returns 409
def test_optimistic_locking_conflict(db):
    creator = create_test_user(db, "creator_opt@test.com", UserRole.CREATOR)
    manager = create_test_user(db, "manager_opt@test.com", UserRole.MANAGER)
    content = create_test_content(db, creator, ContentStatus.PENDING_MANAGER_APPROVAL)

    # Intentionally desynchronize content.version in-memory to trigger optimistic lock conflict
    content.version = 999

    with pytest.raises(HTTPException) as exc_info:
        workflow.execute_transition(db, content, manager, "approve")
    assert exc_info.value.status_code == 409
    assert "Concurrency conflict" in exc_info.value.detail


# 7. Audit log append-only & Admin audit trail endpoint
def test_audit_log_endpoint_admin_only(client):
    # Admin access succeeds
    res_adm_token = client.post("/api/v1/auth/login", json={"email": "admin@brandguard.io", "password": "Admin@123"})
    assert res_adm_token.status_code == 200
    admin_headers = {"Authorization": f"Bearer {res_adm_token.json()['access_token']}"}

    res_audit = client.get("/api/v1/audit?limit=10", headers=admin_headers)
    assert res_audit.status_code == 200
    assert isinstance(res_audit.json(), list)

    # Creator access to /api/v1/audit returns 403
    res_creator_token = client.post("/api/v1/auth/login", json={"email": "creator@brandguard.io", "password": "Creator@123"})
    assert res_creator_token.status_code == 200
    creator_headers = {"Authorization": f"Bearer {res_creator_token.json()['access_token']}"}

    res_forbidden = client.get("/api/v1/audit", headers=creator_headers)
    assert res_forbidden.status_code == 403
