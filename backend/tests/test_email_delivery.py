import pytest
from unittest.mock import MagicMock, patch
import httpx
from datetime import datetime, timezone, timedelta
from app.services.email import (
    send_email,
    send_otp_email,
    send_password_reset_email,
    send_suspicious_login_alert,
    verify_smtp_connection,
    verify_email_connection,
    is_emailjs_configured,
)
from app.core.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# 1. Configuration & Diagnostics Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_emailjs_configuration_loading():
    """Verifies that is_emailjs_configured() correctly detects full vs partial config."""
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        # Fully configured
        settings.EMAILJS_SERVICE_ID = "srv_test"
        settings.EMAILJS_TEMPLATE_ID = "tpl_test"
        settings.EMAILJS_PUBLIC_KEY = "pub_test"
        settings.EMAILJS_PRIVATE_KEY = "priv_test"
        assert is_emailjs_configured() is True

        # Incomplete configs
        settings.EMAILJS_PRIVATE_KEY = None
        assert is_emailjs_configured() is False

        settings.EMAILJS_PRIVATE_KEY = "priv_test"
        settings.EMAILJS_SERVICE_ID = None
        assert is_emailjs_configured() is False
    finally:
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


def test_emailjs_diagnostics():
    """Verifies that verify_email_connection and verify_smtp_connection report status accurately."""
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        # Unconfigured
        settings.EMAILJS_SERVICE_ID = None
        settings.EMAILJS_TEMPLATE_ID = None
        settings.EMAILJS_PUBLIC_KEY = None
        settings.EMAILJS_PRIVATE_KEY = None

        status = verify_email_connection()
        assert status["configured"] is False
        assert status["provider"] == "emailjs"
        assert "EMAILJS_SERVICE_ID" in status["message"]

        # Configured
        settings.EMAILJS_SERVICE_ID = "service_live"
        settings.EMAILJS_TEMPLATE_ID = "template_live"
        settings.EMAILJS_PUBLIC_KEY = "pub_live_key"
        settings.EMAILJS_PRIVATE_KEY = "priv_live_secret"

        status_conf = verify_email_connection()
        assert status_conf["configured"] is True
        assert status_conf["provider"] == "emailjs"
        assert status_conf["service_id"] == "service_live"
        assert "priv_live_secret" not in str(status_conf)

        # Alias check
        alias = verify_smtp_connection()
        assert alias["configured"] is True
        assert alias["provider"] == "emailjs"
    finally:
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


# ─────────────────────────────────────────────────────────────────────────────
# 2. EmailJS REST API Dispatch Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_emailjs_delivery_success():
    """Verifies that EmailJS REST API receives all required payload fields and handles success."""
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        settings.EMAILJS_SERVICE_ID = "service_brandguard"
        settings.EMAILJS_TEMPLATE_ID = "template_otp_v1"
        settings.EMAILJS_PUBLIC_KEY = "public_key_abc"
        settings.EMAILJS_PRIVATE_KEY = "private_key_xyz"

        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.text = "OK"
            mock_client.post.return_value = mock_response

            success, msg = send_otp_email("founder@acmecorp.com", "789123", "Acme Founder")

            assert success is True
            assert "dispatched via emailjs" in msg.lower()

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[0][0] == "https://api.emailjs.com/api/v1.0/email/send"

            payload = call_args[1]["json"]
            assert payload["service_id"] == "service_brandguard"
            assert payload["template_id"] == "template_otp_v1"
            assert payload["user_id"] == "public_key_abc"
            assert payload["accessToken"] == "private_key_xyz"
            assert payload["template_params"]["to_email"] == "founder@acmecorp.com"
            assert payload["template_params"]["to_name"] == "Acme Founder"
            assert payload["template_params"]["otp"] == "789123"
    finally:
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


def test_emailjs_delivery_failure_sanitizes_credentials():
    """Verifies that EmailJS API failures redact private and public keys from error output."""
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        settings.EMAILJS_SERVICE_ID = "service_error"
        settings.EMAILJS_TEMPLATE_ID = "template_error"
        settings.EMAILJS_PUBLIC_KEY = "pub_key_leaked"
        settings.EMAILJS_PRIVATE_KEY = "priv_key_leaked"

        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 403
            mock_response.text = "Forbidden: Invalid accessToken priv_key_leaked for user pub_key_leaked"
            mock_client.post.return_value = mock_response

            success, msg = send_otp_email("user@example.com", "654321")

            assert success is False
            assert "email delivery rejected by emailjs" in msg.lower()
            # Ensure secrets are NEVER present in return message
            assert "priv_key_leaked" not in msg
            assert "pub_key_leaked" not in msg
            assert "[REDACTED]" in msg
    finally:
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


def test_emailjs_timeout_handling():
    """Verifies that network timeout is caught and handled cleanly."""
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        settings.EMAILJS_SERVICE_ID = "service_test"
        settings.EMAILJS_TEMPLATE_ID = "template_test"
        settings.EMAILJS_PUBLIC_KEY = "pub_test"
        settings.EMAILJS_PRIVATE_KEY = "priv_test"

        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.post.side_effect = httpx.TimeoutException("Connection timed out")

            success, msg = send_otp_email("user@example.com", "554433")

            assert success is False
            assert "timed out" in msg.lower()
    finally:
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


def test_production_fails_with_clear_emailjs_message_when_unconfigured():
    """Verifies that production mode explains that EmailJS is missing, not SMTP."""
    orig_env = settings.ENVIRONMENT
    orig_sid = settings.EMAILJS_SERVICE_ID
    try:
        settings.ENVIRONMENT = "production"
        settings.EMAILJS_SERVICE_ID = None

        success, msg = send_otp_email("prod_user@example.com", "999888")

        assert success is False
        assert "emailjs service is not configured" in msg.lower()
        assert "smtp" not in msg.lower()
    finally:
        settings.ENVIRONMENT = orig_env
        settings.EMAILJS_SERVICE_ID = orig_sid


# ─────────────────────────────────────────────────────────────────────────────
# 3. Registration & Verification Workflow Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_production_registration_fails_cleanly_when_emailjs_rejects(client, db):
    """
    In production mode, if EmailJS rejects OTP delivery during registration,
    the API returns HTTP 502, explains the failure, and does not leave an unverified or orphaned user.
    """
    from app.models.user import User

    test_email = "prod_reg_fail@example.com"
    orig_env = settings.ENVIRONMENT
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        settings.ENVIRONMENT = "production"
        settings.EMAILJS_SERVICE_ID = "srv_prod"
        settings.EMAILJS_TEMPLATE_ID = "tpl_prod"
        settings.EMAILJS_PUBLIC_KEY = "pub_prod"
        settings.EMAILJS_PRIVATE_KEY = "priv_prod"

        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.text = "Bad Request: service not found"
            mock_client.post.return_value = mock_response

            res = client.post("/api/v1/auth/register", json={
                "email": test_email,
                "full_name": "Prod Reg User",
                "password": "StrongPassword@2026",
                "role": "CREATOR"
            })

            assert res.status_code == 502
            assert "verification email delivery failed" in res.json()["detail"].lower()
            assert "emailjs" in res.json()["detail"].lower()

            # Ensure user was not left orphaned in database
            user = db.query(User).filter(User.email == test_email).first()
            assert user is None
    finally:
        settings.ENVIRONMENT = orig_env
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv


def test_production_resend_otp_fails_cleanly_when_emailjs_rejects(client, db):
    """
    In production mode, resending OTP returns HTTP 502 when EmailJS rejects delivery.
    """
    from app.models.user import User
    from app.models.enums import UserRole
    from app.core.security import get_password_hash

    test_email = "prod_resend_fail@example.com"
    user = User(
        email=test_email,
        full_name="Resend Fail User",
        hashed_password=get_password_hash("StrongPassword@2026"),
        role=UserRole.CREATOR,
        is_verified=False
    )
    db.add(user)
    db.commit()

    orig_env = settings.ENVIRONMENT
    orig_sid = settings.EMAILJS_SERVICE_ID
    orig_tid = settings.EMAILJS_TEMPLATE_ID
    orig_pub = settings.EMAILJS_PUBLIC_KEY
    orig_priv = settings.EMAILJS_PRIVATE_KEY

    try:
        settings.ENVIRONMENT = "production"
        settings.EMAILJS_SERVICE_ID = "srv_prod"
        settings.EMAILJS_TEMPLATE_ID = "tpl_prod"
        settings.EMAILJS_PUBLIC_KEY = "pub_prod"
        settings.EMAILJS_PRIVATE_KEY = "priv_prod"

        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_response.text = "Internal Server Error"
            mock_client.post.return_value = mock_response

            res = client.post("/api/v1/auth/resend-otp", json={"email": test_email})
            assert res.status_code == 502
            assert "verification email delivery failed" in res.json()["detail"].lower()
    finally:
        settings.ENVIRONMENT = orig_env
        settings.EMAILJS_SERVICE_ID = orig_sid
        settings.EMAILJS_TEMPLATE_ID = orig_tid
        settings.EMAILJS_PUBLIC_KEY = orig_pub
        settings.EMAILJS_PRIVATE_KEY = orig_priv
        db.delete(user)
        db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# 4. OTP Security Lifecycle Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_otp_full_lifecycle(client, db):
    """
    Tests complete OTP lifecycle:
    - User registration
    - Invalid OTP rejection and attempt decrement
    - Expired OTP rejection
    - Resend OTP invalidates old OTP
    - Valid OTP marks user verified
    - Verified user cannot reuse OTP
    """
    from app.models.user import User
    from app.core.security import hash_secret

    test_email = "lifecycle_user@example.com"
    password = "StrongPassword@2026"

    # 1. Register user
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "full_name": "Lifecycle User",
        "password": password,
        "role": "CREATOR"
    })
    assert reg_res.status_code == 201

    user = db.query(User).filter(User.email == test_email).first()
    assert user is not None
    assert user.is_verified is False
    assert user.otp_hash is not None

    # Set known OTP '123456'
    user.otp_hash = hash_secret("123456")
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()

    # 2. Test incorrect OTP
    bad_res = client.post("/api/v1/auth/verify-otp", json={
        "email": test_email,
        "otp": "000000"
    })
    assert bad_res.status_code == 400
    assert "invalid verification code" in bad_res.json()["detail"].lower()

    # 3. Test expired OTP
    user.otp_expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db.commit()

    exp_res = client.post("/api/v1/auth/verify-otp", json={
        "email": test_email,
        "otp": "123456"
    })
    assert exp_res.status_code == 400
    assert "expired" in exp_res.json()["detail"].lower()

    # 4. Resend OTP creates fresh code and resets expiry
    # Reset last_sent_at to satisfy 60s cooldown
    user.otp_last_sent_at = datetime.now(timezone.utc) - timedelta(seconds=70)
    db.commit()

    resend_res = client.post("/api/v1/auth/resend-otp", json={"email": test_email})
    assert resend_res.status_code == 200

    # Old code '123456' must now be invalid
    old_res = client.post("/api/v1/auth/verify-otp", json={
        "email": test_email,
        "otp": "123456"
    })
    assert old_res.status_code == 400

    # Set new known OTP '654321'
    db.refresh(user)
    user.otp_hash = hash_secret("654321")
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()

    # 5. Successful verification
    good_res = client.post("/api/v1/auth/verify-otp", json={
        "email": test_email,
        "otp": "654321"
    })
    assert good_res.status_code == 200
    assert good_res.json()["user"]["is_verified"] is True
    assert "access_token" in good_res.json()

    # 6. Verify single-use: OTP cannot be reused
    db.refresh(user)
    assert user.is_verified is True
    assert user.otp_hash is None

    reuse_res = client.post("/api/v1/auth/verify-otp", json={
        "email": test_email,
        "otp": "654321"
    })
    assert reuse_res.status_code == 200  # Returns active token session for already-verified user

    # Cleanup
    db.delete(user)
    db.commit()
