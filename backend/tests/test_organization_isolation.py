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

