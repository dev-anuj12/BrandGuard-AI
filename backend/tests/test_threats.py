import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_admin_token():
    res = client.post("/api/v1/auth/login", json={"email": "admin@finnova.com", "password": "Admin@123"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_list_threats():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/threats/", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    first = data[0]
    assert "threat_code" in first
    assert "risk_level" in first
    assert "status" in first

def test_unified_analytics():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/analytics/unified", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_content_reviewed" in data
    assert "brand_compliance_score" in data
    assert "total_detected_threats" in data
    assert "critical_high_threats" in data
    assert "threat_category_breakdown" in data
    assert len(data["threat_category_breakdown"]) >= 1

def test_update_threat_status():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Fetch first threat
    list_res = client.get("/api/v1/threats/", headers=headers)
    threat_id = list_res.json()[0]["id"]
    
    # Update status
    patch_res = client.patch(
        f"/api/v1/threats/{threat_id}/status",
        headers=headers,
        json={"status": "Under Investigation", "notes": "Automated test assignment"}
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "Under Investigation"

