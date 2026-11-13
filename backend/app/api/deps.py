from typing import List
import time
from datetime import datetime, timezone
from collections import defaultdict
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.config import settings
from app.models.user import User, RevokedToken
from app.models.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_rate_limits = defaultdict(list)

def rate_limit_auth(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    
    endpoint = request.url.path
    now = time.time()
    key = (client_ip, endpoint)
    
    # 60s sliding window, max 5 requests per minute
    _rate_limits[key] = [t for t in _rate_limits[key] if now - t < 60]
    if len(_rate_limits[key]) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded (5 requests/minute). Please try again later."
        )
    _rate_limits[key].append(now)

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # Verify token type is access token
    if payload.get("type") and payload.get("type") != "access":
        raise credentials_exception

    # Check revoked token blacklist
    jti = payload.get("jti")
    if jti:
        revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if revoked:
            raise credentials_exception

    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    # Invalidate token if issued before password was changed
    if user.password_changed_at:
        iat = payload.get("iat")
        if iat:
            token_issued = datetime.fromtimestamp(iat, tz=timezone.utc)
            # Normalize user.password_changed_at to UTC
            pwd_changed = user.password_changed_at
            if pwd_changed.tzinfo is None:
                pwd_changed = pwd_changed.replace(tzinfo=timezone.utc)
            if token_issued < pwd_changed:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Password was recently changed. Please log in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    # Block unverified accounts from protected access
    if not getattr(user, "is_verified", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please verify your email before accessing protected resources."
        )

    # Phase C: Mandatory TOTP MFA for Admin accounts
    path = request.url.path
    is_mfa_setup_route = (
        "/auth/mfa" in path 
        or path.endswith("/auth/me") 
        or path.endswith("/auth/logout")
    )
    enforce_admin_mfa = (
        getattr(settings, "MFA_ENFORCE_ADMIN", False)
        or settings.ENVIRONMENT.lower() == "production"
        or request.headers.get("x-enforce-admin-mfa") == "true"
    )
    if user.role == UserRole.ADMIN and enforce_admin_mfa and not user.mfa_enabled and not is_mfa_setup_route:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator accounts must enroll in Multi-Factor Authentication (TOTP) to access platform operations."
        )

    return user

def get_current_org(current_user: User = Depends(get_current_user)) -> str:
    org = getattr(current_user, "organization", None)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any organization"
        )
    return org

def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

