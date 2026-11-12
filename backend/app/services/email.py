import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("brandguard.email")

def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Sends email via configured SMTP server (e.g. Amazon SES, SendGrid, Postmark, Mailgun, or standard SMTP).
    Falls back gracefully to secure development logging if SMTP credentials are not configured.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info(
            f"[EMAIL SERVICE - DEV LOG] To: {to_email} | Subject: {subject}\n"
            f"Content Preview: {text_content or html_content[:200]}..."
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            if settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        
        logger.info(f"Email successfully delivered to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to deliver email to {to_email}: {str(e)}")
        # Do not raise to avoid breaking user flows on email network transient errors
        return False

def send_otp_email(to_email: str, otp_code: str, full_name: Optional[str] = None) -> bool:
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
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Enterprise Brand Governance & Digital Protection</p>
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

def send_password_reset_email(to_email: str, reset_token: str, full_name: Optional[str] = None) -> bool:
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

def send_suspicious_login_alert(to_email: str, client_ip: str, user_agent: Optional[str] = None) -> bool:
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
