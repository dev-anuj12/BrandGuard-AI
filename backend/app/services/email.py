import smtplib
import logging
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple, Dict, Any
from app.core.config import settings

logger = logging.getLogger("brandguard.email")

# ---------------------------------------------------------------------------
# Internal: Resend HTTP API delivery (works on Render — uses HTTPS port 443)
# ---------------------------------------------------------------------------

def _send_via_resend(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> Tuple[bool, str]:
    """Send email via Resend HTTP API. Never exposes the API key in logs."""
    try:
        import resend  # type: ignore
        resend.api_key = settings.RESEND_API_KEY

        params: Dict[str, Any] = {
            "from": f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        if text_content:
            params["text"] = text_content

        response = resend.Emails.send(params)
        # Resend SDK raises on HTTP errors; reaching here means 2xx accepted
        email_id = getattr(response, "id", None) or (response.get("id") if isinstance(response, dict) else None)
        logger.info(f"Email accepted by Resend for {to_email} (id={email_id})")
        return True, "Email successfully dispatched via Resend."

    except ImportError:
        logger.error("resend package is not installed. Add 'resend>=2.0.0' to requirements.txt.")
        return False, "Email provider library (resend) is not installed."
    except Exception as e:
        # Do NOT log API key; log only the exception type and sanitized message
        err_type = type(e).__name__
        err_msg = str(e)
        # Strip any token-like strings from error message before logging
        if settings.RESEND_API_KEY and settings.RESEND_API_KEY in err_msg:
            err_msg = err_msg.replace(settings.RESEND_API_KEY, "[REDACTED]")
        logger.error(f"Resend delivery error ({err_type}): {err_msg}")
        return False, f"Email delivery error via Resend: {err_type}."


# ---------------------------------------------------------------------------
# Internal: SMTP delivery (fallback when RESEND_API_KEY is not set)
# ---------------------------------------------------------------------------

def _send_via_smtp(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> Tuple[bool, str]:
    """Send email via SMTP. Supports STARTTLS (port 587) and SMTPS (port 465)."""
    if not settings.SMTP_HOST:
        is_production = settings.ENVIRONMENT.lower() == "production"
        if is_production:
            logger.error("Production email delivery failed: SMTP_HOST is not configured.")
            return False, "SMTP server host is not configured in production environment."
        else:
            logger.info(
                f"[EMAIL SERVICE - DEV LOG] To: {to_email} | Subject: {subject}\n"
                f"Content Preview: {text_content or html_content[:200]}..."
            )
            return True, "Development mode: logged to console fallback."

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        domain = settings.SMTP_FROM_EMAIL.split("@")[-1] if "@" in settings.SMTP_FROM_EMAIL else "brandguard.ai"
        msg["Message-ID"] = email.utils.make_msgid(domain=domain)

        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        timeout = getattr(settings, "SMTP_TIMEOUT", 15)
        port = settings.SMTP_PORT
        use_ssl = getattr(settings, "SMTP_USE_SSL", False) or port == 465
        use_tls = getattr(settings, "SMTP_USE_TLS", True) if not use_ssl else False

        if use_ssl:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, port, timeout=timeout)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, port, timeout=timeout)
            if use_tls:
                server.starttls()

        with server:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            refused = server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
            if refused:
                logger.error(f"Recipient {to_email} was rejected by SMTP server: {refused}")
                return False, "Recipient address was rejected by SMTP server."

        logger.info(f"Email successfully delivered to SMTP server for {to_email}")
        return True, "Email successfully dispatched via SMTP."

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP authentication failure for server {settings.SMTP_HOST}: code {e.smtp_code}")
        return False, "SMTP authentication failed. Please verify credentials."
    except smtplib.SMTPConnectError as e:
        logger.error(f"SMTP connection failure to {settings.SMTP_HOST}:{settings.SMTP_PORT}: {str(e)}")
        return False, f"Could not connect to SMTP server at {settings.SMTP_HOST}:{settings.SMTP_PORT}."
    except smtplib.SMTPException as e:
        logger.error(f"SMTP protocol error: {type(e).__name__} - {str(e)}")
        return False, f"SMTP protocol error: {type(e).__name__}."
    except Exception as e:
        logger.error(f"Unexpected email delivery exception: {type(e).__name__} - {str(e)}")
        return False, f"Email delivery error: {type(e).__name__}."


# ---------------------------------------------------------------------------
# Public: unified send_email — Resend if configured, else SMTP
# ---------------------------------------------------------------------------

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Sends email using the best available provider:
      1. Resend HTTP API  — when RESEND_API_KEY is set (recommended for Render)
      2. SMTP             — when SMTP_HOST is set
      3. Dev console log  — development/test only when neither is configured
    Returns (success: bool, status_message: str).
    Never exposes passwords, OTPs, API keys, or secrets.
    """
    if settings.RESEND_API_KEY:
        return _send_via_resend(to_email, subject, html_content, text_content)
    return _send_via_smtp(to_email, subject, html_content, text_content)


# ---------------------------------------------------------------------------
# Public: diagnostics — no test email sent
# ---------------------------------------------------------------------------

def verify_smtp_connection() -> Dict[str, Any]:
    """
    Returns connection/auth status for the configured email provider.
    Does NOT send an email. Never exposes passwords or API keys.
    """
    if settings.RESEND_API_KEY:
        # Validate by listing domains (lightweight API call, no email sent)
        try:
            import resend  # type: ignore
            resend.api_key = settings.RESEND_API_KEY
            # Resend SDK: calling Domains.list() verifies the API key is accepted
            resend.Domains.list()
            return {
                "configured": True,
                "provider": "resend",
                "status": "connected",
                "message": "Resend API key is valid and accepted.",
            }
        except ImportError:
            return {
                "configured": True,
                "provider": "resend",
                "status": "library_missing",
                "message": "resend package is not installed on this server.",
            }
        except Exception as e:
            err_type = type(e).__name__
            return {
                "configured": True,
                "provider": "resend",
                "status": "error",
                "message": f"Resend API key validation failed: {err_type}.",
            }

    if not settings.SMTP_HOST:
        return {
            "configured": False,
            "provider": "none",
            "status": "unconfigured",
            "message": "Neither RESEND_API_KEY nor SMTP_HOST is configured.",
        }

    port = settings.SMTP_PORT
    use_ssl = getattr(settings, "SMTP_USE_SSL", False) or port == 465
    use_tls = getattr(settings, "SMTP_USE_TLS", True) if not use_ssl else False
    timeout = getattr(settings, "SMTP_TIMEOUT", 15)

    try:
        if use_ssl:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, port, timeout=timeout)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, port, timeout=timeout)
            if use_tls:
                server.starttls()

        with server:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.noop()

        return {
            "configured": True,
            "provider": "smtp",
            "host": settings.SMTP_HOST,
            "port": port,
            "use_ssl": use_ssl,
            "use_tls": use_tls,
            "status": "connected",
            "message": "SMTP server connection and authentication successful.",
        }
    except smtplib.SMTPAuthenticationError as e:
        return {
            "configured": True,
            "provider": "smtp",
            "host": settings.SMTP_HOST,
            "port": port,
            "status": "auth_error",
            "message": f"SMTP authentication failed (code {e.smtp_code}).",
        }
    except Exception as e:
        return {
            "configured": True,
            "provider": "smtp",
            "host": settings.SMTP_HOST,
            "port": port,
            "status": "error",
            "message": f"SMTP test failed: {type(e).__name__}.",
        }


# ---------------------------------------------------------------------------
# Public: high-level email helpers (unchanged API)
# ---------------------------------------------------------------------------

def send_otp_email(to_email: str, otp_code: str, full_name: Optional[str] = None) -> Tuple[bool, str]:
    name = full_name or "BrandGuard User"
    subject = f"{otp_code} is your BrandGuard AI verification code"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 24px;">
          <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 700;">BrandGuard AI</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Enterprise Brand Governance &amp; Digital Protection</p>
        </div>

        <h3 style="margin: 0 0 12px; font-size: 18px; color: #1e293b;">Verify your email address</h3>
        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #475569;">
          Hello {name},<br>
          Use the 6-digit verification code below to verify your enterprise account:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1e1b4b;">
            {otp_code}
          </div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">This code expires in 5 minutes.</p>
        </div>

        <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
    """

    text = f"Hello {name},\n\nYour BrandGuard AI verification code is: {otp_code}\nThis code expires in 5 minutes.\n\nIf you did not request this, please ignore."
    return send_email(to_email, subject, html, text)


def send_password_reset_email(to_email: str, reset_token: str, full_name: Optional[str] = None) -> Tuple[bool, str]:
    name = full_name or "BrandGuard User"
    subject = "Reset your BrandGuard AI password"
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 24px;">
          <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 700;">BrandGuard AI</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Enterprise Security</p>
        </div>

        <h3 style="margin: 0 0 12px; font-size: 18px; color: #1e293b;">Password Reset Request</h3>
        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #475569;">
          Hello {name},<br>
          We received a request to reset the master password for your BrandGuard AI account. Click the button below to set a new password:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="{reset_url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
            This single-use link expires in 15 minutes.
          </p>
        </div>

        <p style="margin: 16px 0; font-size: 12px; color: #64748b; word-break: break-all;">
          Or copy your reset token directly into the portal: <code style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">{reset_token}</code>
        </p>

        <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not request a password reset, please contact your security administrator immediately.
        </p>
      </div>
    </body>
    </html>
    """

    text = f"Hello {name},\n\nA password reset was requested for your account.\nReset link: {reset_url}\nReset token: {reset_token}\nThis token expires in 15 minutes."
    return send_email(to_email, subject, html, text)


def send_suspicious_login_alert(to_email: str, client_ip: str, user_agent: Optional[str] = None) -> Tuple[bool, str]:
    subject = "Security Alert: Suspicious login detected on your BrandGuard account"
    ua = user_agent or "Unknown browser/client"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Security Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #fee2e2; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="margin: 0 0 16px; color: #dc2626; font-size: 20px; font-weight: 700;">Security Alert</h2>
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #475569;">
          A new sign in to your BrandGuard AI account was detected from an unrecognized IP address:
        </p>
        <ul style="font-size: 13px; color: #1e293b; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 20px; margin: 16px 0;">
          <li><strong>IP Address:</strong> {client_ip}</li>
          <li><strong>Client / Device:</strong> {ua}</li>
        </ul>
        <p style="margin: 16px 0 0; font-size: 13px; color: #475569;">
          If this was not you, please log in immediately to revoke active sessions and update your password.
        </p>
      </div>
    </body>
    </html>
    """
    text = f"Security Alert: A login was detected from a new IP: {client_ip} (Client: {ua}). If this wasn't you, sign in and revoke all sessions immediately."
    return send_email(to_email, subject, html, text)
