import pytest
import smtplib
from unittest.mock import MagicMock, patch
from app.services.email import (
    send_email,
    send_otp_email,
    send_password_reset_email,
    send_suspicious_login_alert,
    verify_smtp_connection,
)
from app.core.config import settings

def test_smtp_delivery_success_starttls():
    """Verifies successful SMTP delivery with STARTTLS on port 587."""
    with patch("smtplib.SMTP") as mock_smtp_class:
        mock_server = MagicMock()
        mock_server.sendmail.return_value = {}  # Empty dict means all recipients accepted
        mock_smtp_class.return_value = mock_server
        mock_server.__enter__.return_value = mock_server

        orig_host = settings.SMTP_HOST
        orig_port = settings.SMTP_PORT
        orig_user = settings.SMTP_USER
        orig_pwd = settings.SMTP_PASSWORD

        try:
            settings.SMTP_HOST = "smtp.mailgun.org"
            settings.SMTP_PORT = 587
            settings.SMTP_USER = "postmaster@brandguard.ai"
            settings.SMTP_PASSWORD = "secret_password"

            success, msg = send_otp_email("test@example.com", "123456", "Test User")

            assert success is True
            assert "dispatched" in msg.lower() or "delivered" in msg.lower()
            mock_smtp_class.assert_called_once_with("smtp.mailgun.org", 587, timeout=15)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("postmaster@brandguard.ai", "secret_password")
            assert mock_server.sendmail.called
            args, _ = mock_server.sendmail.call_args
            assert args[0] == settings.SMTP_FROM_EMAIL
            assert args[1] == ["test@example.com"]
            assert "123456" in args[2]
            assert "Message-ID" in args[2]
            assert "Date" in args[2]
        finally:
            settings.SMTP_HOST = orig_host
            settings.SMTP_PORT = orig_port
            settings.SMTP_USER = orig_user
            settings.SMTP_PASSWORD = orig_pwd


def test_smtp_delivery_success_ssl_port_465():
    """Verifies that port 465 automatically switches to SMTP_SSL."""
    with patch("smtplib.SMTP_SSL") as mock_ssl_class:
        mock_server = MagicMock()
        mock_server.sendmail.return_value = {}
        mock_ssl_class.return_value = mock_server
        mock_server.__enter__.return_value = mock_server

        orig_host = settings.SMTP_HOST
        orig_port = settings.SMTP_PORT

        try:
            settings.SMTP_HOST = "smtp.gmail.com"
            settings.SMTP_PORT = 465

            success, msg = send_email("alice@example.com", "Subject", "<h1>Test</h1>", "Test")

            assert success is True
            mock_ssl_class.assert_called_once_with("smtp.gmail.com", 465, timeout=15)
            assert mock_server.sendmail.called
        finally:
            settings.SMTP_HOST = orig_host
            settings.SMTP_PORT = orig_port


def test_smtp_invalid_credentials_returns_failure_without_leak():
    """Verifies that authentication errors return failure without exposing password."""
    with patch("smtplib.SMTP") as mock_smtp_class:
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"Authentication credentials invalid")
        mock_smtp_class.return_value = mock_server
        mock_server.__enter__.return_value = mock_server

        orig_host = settings.SMTP_HOST
        orig_user = settings.SMTP_USER
        orig_pwd = settings.SMTP_PASSWORD

        try:
            settings.SMTP_HOST = "smtp.example.com"
            settings.SMTP_USER = "user@example.com"
            settings.SMTP_PASSWORD = "super_secret_password_123"

            success, msg = send_otp_email("recipient@example.com", "654321")

            assert success is False
            assert "authentication failed" in msg.lower()
            assert "super_secret_password_123" not in msg
        finally:
            settings.SMTP_HOST = orig_host
            settings.SMTP_USER = orig_user
            settings.SMTP_PASSWORD = orig_pwd


def test_smtp_server_unavailable_returns_failure():
    """Verifies that connection failure to an unavailable server is handled cleanly."""
    with patch("smtplib.SMTP") as mock_smtp_class:
        mock_smtp_class.side_effect = smtplib.SMTPConnectError(421, b"Connection refused")

        orig_host = settings.SMTP_HOST
        try:
            settings.SMTP_HOST = "unreachable.smtp.host"
            success, msg = send_email("target@example.com", "Subject", "<h1>Body</h1>")

            assert success is False
            assert "connect" in msg.lower()
        finally:
            settings.SMTP_HOST = orig_host


def test_production_fails_when_smtp_unconfigured():
    """Ensures production environment never silently succeeds when SMTP is unconfigured."""
    orig_env = settings.ENVIRONMENT
    orig_host = settings.SMTP_HOST
    try:
        settings.ENVIRONMENT = "production"
        settings.SMTP_HOST = None

        success, msg = send_otp_email("prod_user@example.com", "999888")

        assert success is False
        assert "not configured" in msg.lower()
    finally:
        settings.ENVIRONMENT = orig_env
        settings.SMTP_HOST = orig_host


def test_password_recovery_email_content():
    """Verifies password reset email includes token, reset url, and proper MIME headers."""
    with patch("smtplib.SMTP") as mock_smtp_class:
        mock_server = MagicMock()
        mock_server.sendmail.return_value = {}
        mock_smtp_class.return_value = mock_server
        mock_server.__enter__.return_value = mock_server

        orig_host = settings.SMTP_HOST
        try:
            settings.SMTP_HOST = "smtp.sendgrid.net"
            token = "secure_reset_token_xyz"
            success, _ = send_password_reset_email("recovery@example.com", token, "Recovery User")

            assert success is True
            args, _ = mock_server.sendmail.call_args
            raw_msg = args[2]
            import email
            parsed_msg = email.message_from_string(raw_msg)
            payloads = [
                part.get_payload(decode=True).decode("utf-8")
                for part in parsed_msg.walk()
                if part.get_content_type() in ("text/plain", "text/html")
            ]
            combined_body = "\n".join(payloads)
            assert "reset-password?token=secure_reset_token_xyz" in combined_body
            assert "secure_reset_token_xyz" in combined_body
            assert "Recovery User" in combined_body
        finally:
            settings.SMTP_HOST = orig_host


def test_verify_smtp_connection_diagnostics():
    """Tests the SMTP connectivity diagnostics tool."""
    # 1. Unconfigured state
    orig_host = settings.SMTP_HOST
    try:
        settings.SMTP_HOST = None
        status = verify_smtp_connection()
        assert status["configured"] is False
        assert status["status"] == "unconfigured"

        # 2. Configured and connected state
        with patch("smtplib.SMTP") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server
            settings.SMTP_HOST = "smtp.example.com"
            settings.SMTP_PORT = 587

            status = verify_smtp_connection()
            assert status["configured"] is True
            assert status["status"] == "connected"
    finally:
        settings.SMTP_HOST = orig_host


def test_registration_fails_cleanly_when_smtp_fails_in_production(client, db):
    """
    In production mode, if SMTP delivery fails during user registration,
    the API must return HTTP 502, explain the failure, and not leave an orphaned user.
    """
    from app.models.user import User

    test_email = "prod_fail_user@example.com"
    orig_env = settings.ENVIRONMENT
    orig_host = settings.SMTP_HOST

    try:
        settings.ENVIRONMENT = "production"
        settings.SMTP_HOST = "smtp.mockserver.com"

        with patch("smtplib.SMTP") as mock_smtp:
            mock_smtp.side_effect = smtplib.SMTPConnectError(421, b"Connection refused")

            res = client.post("/api/v1/auth/register", json={
                "email": test_email,
                "full_name": "Prod Fail User",
                "password": "StrongPassword@2026",
                "role": "CREATOR"
            })

            assert res.status_code == 502
            assert "verification email delivery failed" in res.json()["detail"].lower()

            # Ensure user was not left orphaned in database
            user = db.query(User).filter(User.email == test_email).first()
            assert user is None
    finally:
        settings.ENVIRONMENT = orig_env
        settings.SMTP_HOST = orig_host


def test_resend_otp_fails_cleanly_when_smtp_fails_in_production(client, db):
    """
    In production mode, resending OTP must return HTTP 502 when SMTP is unreachable.
    """
    from app.models.user import User
    from app.models.enums import UserRole
    from app.core.security import get_password_hash

    test_email = "resend_prod_user@example.com"
    user = User(
        email=test_email,
        full_name="Resend Prod User",
        hashed_password=get_password_hash("StrongPassword@2026"),
        role=UserRole.CREATOR,
        is_verified=False
    )
    db.add(user)
    db.commit()

    orig_env = settings.ENVIRONMENT
    orig_host = settings.SMTP_HOST

    try:
        settings.ENVIRONMENT = "production"
        settings.SMTP_HOST = "smtp.mockserver.com"

        with patch("smtplib.SMTP") as mock_smtp:
            mock_smtp.side_effect = smtplib.SMTPConnectError(421, b"Connection refused")

            res = client.post("/api/v1/auth/resend-otp", json={"email": test_email})
            assert res.status_code == 502
            assert "verification email delivery failed" in res.json()["detail"].lower()
    finally:
        settings.ENVIRONMENT = orig_env
        settings.SMTP_HOST = orig_host
        db.delete(user)
        db.commit()

