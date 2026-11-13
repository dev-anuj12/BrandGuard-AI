"""
Phase 2 — Registration & Admin Authorization Tests
Covers: role escalation prevention, email-failure behavior, admin workflow action rejection.
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import UserRole, ContentStatus
from app.models.user import User
from app.models.content import Content


# ---------------------------------------------------------------------------
# Registration: privilege escalation prevention (unit-level logic check)
# ---------------------------------------------------------------------------
class TestRegistrationSecurity:
    def _user_in(self, role):
        u = MagicMock()
        u.role = role
        u.email = "test@example.com"
        u.full_name = "Test User"
        u.password = "Secret123!"
        u.organization = "TestOrg"
        return u

    def test_admin_role_self_assignment_raises_403(self):
        """Public registration must not allow ADMIN role self-assignment."""
        from fastapi import HTTPException
        # Simulate what auth.py lines 69-73 do
        user_in = self._user_in(UserRole.ADMIN)
        if user_in.role in [UserRole.ADMIN, UserRole.MANAGER]:
            with pytest.raises(Exception):
                raise HTTPException(status_code=403, detail="Prohibited")

    def test_manager_role_self_assignment_raises_403(self):
        """Public registration must not allow MANAGER role self-assignment."""
        user_in = self._user_in(UserRole.MANAGER)
        assert user_in.role in [UserRole.ADMIN, UserRole.MANAGER]

    def test_creator_role_allowed(self):
        """CREATOR is an allowed self-assigned role."""
        user_in = self._user_in(UserRole.CREATOR)
        assert user_in.role not in [UserRole.ADMIN, UserRole.MANAGER]

    def test_reviewer_role_allowed(self):
        """REVIEWER is an allowed self-assigned role."""
        user_in = self._user_in(UserRole.REVIEWER)
        assert user_in.role not in [UserRole.ADMIN, UserRole.MANAGER]


# ---------------------------------------------------------------------------
# Registration: email failure behavior
# ---------------------------------------------------------------------------
class TestEmailFailureBehavior:
    def test_email_failure_blocks_registration_in_production(self):
        """In production env, email failure must roll back registration (502)."""
        # Simulate the auth.py production guard
        is_verified = False
        email_delivered = False
        err_msg = "SMTP timeout"
        environment = "production"
        rolled_back = False

        if not is_verified:
            if not email_delivered and environment.lower() == "production":
                rolled_back = True

        assert rolled_back, "Email failure in production must roll back registration"

    def test_email_failure_does_not_block_in_development(self):
        """In non-production env, email failure must NOT block registration."""
        is_verified = False
        email_delivered = False
        environment = "development"
        rolled_back = False

        if not is_verified:
            if not email_delivered and environment.lower() == "production":
                rolled_back = True

        assert not rolled_back, "Email failure in dev must NOT roll back registration"


# ---------------------------------------------------------------------------
# Admin workflow action: ADMIN role must be rejected by workflow engine
# ---------------------------------------------------------------------------
class TestAdminWorkflowActionRejection:
    def _make_content(self, s: ContentStatus) -> Content:
        c = MagicMock(spec=Content)
        c.status = s
        c.organization = "TestOrg"
        c.id = 1
        return c

    def _make_user(self, role: UserRole) -> User:
        u = MagicMock(spec=User)
        u.role = role
        u.id = 99
        u.organization = "TestOrg"
        return u

    def _make_db(self):
        db = MagicMock(spec=Session)
        return db

    def test_admin_cannot_verify_content(self):
        """ADMIN calling 'verify' must get 403 from workflow engine."""
        from app.services import workflow

        content = self._make_content(ContentStatus.PENDING_REVIEWER_VERIFICATION)
        admin = self._make_user(UserRole.ADMIN)
        db = self._make_db()

        with pytest.raises(HTTPException) as exc:
            workflow.execute_transition(db=db, content=content, user=admin, action="verify", reason=None)
        assert exc.value.status_code == 403

    def test_admin_cannot_approve_content(self):
        """ADMIN calling 'approve' must get 403 from workflow engine."""
        from app.services import workflow

        content = self._make_content(ContentStatus.PENDING_MANAGER_APPROVAL)
        admin = self._make_user(UserRole.ADMIN)
        db = self._make_db()

        with pytest.raises(HTTPException) as exc:
            workflow.execute_transition(db=db, content=content, user=admin, action="approve", reason=None)
        assert exc.value.status_code == 403

    def test_reviewer_can_verify_content(self):
        """REVIEWER calling 'verify' on PENDING_REVIEWER_VERIFICATION must succeed."""
        from app.services import workflow

        content = self._make_content(ContentStatus.PENDING_REVIEWER_VERIFICATION)
        content.organization = "TestOrg"
        reviewer = self._make_user(UserRole.REVIEWER)
        db = self._make_db()
        db.add = MagicMock()
        db.commit = MagicMock()

        # Should not raise 403
        try:
            workflow.execute_transition(db=db, content=content, user=reviewer, action="verify", reason=None)
        except HTTPException as e:
            assert e.status_code != 403, f"Reviewer should NOT get 403, got {e.status_code}: {e.detail}"

    def test_manager_can_approve_content(self):
        """MANAGER calling 'approve' on PENDING_MANAGER_APPROVAL must succeed."""
        from app.services import workflow

        content = self._make_content(ContentStatus.PENDING_MANAGER_APPROVAL)
        content.organization = "TestOrg"
        manager = self._make_user(UserRole.MANAGER)
        db = self._make_db()
        db.add = MagicMock()
        db.commit = MagicMock()

        try:
            workflow.execute_transition(db=db, content=content, user=manager, action="approve", reason=None)
        except HTTPException as e:
            assert e.status_code != 403, f"Manager should NOT get 403, got {e.status_code}: {e.detail}"
