import logging
from typing import Optional, Tuple, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("brandguard.email")

# ---------------------------------------------------------------------------
# Helper: EmailJS configuration status
# ---------------------------------------------------------------------------

def is_emailjs_configured() -> bool:
    """Returns True if all required EmailJS REST API credentials are configured."""
    return bool(
        settings.EMAILJS_SERVICE_ID
        and settings.EMAILJS_TEMPLATE_ID
        and settings.EMAILJS_PUBLIC_KEY
        and settings.EMAILJS_PRIVATE_KEY
    )


def is_email_provider_configured() -> bool:
    """Returns True if EmailJS is configured."""
    return is_emailjs_configured()


# ---------------------------------------------------------------------------
# Core: EmailJS REST API delivery (POST https://api.emailjs.com/api/v1.0/email/send)
# ---------------------------------------------------------------------------

def _send_via_emailjs(
    to_email: str,
    template_params: Dict[str, Any],
    template_id: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Send email via EmailJS REST API (POST https://api.emailjs.com/api/v1.0/email/send).
    Never exposes the private key (accessToken) or public key in logs or error messages.
    """
    if not (settings.EMAILJS_SERVICE_ID and settings.EMAILJS_PUBLIC_KEY and settings.EMAILJS_PRIVATE_KEY):
        logger.error("EmailJS credentials incomplete: EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, or EMAILJS_PRIVATE_KEY missing.")
        return False, "EmailJS credentials are not configured in environment."

    active_template_id = template_id or settings.EMAILJS_TEMPLATE_ID
    if not active_template_id:
        logger.error("EmailJS template_id is missing.")
        return False, "EmailJS template ID is not configured."

    # EmailJS REST API required payload parameters:
    # service_id, template_id, user_id (public key), accessToken (private key), template_params
    payload = {
        "service_id": settings.EMAILJS_SERVICE_ID,
        "template_id": active_template_id,
        "user_id": settings.EMAILJS_PUBLIC_KEY,
        "accessToken": settings.EMAILJS_PRIVATE_KEY,
        "template_params": template_params,
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "BrandGuard-AI-Backend/1.0",
    }

    timeout_seconds = getattr(settings, "EMAILJS_TIMEOUT", 15)
    api_url = getattr(settings, "EMAILJS_API_URL", "https://api.emailjs.com/api/v1.0/email/send")

    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.post(api_url, json=payload, headers=headers)

        if response.status_code == 200:
            logger.info(f"Email successfully delivered via EmailJS to {to_email}")
            return True, "Email successfully dispatched via EmailJS."
        else:
            err_text = response.text
            # Sanitize private key and public key from error text before logging/returning
            if settings.EMAILJS_PRIVATE_KEY and settings.EMAILJS_PRIVATE_KEY in err_text:
                err_text = err_text.replace(settings.EMAILJS_PRIVATE_KEY, "[REDACTED]")
            if settings.EMAILJS_PUBLIC_KEY and settings.EMAILJS_PUBLIC_KEY in err_text:
                err_text = err_text.replace(settings.EMAILJS_PUBLIC_KEY, "[REDACTED]")

            logger.error(f"EmailJS API rejected request (HTTP {response.status_code}): {err_text}")
            return False, f"Email delivery rejected by EmailJS ({response.status_code}): {err_text[:120]}."

    except httpx.TimeoutException:
        logger.error(f"EmailJS request timed out after {timeout_seconds}s for recipient {to_email}")
        return False, f"Email delivery timed out after {timeout_seconds}s via EmailJS."
    except httpx.RequestError as e:
        err_type = type(e).__name__
        logger.error(f"EmailJS network request error ({err_type})")
        return False, f"Email delivery network error via EmailJS: {err_type}."
    except Exception as e:
        err_type = type(e).__name__
        logger.error(f"Unexpected error during EmailJS delivery ({err_type})")
        return False, f"Email delivery error via EmailJS: {err_type}."


# ---------------------------------------------------------------------------
# Public: unified send_email — EmailJS with dev console fallback
# ---------------------------------------------------------------------------

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    template_params: Optional[Dict[str, Any]] = None,
) -> Tuple[bool, str]:
    """
    Sends email using EmailJS REST API.
    In development/test mode without credentials, logs to console fallback.
    In production mode without credentials, returns a clear error.
    Never falls back to SMTP.
    """
    if is_emailjs_configured():
        params = template_params or {
            "to_email": to_email,
            "to_name": to_email.split("@")[0],
            "otp": "",
            "subject": subject,
            "message": text_content or html_content,
        }
        return _send_via_emailjs(to_email, params)

    # EmailJS is not configured
    if settings.ENVIRONMENT.lower() == "production":
        logger.error("Production email delivery failed: EmailJS credentials are not configured.")
        return False, "EmailJS service is not configured in production environment. Please configure EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY."

    logger.info(
        f"[EMAIL SERVICE - DEV LOG] To: {to_email} | Subject: {subject}\n"
        f"Content Preview: {text_content or html_content[:200]}..."
    )
    return True, "Development mode: logged to console fallback."


# ---------------------------------------------------------------------------
# Public: diagnostics — no test email sent
# ---------------------------------------------------------------------------

def verify_email_connection() -> Dict[str, Any]:
    """
    Returns connection/configuration status for EmailJS.
    Does NOT send an email. Never exposes private keys or passwords.
    """
    if is_emailjs_configured():
        return {
            "configured": True,
            "provider": "emailjs",
            "service_id": settings.EMAILJS_SERVICE_ID,
            "template_id": settings.EMAILJS_TEMPLATE_ID,
            "public_key": f"{settings.EMAILJS_PUBLIC_KEY[:4]}***" if settings.EMAILJS_PUBLIC_KEY else None,
            "status": "connected",
            "message": "EmailJS REST API is configured and ready.",
        }

    return {
        "configured": False,
        "provider": "emailjs",
        "status": "unconfigured",
        "message": "EmailJS is not configured. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY.",
    }


def verify_smtp_connection() -> Dict[str, Any]:
    """Backward-compatible alias for verify_email_connection."""
    return verify_email_connection()


# ---------------------------------------------------------------------------
# Public: high-level email helpers
# ---------------------------------------------------------------------------

def send_otp_email(to_email: str, otp_code: str, full_name: Optional[str] = None) -> Tuple[bool, str]:
    """
    Dispatches 6-digit verification OTP to user via EmailJS.
    Parameters passed to EmailJS template: to_email, to_name, otp.
    """
    name = full_name or "BrandGuard User"
    subject = f"{otp_code} is your BrandGuard AI verification code"

    # Dev helper: log the OTP plaintext to console so developers can test without real provider
    if not is_email_provider_configured():
        logger.info(f"[DEV] OTP for {to_email}: {otp_code}")
        print(f"[DEV-OTP-DELIVERY] To: {to_email} | Verification Code: {otp_code}", flush=True)

    template_params = {
        "to_email": to_email,
        "to_name": name,
        "otp": otp_code,
        "subject": subject,
        "email": to_email,
        "user_email": to_email,
    }

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Email Verification</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 700;">BrandGuard AI</h2>
        <p style="margin: 4px 0 20px; color: #64748b; font-size: 13px;">Enterprise Brand Governance</p>
        <h3 style="margin: 0 0 12px; font-size: 18px; color: #1e293b;">Verify your email address</h3>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">Hello {name}, your verification code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1e1b4b;">
            {otp_code}
          </div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">This code expires in 5 minutes.</p>
        </div>
      </div>
    </body>
    </html>
    """

    text = f"Hello {name},\n\nYour BrandGuard AI verification code is: {otp_code}\nThis code expires in 5 minutes."
    return send_email(to_email, subject, html, text, template_params=template_params)


def send_password_reset_email(to_email: str, reset_token: str, full_name: Optional[str] = None) -> Tuple[bool, str]:
    """
    Dispatches password reset link and token to user via EmailJS.
    """
    name = full_name or "BrandGuard User"
    subject = "Reset your BrandGuard AI password"
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    template_params = {
        "to_email": to_email,
        "to_name": name,
        "otp": reset_token,
        "reset_token": reset_token,
        "reset_url": reset_url,
        "subject": subject,
        "email": to_email,
        "user_email": to_email,
    }

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Password Reset</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
        <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 700;">BrandGuard AI</h2>
        <h3 style="margin: 16px 0 12px; font-size: 18px; color: #1e293b;">Password Reset Request</h3>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">Hello {name}, click below to reset your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="{reset_url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="margin: 16px 0; font-size: 12px; color: #64748b;">Token: <code>{reset_token}</code></p>
      </div>
    </body>
    </html>
    """

    text = f"Hello {name},\n\nPassword reset link: {reset_url}\nToken: {reset_token}\nThis token expires in 15 minutes."
    return send_email(to_email, subject, html, text, template_params=template_params)


def send_suspicious_login_alert(to_email: str, client_ip: str, user_agent: Optional[str] = None) -> Tuple[bool, str]:
    """
    Dispatches security alert for unexpected login via EmailJS.
    """
    subject = "Security Alert: Suspicious login detected on your BrandGuard account"
    ua = user_agent or "Unknown browser/client"

    template_params = {
        "to_email": to_email,
        "to_name": "BrandGuard User",
        "otp": "",
        "client_ip": client_ip,
        "user_agent": ua,
        "subject": subject,
        "email": to_email,
        "user_email": to_email,
    }

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Security Alert</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #fee2e2; padding: 32px;">
        <h2 style="margin: 0 0 16px; color: #dc2626; font-size: 20px; font-weight: 700;">Security Alert</h2>
        <p style="font-size: 14px; color: #475569;">A login was detected from IP: {client_ip} ({ua}).</p>
      </div>
    </body>
    </html>
    """
    text = f"Security Alert: A login was detected from IP: {client_ip} (Client: {ua})."
    return send_email(to_email, subject, html, text, template_params=template_params)
