import pytest
from app.models.audit import AuditLog, compute_audit_hash
from app.models.enums import UserRole
from app.core.security import create_access_token

def test_audit_hash_chain_creation_and_verification(client, db):
    # 1. Ensure clean table or initial chain
    initial_verify = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('1', UserRole.ADMIN.value)}"}
    )
    assert initial_verify.status_code == 200
    assert initial_verify.json()["status"] == "ok"

    # 2. Insert new audit log rows
    log1 = AuditLog(
        user_id=1,
        action="CONTENT_SUBMITTED",
        entity_type="Content",
        entity_id=101,
        details="Submitted initial draft"
    )
    db.add(log1)
    db.commit()
    db.refresh(log1)

    assert log1.prev_hash is not None
    assert log1.hash is not None
    assert log1.hash == compute_audit_hash(log1.prev_hash, log1)

    log2 = AuditLog(
        user_id=1,
        action="APPROVAL_GRANTED",
        entity_type="Content",
        entity_id=101,
        details="Approved by compliance manager"
    )
    db.add(log2)
    db.commit()
    db.refresh(log2)

    assert log2.prev_hash == log1.hash
    assert log2.hash == compute_audit_hash(log2.prev_hash, log2)

    # 3. Verify via API returns OK
    res_verify = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('1', UserRole.ADMIN.value)}"}
    )
    assert res_verify.status_code == 200
    assert res_verify.json() == {"status": "ok"}


def test_audit_tamper_detection(client, db):
    # 1. Add valid rows
    log_a = AuditLog(
        user_id=2,
        action="WORKFLOW_APPROVE",
        entity_type="Content",
        entity_id=201,
        details="Legitimate approval"
    )
    db.add(log_a)
    db.commit()
    db.refresh(log_a)

    log_b = AuditLog(
        user_id=2,
        action="WORKFLOW_PUBLISH",
        entity_type="Content",
        entity_id=201,
        details="Legitimate publish"
    )
    db.add(log_b)
    db.commit()
    db.refresh(log_b)

    # Chain is initially valid
    res_ok = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('1', UserRole.ADMIN.value)}"}
    )
    assert res_ok.status_code == 200
    assert res_ok.json()["status"] == "ok"

    # 2. Tamper directly with log_a's details without updating hash
    log_a.details = "Tampered unauthorized detail injection"
    db.commit()

    # 3. Verify must detect the tampering and return the broken row ID
    res_tampered = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('1', UserRole.ADMIN.value)}"}
    )
    assert res_tampered.status_code == 200
    data = res_tampered.json()
    assert data["status"] == "tampered"
    assert data["broken_row_id"] == log_a.id

    # 4. Non-admin cannot call verify
    res_creator = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('2', UserRole.CREATOR.value)}"}
    )
    assert res_creator.status_code == 403

