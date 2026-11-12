from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
import bcrypt
import hmac
import hashlib
import secrets
import struct
import base64
import jwt
from app.core.config import settings

def create_access_token(
    subject: Union[str, Any],
    role: str,
    expires_delta: Optional[timedelta] = None,
    jti: Optional[str] = None
) -> str:
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        # Default access token: 15 minutes for strict security
        expire = now + timedelta(minutes=15)
    
    token_jti = jti or secrets.token_hex(16)
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": now,
        "jti": token_jti,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    jti: Optional[str] = None
) -> str:
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        # Default refresh token: 7 days
        expire = now + timedelta(days=7)
    
    token_jti = jti or secrets.token_hex(16)
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": now,
        "jti": token_jti,
        "type": "refresh"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Bcrypt has a 72-byte max length limit; slice safely to prevent errors
        safe_password = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(
            safe_password,
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    safe_password = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(safe_password, salt).decode("utf-8")

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def generate_otp() -> str:
    """Generate a secure, cryptographically random 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000:06d}"

def hash_secret(value: str) -> str:
    """Deterministic HMAC-SHA256 for hashing OTPs, reset tokens, and refresh tokens."""
    return hmac.new(settings.SECRET_KEY.encode("utf-8"), value.encode("utf-8"), hashlib.sha256).hexdigest()

def verify_secret_hash(value: str, hashed: str) -> bool:
    """Constant-time comparison against HMAC-SHA256 hash."""
    expected = hash_secret(value)
    return hmac.compare_digest(expected, hashed)

# ─── RFC 6238 TOTP Multi-Factor Authentication Utilities ──────────────────

def generate_totp_secret() -> str:
    """Generate a 160-bit cryptographically secure Base32 secret for TOTP MFA."""
    raw_bytes = secrets.token_bytes(20)
    return base64.b32encode(raw_bytes).decode("utf-8").replace("=", "")

def get_totp_uri(secret: str, email: str, issuer: str = "BrandGuard AI") -> str:
    """Generate a standard otpauth:// URI for authenticator apps (Google Authenticator, etc)."""
    from urllib.parse import quote
    return f"otpauth://totp/{quote(issuer)}:{quote(email)}?secret={secret}&issuer={quote(issuer)}&algorithm=SHA1&digits=6&period=30"

def get_totp_code(secret: str, time_step: int = 30) -> str:
    """Calculate the current 6-digit TOTP code for a secret."""
    key = base64.b32decode(secret + "=" * ((8 - len(secret) % 8) % 8), casefold=True)
    counter = int(datetime.now(timezone.utc).timestamp() // time_step)
    msg = struct.pack(">Q", counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    offset = h[19] & 0x0F
    code = (struct.unpack(">I", h[offset:offset + 4])[0] & 0x7FFFFFFF) % 1000000
    return f"{code:06d}"

def verify_totp(secret: str, code: str, window: int = 1, time_step: int = 30) -> bool:
    """Verify a TOTP code within a sliding window (default +/- 30s) to tolerate clock skew."""
    try:
        clean_code = str(code).strip()
        if len(clean_code) != 6 or not clean_code.isdigit():
            return False
        key = base64.b32decode(secret + "=" * ((8 - len(secret) % 8) % 8), casefold=True)
        current_counter = int(datetime.now(timezone.utc).timestamp() // time_step)
        for offset in range(-window, window + 1):
            counter = current_counter + offset
            msg = struct.pack(">Q", counter)
            h = hmac.new(key, msg, hashlib.sha1).digest()
            byte_offset = h[19] & 0x0F
            expected_num = (struct.unpack(">I", h[byte_offset:byte_offset + 4])[0] & 0x7FFFFFFF) % 1000000
            if f"{expected_num:06d}" == clean_code:
                return True
        return False
    except Exception:
        return False

def generate_mfa_backup_codes(count: int = 8) -> list[str]:
    """Generate single-use alphanumeric backup codes (10 chars each)."""
    return [secrets.token_hex(5).upper() for _ in range(count)]


