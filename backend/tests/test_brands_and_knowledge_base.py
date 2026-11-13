import pytest
from app.models.enums import UserRole
from app.models.user import User
from app.models.brand import Brand
from app.models.threat import BrandAsset
from app.core.security import create_access_token

def get_tokens(client, db):
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    creator = db.query(User).filter(User.role == UserRole.CREATOR).first()
    admin_token = create_access_token(subject=admin.id, role=admin.role.value)
    creator_token = create_access_token(subject=creator.id, role=creator.role.value)
    return creator_token, admin_token

def test_brands_crud_and_isolation(client, db):
    creator_token, admin_token = get_tokens(client, db)

    # 1. List brands with creator token
    res = client.get("/api/v1/brands/", headers={"Authorization": f"Bearer {creator_token}"})
    assert res.status_code == 200
    brands = res.json()
    assert len(brands) >= 1
    brand_id = brands[0]["id"]

    # 2. Creator cannot create brand (forbidden)
    res_create_denied = client.post("/api/v1/brands/", json={
        "name": "Unauthorized Brand",
        "code": "UNAUTH"
    }, headers={"Authorization": f"Bearer {creator_token}"})
    assert res_create_denied.status_code == 403

    # 3. Admin can create brand
    res_create = client.post("/api/v1/brands/", json={
        "name": "BrandGuard Institutional",
        "code": "BGAI-INST",
        "description": "Institutional division",
        "industry": "Asset Management"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_create.status_code == 201
    new_brand = res_create.json()
    assert new_brand["code"] == "BGAI-INST"

    # 4. Get brand analytics
    res_analytics = client.get(f"/api/v1/brands/{brand_id}/analytics", headers={"Authorization": f"Bearer {creator_token}"})
    assert res_analytics.status_code == 200
    analytics_data = res_analytics.json()
    assert "total_submissions" in analytics_data
    assert "average_compliance_score" in analytics_data

def test_knowledge_base_assets_and_validation(client, db):
    _, admin_token = get_tokens(client, db)

    # 1. Create a brand asset
    res_asset = client.post("/api/v1/knowledge-base/assets", json={
        "asset_name": "BrandGuard High-Res Vector Shield",
        "asset_type": "Primary Logo",
        "category": "logo",
        "dimensions": "1000x1000",
        "file_size_kb": 220.5,
        "approval_status": "approved"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_asset.status_code == 201
    asset_id = res_asset.json()["id"]

    # 2. List assets
    res_list = client.get("/api/v1/knowledge-base/assets", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_list.status_code == 200
    assert any(a["id"] == asset_id for a in res_list.json())

    # 3. Validate asset via multipart upload
    fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00\x00\x00\x01\x00\x08\x06\x00\x00\x00" + b"\x00" * 200
    res_val = client.post(
        "/api/v1/knowledge-base/assets/validate",
        files={"file": ("logo_test.png", fake_png, "image/png")},
        data={"asset_type": "Primary Logo"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_val.status_code == 200
    val_data = res_val.json()
    assert val_data["valid"] is True
    assert val_data["file_type"] == "PNG"
    assert "sha256_hash" in val_data
    assert len(val_data["checks"]) >= 3

def test_document_ingestion(client, db):
    _, admin_token = get_tokens(client, db)

    # Upload text-based guidelines document
    doc_content = b"All communications must disclose risks. Marketers shall never guarantee double-digit annual returns without disclaimers."
    res_doc = client.post(
        "/api/v1/knowledge-base/upload-document",
        files={"file": ("guidelines_q4.txt", doc_content, "text/plain")},
        data={"category": "Financial Claims", "auto_create_rules": "true"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_doc.status_code == 200
    data = res_doc.json()
    assert data["status"] == "success"
    assert data["word_count"] > 5

def test_upgraded_analytics_endpoints(client, db):
    _, admin_token = get_tokens(client, db)

    # 1. Monthly trends
    res_trends = client.get("/api/v1/analytics/trends/monthly", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_trends.status_code == 200
    assert len(res_trends.json()) >= 6

    # 2. Top guidelines
    res_top = client.get("/api/v1/analytics/violations/top-guidelines", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_top.status_code == 200
    assert len(res_top.json()) >= 1

    # 3. Brand performance
    res_perf = client.get("/api/v1/analytics/brand-performance", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_perf.status_code == 200
    assert len(res_perf.json()) >= 1

    # 4. Export report
    res_exp = client.get("/api/v1/analytics/export/report", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_exp.status_code == 200
    assert "summary" in res_exp.json()
