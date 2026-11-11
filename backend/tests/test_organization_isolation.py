import pytest
from app.models.enums import UserRole

def test_registration_prevents_privileged_role_escalation(client):
    # Attempting to register as ADMIN should be rejected
    res = client.post("/api/v1/auth/register", json={
        "email": "hacker_admin@evil.com",
        "full_name": "Privilege Escalation Attacker",
        "password": "Password@123",
        "role": "ADMIN"
    })
    assert res.status_code == 403
    assert "Self-assignment of administrative roles" in res.json()["detail"]

    # Attempting to register as MANAGER should be rejected
    res = client.post("/api/v1/auth/register", json={
        "email": "hacker_mgr@evil.com",
        "full_name": "Privilege Escalation Attacker",
        "password": "Password@123",
        "role": "MANAGER"
    })
    assert res.status_code == 403
    assert "Self-assignment of administrative roles" in res.json()["detail"]

def test_cross_organization_data_isolation(client):
    # 1. Register User in Organization A
    res_a = client.post("/api/v1/auth/register", json={
        "email": "alice@acmecorp.com",
        "full_name": "Alice Acme",
        "password": "Password@123",
        "role": "CREATOR",
        "organization": "Acme Corporation"
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User in Organization B
    res_b = client.post("/api/v1/auth/register", json={
        "email": "bob@globex.com",
        "full_name": "Bob Globex",
        "password": "Password@123",
        "role": "CREATOR",
        "organization": "Globex Industries"
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Alice (Acme) submits content
    res_content = client.post(
        "/api/v1/content/?auto_review=false",
        headers=headers_a,
        json={
            "title": "Acme Confidential Strategy 2027",
            "original_body": "Acme Corporation confidential investment brief for accredited partners.",
            "channel": "Website/Blog",
            "target_audience": "Institutional"
        }
    )
    assert res_content.status_code == 201
    content_id = res_content.json()["id"]
    assert res_content.json()["organization"] == "Acme Corporation"

    # 4. Bob (Globex) attempts to fetch Alice's content by ID -> Must be 403 Forbidden
    res_forbidden = client.get(f"/api/v1/content/{content_id}", headers=headers_b)
    assert res_forbidden.status_code == 403
    assert "Cross-organization data access prohibited" in res_forbidden.json()["detail"]

    # 5. Bob (Globex) lists content -> Must NOT see Acme content in the results
    res_list = client.get("/api/v1/content/", headers=headers_b)
    assert res_list.status_code == 200
    globex_items = res_list.json()
    assert not any(item["id"] == content_id for item in globex_items)

    # 6. Bob (Globex) attempts to export Alice's content -> Must be 403 Forbidden
    res_export_forbidden = client.get(f"/api/v1/content/{content_id}/export", headers=headers_b)
    assert res_export_forbidden.status_code == 403
    assert "Cross-organization data access prohibited" in res_export_forbidden.json()["detail"]

    # 7. Alice exports her own content -> Must succeed with CSV
    res_export = client.get(f"/api/v1/content/{content_id}/export", headers=headers_a)
    assert res_export.status_code == 200
    assert "text/csv" in res_export.headers.get("content-type", "")
    assert "Acme Confidential Strategy 2027" in res_export.text


def _make_user(db, email, role, org):
    from app.core.security import get_password_hash, create_access_token
    from app.models.user import User
    u = User(
        email=email,
        full_name=email,
        hashed_password=get_password_hash("ValidPass123!"),
        role=role,
        organization=org,
        is_active=True
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    token = create_access_token(subject=str(u.id), role=u.role.value)
    return u, {"Authorization": f"Bearer {token}"}


def test_cross_organization_review_isolation(client, db):
    from app.models.content import Content
    from app.models.review import AIReview, Finding, Suggestion
    from app.models.enums import ContentStatus, SeverityLevel, FindingCategory, UserRole

    user_alpha, headers_alpha = _make_user(db, "alpha_user@alphacorp.com", UserRole.CREATOR, "AlphaCorp")
    user_beta, headers_beta = _make_user(db, "beta_user@betacorp.com", UserRole.ADMIN, "BetaCorp")

    # Seed content for Org Alpha
    content_alpha = Content(
        title="Alpha Product Launch",
        original_body="Launch text for Alpha",
        current_body="Launch text for Alpha",
        status=ContentStatus.DRAFT,
        channel="Blog",
        organization="AlphaCorp",
        creator_id=user_alpha.id
    )
    db.add(content_alpha)
    db.commit()
    db.refresh(content_alpha)

    review_alpha = AIReview(
        content_id=content_alpha.id,
        overall_score=85.0,
        summary="Review for Alpha"
    )
    db.add(review_alpha)
    db.commit()
    db.refresh(review_alpha)

    finding_alpha = Finding(
        review_id=review_alpha.id,
        category=FindingCategory.TONE_INCONSISTENCY,
        severity=SeverityLevel.MEDIUM,
        matched_text="old",
        explanation="Alpha issue"
    )
    db.add(finding_alpha)
    db.commit()
    db.refresh(finding_alpha)

    suggestion_alpha = Suggestion(
        finding_id=finding_alpha.id,
        original_text="old",
        suggested_text="new",
        reason="better"
    )
    db.add(suggestion_alpha)
    db.commit()
    db.refresh(suggestion_alpha)

    # Beta user triggers review on Alpha content -> 404
    res_trig = client.post(f"/api/v1/review/{content_alpha.id}/trigger", headers=headers_beta)
    assert res_trig.status_code == 404

    # Beta user gets latest review of Alpha content -> 404
    res_latest = client.get(f"/api/v1/review/{content_alpha.id}/latest", headers=headers_beta)
    assert res_latest.status_code == 404

    # Beta user overrides finding on Alpha content -> 404
    res_override = client.post(
        f"/api/v1/review/findings/{finding_alpha.id}/override",
        headers=headers_beta,
        json={"reason": "false positive", "dismiss": True}
    )
    assert res_override.status_code == 404

    # Beta user acts on suggestion for Alpha content -> 404
    res_sugg = client.post(
        f"/api/v1/review/suggestions/{suggestion_alpha.id}/action",
        headers=headers_beta,
        json={"action": "ACCEPT"}
    )
    assert res_sugg.status_code == 404


def test_cross_organization_threats_isolation(client, db):
    from app.models.threat import ThreatItem
    from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus, UserRole

    user_beta, headers_beta = _make_user(db, "beta_admin@betacorp.com", UserRole.ADMIN, "BetaCorp")

    threat_alpha = ThreatItem(
        threat_code="THR-ALPHA-01",
        organization="AlphaCorp",
        category=ThreatCategory.PHISHING_DOMAIN,
        title="Phishing domain alphacorp-login.com",
        source_url="https://alphacorp-login.com",
        risk_level=ThreatRiskLevel.CRITICAL,
        explanation="Malicious domain impersonation",
        status=ThreatStatus.NEW
    )
    db.add(threat_alpha)
    db.commit()
    db.refresh(threat_alpha)

    # Beta user lists threats -> Alpha threat not in response
    res_list = client.get("/api/v1/threats/", headers=headers_beta)
    assert res_list.status_code == 200
    assert not any(t["id"] == threat_alpha.id for t in res_list.json())

    # Beta user gets Alpha threat -> 404
    res_get = client.get(f"/api/v1/threats/{threat_alpha.id}", headers=headers_beta)
    assert res_get.status_code == 404

    # Beta user patches Alpha threat -> 404
    res_patch = client.patch(
        f"/api/v1/threats/{threat_alpha.id}/status",
        headers=headers_beta,
        json={"status": "Resolved"}
    )
    assert res_patch.status_code == 404


def test_cross_organization_guidelines_isolation(client, db):
    from app.models.guideline import BrandGuideline
    from app.models.enums import SeverityLevel, UserRole

    user_beta, headers_beta = _make_user(db, "beta_admin2@betacorp.com", UserRole.ADMIN, "BetaCorp")

    rule_alpha = BrandGuideline(
        organization="AlphaCorp",
        title="Alpha Confidentiality Rule",
        category="Policy",
        description="Must keep secrets",
        severity=SeverityLevel.HIGH
    )
    db.add(rule_alpha)
    db.commit()
    db.refresh(rule_alpha)

    # Beta user lists guidelines -> Alpha rule not present
    res_list = client.get("/api/v1/guidelines/rules", headers=headers_beta)
    assert res_list.status_code == 200
    assert not any(r["id"] == rule_alpha.id for r in res_list.json())

    # Beta user updates Alpha rule -> 404
    res_put = client.put(
        f"/api/v1/guidelines/rules/{rule_alpha.id}",
        headers=headers_beta,
        json={"title": "Hacked Title"}
    )
    assert res_put.status_code == 404

    # Beta user deletes Alpha rule -> 404
    res_del = client.delete(f"/api/v1/guidelines/rules/{rule_alpha.id}", headers=headers_beta)
    assert res_del.status_code == 404


def test_cross_organization_users_isolation(client, db):
    from app.models.enums import UserRole

    user_alpha, _ = _make_user(db, "alpha_dev@alphacorp.com", UserRole.CREATOR, "AlphaCorp")
    user_beta_admin, headers_beta = _make_user(db, "beta_admin3@betacorp.com", UserRole.ADMIN, "BetaCorp")

    # Beta admin lists users -> Alpha user not included
    res_users = client.get("/api/v1/users/", headers=headers_beta)
    assert res_users.status_code == 200
    assert not any(u["id"] == user_alpha.id for u in res_users.json())

    # Beta admin attempts to update Alpha user -> 404
    res_update = client.put(
        f"/api/v1/users/{user_alpha.id}",
        headers=headers_beta,
        json={"full_name": "Tampered Name"}
    )
    assert res_update.status_code == 404


def test_password_policy_enforcement(client):
    # Too short (<10 chars)
    res_short = client.post(
        "/api/v1/auth/register",
        headers={"x-forwarded-for": "10.0.0.1"},
        json={
            "email": "short@pass.com",
            "full_name": "Short Pass",
            "password": "Abc1!",
            "role": "CREATOR"
        }
    )
    assert res_short.status_code == 422

    # No uppercase
    res_no_upper = client.post(
        "/api/v1/auth/register",
        headers={"x-forwarded-for": "10.0.0.2"},
        json={
            "email": "noupper@pass.com",
            "full_name": "No Upper",
            "password": "lowercase12345",
            "role": "CREATOR"
        }
    )
    assert res_no_upper.status_code == 422

    # No digit
    res_no_digit = client.post(
        "/api/v1/auth/register",
        headers={"x-forwarded-for": "10.0.0.3"},
        json={
            "email": "nodigit@pass.com",
            "full_name": "No Digit",
            "password": "NoDigitsPasswordHere",
            "role": "CREATOR"
        }
    )
    assert res_no_digit.status_code == 422


def test_auth_rate_limiting(client):
    headers = {"x-forwarded-for": "198.51.100.42"}
    payload = {"email": "rate_test@example.com", "password": "WrongPassword123"}

    for _ in range(5):
        res = client.post("/api/v1/auth/login", json=payload, headers=headers)
        assert res.status_code in (401, 404)

    # 6th request within window must be 429
    res_blocked = client.post("/api/v1/auth/login", json=payload, headers=headers)
    assert res_blocked.status_code == 429
    assert "Rate limit exceeded" in res_blocked.json()["detail"]


def test_production_secret_key_validation():
    from app.core.config import Settings
    import pydantic

    # Default secret key in production should raise ValidationError
    with pytest.raises(pydantic.ValidationError):
        Settings(
            _env_file=None,
            ENVIRONMENT="production",
            SECRET_KEY="brandguard-enterprise-jwt-signing-key-2026-production"
        )

    # Too short secret key (<32 chars) in production should raise ValidationError
    with pytest.raises(pydantic.ValidationError):
        Settings(
            _env_file=None,
            ENVIRONMENT="production",
            SECRET_KEY="short_key"
        )



