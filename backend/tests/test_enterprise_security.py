import time
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserSession
from app.models.enums import UserRole
from app.models.audit import AuditLog
from app.core.security import (
    get_password_hash,
    create_access_token,
    hash_secret,
    get_totp_code,
)

# ─── PHASE A: Registration & Login Security ──────────────────────────────────

def test_strong_password_policy(client):
    # Short password (<10 chars)
    res = client.post("/api/v1/auth/register", json={
        "email": "pwd_short@example.com",
        "full_name": "Test Short",
        "password": "Abc1!",
        "role": "CREATOR"
    })
    assert res.status_code == 422

    # No uppercase
    res = client.post("/api/v1/auth/register", json={
        "email": "pwd_no_upper@example.com",
        "full_name": "Test No Upper",
        "password": "lowercase123!",
        "role": "CREATOR"
    })
    assert res.status_code == 422

    # No lowercase
    res = client.post("/api/v1/auth/register", json={
        "email": "pwd_no_lower@example.com",
        "full_name": "Test No Lower",
        "password": "UPPERCASE123!",
        "role": "CREATOR"
    })
    assert res.status_code == 422

    # No digit
    res = client.post("/api/v1/auth/register", json={
        "email": "pwd_no_digit@example.com",
        "full_name": "Test No Digit",
        "password": "NoDigitsAllowed!",
        "role": "CREATOR"
    })
    assert res.status_code == 422

    # No special character
    res = client.post("/api/v1/auth/register", json={
        "email": "pwd_no_sym@example.com",
        "full_name": "Test No Sym",
        "password": "NoSpecialChar123",
        "role": "CREATOR"
    })
    assert res.status_code == 422

def test_email_verification_otp_flow(client, db):
    # 1. Register new public user -> should be unverified with 6-digit OTP hash
    res = client.post("/api/v1/auth/register", json={
        "email": "unverified_user@example.com",
        "full_name": "Unverified User",
        "password": "StrongPassword@2026",
        "role": "CREATOR"
    })
    assert res.status_code == 201
    user_data = res.json()["user"]
    assert user_data["is_verified"] is False

    # Check database state
    user = db.query(User).filter(User.email == "unverified_user@example.com").first()
    assert user is not None
    assert user.is_verified is False
    assert user.otp_hash is not None
    assert user.otp_expires_at is not None

    # 2. Block unverified user from accessing protected resources
    token = res.json()["access_token"]
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 403
    assert "Email address not verified" in res_me.json()["detail"]

    # 3. Block unverified user from logging in
    res_login = client.post("/api/v1/auth/login", json={
        "email": "unverified_user@example.com",
        "password": "StrongPassword@2026"
    })
    assert res_login.status_code == 403
    assert "Email address not verified" in res_login.json()["detail"]

    # 4. Attempt verification with invalid OTP -> decrements attempts
    res_bad_otp = client.post("/api/v1/auth/verify-otp", json={
        "email": "unverified_user@example.com",
        "otp": "000000"
    })
    assert res_bad_otp.status_code == 400
    assert "Invalid verification code" in res_bad_otp.json()["detail"]

    # 5. Set known OTP in database and verify successfully
    known_otp = "842916"
    user.otp_hash = hash_secret(known_otp)
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()

    res_verify = client.post("/api/v1/auth/verify-otp", json={
        "email": "unverified_user@example.com",
        "otp": known_otp
    })
    assert res_verify.status_code == 200
    assert res_verify.json()["user"]["is_verified"] is True
    new_token = res_verify.json()["access_token"]

    # 6. User can now access protected resources
    res_me_now = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert res_me_now.status_code == 200
    assert res_me_now.json()["email"] == "unverified_user@example.com"

def test_otp_attempt_limits_and_cooldown(client, db):
    email = "otp_limits@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "full_name": "Limits User",
        "password": "StrongPassword@2026",
        "role": "CREATOR"
    })
    user = db.query(User).filter(User.email == email).first()
    user.otp_hash = hash_secret("999999")
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    user.otp_attempts = 4  # 1 attempt left before limit
    db.commit()

    # 5th failed attempt triggers attempt limit
    res_fail = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp": "111111"})
    assert res_fail.status_code in (400, 429)

    # 6th attempt is blocked with 429
    res_blocked = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp": "111111"})
    assert res_blocked.status_code == 429
    assert "Too many failed verification attempts" in res_blocked.json()["detail"]

    # Resend cooldown test
    # Just resent, immediate resend should return 429
    user.otp_last_sent_at = datetime.now(timezone.utc) - timedelta(seconds=10)  # only 10s ago
    db.commit()
    res_cooldown = client.post("/api/v1/auth/resend-otp", json={"email": email})
    assert res_cooldown.status_code == 429
    assert "Please wait" in res_cooldown.json()["detail"]

def test_generic_auth_errors_and_progressive_lockout(client, db):
    # Create verified test account
    email = "lockout_user@example.com"
    user = User(
        email=email,
        full_name="Lockout Test",
        hashed_password=get_password_hash("ValidPassword@2026"),
        role=UserRole.CREATOR,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()

    # Wrong email -> generic 401
    res_unknown = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "SomePassword@123"
    })
    assert res_unknown.status_code == 401
    assert res_unknown.json()["detail"] == "Invalid email or password"

    # Wrong password -> identical generic 401
    res_wrong_pw = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword@2026"
    })
    assert res_wrong_pw.status_code == 401
    assert res_wrong_pw.json()["detail"] == "Invalid email or password"

    # Progressive Lockout: 5 failed attempts locks account for 1 minute
    user.failed_login_attempts = 4
    db.commit()

    res_5th = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword@2026"
    })
    assert res_5th.status_code == 401

    # Next attempt should be blocked by progressive lockout (429)
    res_locked = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "ValidPassword@2026"
    })
    assert res_locked.status_code == 429
    assert "Account is temporarily locked" in res_locked.json()["detail"]


# ─── PHASE B: Token & Account Security ───────────────────────────────────────

def test_refresh_token_rotation_and_reuse_detection(client, db):
    # Log in to get token pair
    res_login = client.post("/api/v1/auth/login", json={
        "email": "creator@brandguard.io",
        "password": "Creator@123"
    })
    assert res_login.status_code == 200
    data = res_login.json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    assert refresh_token is not None

    # Rotate refresh token
    res_refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_refresh.status_code == 200
    rotated_data = res_refresh.json()
    new_access_token = rotated_data["access_token"]
    new_refresh_token = rotated_data["refresh_token"]

    assert new_access_token != access_token
    assert new_refresh_token != refresh_token

    # Attempt reuse of the previous (now revoked) refresh token -> REUSE DETECTED!
    res_reuse = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_reuse.status_code == 401
    assert "terminated for security" in res_reuse.json()["detail"]

    # Verify all sessions for this user were revoked
    creator_user = db.query(User).filter(User.email == "creator@brandguard.io").first()
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == creator_user.id,
        UserSession.is_revoked == False
    ).count()
    assert active_sessions == 0

def test_secure_logout_and_session_revocation(client, db):
    res_login = client.post("/api/v1/auth/login", json={
        "email": "reviewer@brandguard.io",
        "password": "Reviewer@123"
    })
    token = res_login.json()["access_token"]

    # User calls logout
    res_logout = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert res_logout.status_code == 200
    assert "Logged out successfully" in res_logout.json()["message"]

    # Subsequent request using the revoked access token must fail
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 401

def test_password_recovery_and_session_invalidation(client, db):
    email = "manager@brandguard.io"
    user = db.query(User).filter(User.email == email).first()

    # Active session before password change
    res_login = client.post("/api/v1/auth/login", json={"email": email, "password": "Manager@123"})
    old_access_token = res_login.json()["access_token"]

    # Request password recovery
    res_req = client.post("/api/v1/auth/password-recovery/request", json={"email": email})
    assert res_req.status_code == 200

    # Retrieve reset token hash from database
    db.refresh(user)
    assert user.password_reset_token_hash is not None

    # Simulate reset with known token
    reset_secret = "test_reset_token_secret_12345"
    user.password_reset_token_hash = hash_secret(reset_secret)
    user.password_reset_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    # Confirm password reset
    new_pwd = "NewSecureManagerPassword@2026"
    res_confirm = client.post("/api/v1/auth/password-recovery/confirm", json={
        "token": reset_secret,
        "new_password": new_pwd
    })
    assert res_confirm.status_code == 200
    assert "successfully reset" in res_confirm.json()["message"]

    # Verify old session token is immediately invalidated
    res_old = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {old_access_token}"})
    assert res_old.status_code == 401

    # Verify new password allows login
    res_new_login = client.post("/api/v1/auth/login", json={"email": email, "password": new_pwd})
    assert res_new_login.status_code == 200

    # Restore original password for other tests
    user.hashed_password = get_password_hash("Manager@123")
    user.password_changed_at = None
    db.commit()


# ─── PHASE C: Enterprise Protection & Multi-Factor Authentication ────────────

def test_totp_mfa_setup_and_login_flow(client, db):
    # Log in as creator
    res_login = client.post("/api/v1/auth/login", json={
        "email": "creator@brandguard.io",
        "password": "Creator@123"
    })
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Call MFA Setup
    res_setup = client.post("/api/v1/auth/mfa/setup", headers=headers)
    assert res_setup.status_code == 200
    setup_data = res_setup.json()
    assert "secret" in setup_data
    assert "otpauth_url" in setup_data
    assert len(setup_data["backup_codes"]) == 8

    secret = setup_data["secret"]
    backup_code = setup_data["backup_codes"][0]

    # 2. Enable MFA using valid TOTP code
    current_code = get_totp_code(secret)
    res_enable = client.post("/api/v1/auth/mfa/enable", headers=headers, json={"code": current_code})
    assert res_enable.status_code == 200
    assert "enabled successfully" in res_enable.json()["message"]

    # 3. Next login prompts for MFA
    res_mfa_login = client.post("/api/v1/auth/login", json={
        "email": "creator@brandguard.io",
        "password": "Creator@123"
    })
    assert res_mfa_login.status_code == 200
    mfa_resp = res_mfa_login.json()
    assert mfa_resp["mfa_required"] is True
    mfa_token = mfa_resp["mfa_token"]

    # 4. Verify login using backup code
    res_verify_backup = client.post("/api/v1/auth/mfa/verify-login", json={
        "mfa_token": mfa_token,
        "code": backup_code
    })
    assert res_verify_backup.status_code == 200
    assert "access_token" in res_verify_backup.json()
    assert res_verify_backup.json()["user"]["email"] == "creator@brandguard.io"

    # Backup code is single-use: subsequent attempt with same code must fail
    res_backup_reuse = client.post("/api/v1/auth/mfa/verify-login", json={
        "mfa_token": mfa_token,
        "code": backup_code
    })
    assert res_backup_reuse.status_code == 400

    # Clean up: disable MFA for creator so other tests are unaffected
    creator = db.query(User).filter(User.email == "creator@brandguard.io").first()
    creator.mfa_enabled = False
    creator.mfa_secret = None
    creator.mfa_backup_codes = None
    db.commit()

def test_admin_mandatory_mfa_enforcement(client, db):
    # Admin Alex without MFA
    admin = db.query(User).filter(User.email == "admin@brandguard.io").first()
    admin.mfa_enabled = False
    db.commit()

    token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value)
    headers = {"Authorization": f"Bearer {token}", "x-enforce-admin-mfa": "true"}

    # Admin CAN access MFA setup
    res_setup = client.post("/api/v1/auth/mfa/setup", headers=headers)
    assert res_setup.status_code == 200

    # Admin is BLOCKED from operational endpoints until MFA is active
    res_blocked = client.get("/api/v1/guidelines/rules", headers=headers)
    assert res_blocked.status_code == 403
    assert "Multi-Factor Authentication" in res_blocked.json()["detail"]

    # Enable MFA for Admin
    secret = res_setup.json()["secret"]
    code = get_totp_code(secret)
    res_enable = client.post("/api/v1/auth/mfa/enable", headers=headers, json={"code": code})
    assert res_enable.status_code == 200

    # Admin CAN now access operational endpoints
    res_allowed = client.get("/api/v1/guidelines/rules", headers=headers)
    assert res_allowed.status_code == 200

    # Clean up Admin MFA
    admin.mfa_enabled = False
    admin.mfa_secret = None
    admin.mfa_backup_codes = None
    db.commit()
