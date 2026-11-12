import pytest
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from app.database.init_db import ensure_columns_for_table, ensure_all_schema_columns
from app.models.audit import AuditLog, compute_audit_hash
from app.models.enums import UserRole
from app.core.security import create_access_token

def test_migration_on_legacy_schema_missing_audit_columns(tmp_path):
    """
    Simulates a database with a legacy audit_logs schema missing prev_hash and hash,
    containing historical records, and verifies safe idempotent migration.
    """
    db_file = tmp_path / "legacy_test.db"
    test_db_url = f"sqlite:///{db_file}"
    custom_engine = create_engine(test_db_url, connect_args={"check_same_thread": False})

    # 1. Create legacy schema with missing columns
    with custom_engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100),
                entity_id INTEGER,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        # Insert historical audit records
        conn.execute(text("""
            INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
            VALUES (1, 10, 'LEGACY_ACTION_1', 'Content', 101, 'Historical record 1')
        """))
        conn.execute(text("""
            INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
            VALUES (2, 10, 'LEGACY_ACTION_2', 'Content', 101, 'Historical record 2')
        """))

    inspector = inspect(custom_engine)
    cols_before = {c["name"].lower() for c in inspector.get_columns("audit_logs")}
    assert "prev_hash" not in cols_before
    assert "hash" not in cols_before
    assert "organization" not in cols_before

    # 2. Run idempotent migration using ensure_columns_for_table on this engine
    audit_cols = [
        ("organization", "VARCHAR(100) DEFAULT 'BrandGuard Demo Enterprise'"),
        ("reason", "TEXT"),
        ("revision_id", "INTEGER"),
        ("prev_hash", "VARCHAR(64)"),
        ("hash", "VARCHAR(64)"),
        ("ip_address", "VARCHAR(50)"),
    ]
    # Temporarily bind engine for migration helper
    from app.database import init_db
    orig_engine = init_db.engine
    init_db.engine = custom_engine

    try:
        ensure_columns_for_table("audit_logs", audit_cols)

        # 3. Verify columns now exist
        inspector = inspect(custom_engine)
        cols_after = {c["name"].lower() for c in inspector.get_columns("audit_logs")}
        assert "prev_hash" in cols_after
        assert "hash" in cols_after
        assert "organization" in cols_after
        assert "reason" in cols_after
        assert "revision_id" in cols_after

        # 4. Verify existing records are preserved and not mutated
        with custom_engine.connect() as conn:
            rows = conn.execute(text("SELECT id, action, details, prev_hash, hash FROM audit_logs ORDER BY id ASC")).fetchall()
            assert len(rows) == 2
            assert rows[0][1] == "LEGACY_ACTION_1"
            assert rows[0][2] == "Historical record 1"
            assert rows[0][3] is None  # prev_hash uncorrupted
            assert rows[0][4] is None  # hash uncorrupted
            assert rows[1][1] == "LEGACY_ACTION_2"
            assert rows[1][3] is None

        # 5. Test repeated migration execution (idempotency)
        ensure_columns_for_table("audit_logs", audit_cols)
        inspector_recheck = inspect(custom_engine)
        cols_recheck = {c["name"].lower() for c in inspector_recheck.get_columns("audit_logs")}
        assert cols_recheck == cols_after

    finally:
        init_db.engine = orig_engine


def test_audit_verification_with_legacy_and_new_records(client, db):
    """
    Verifies that when legacy records exist alongside newly hashed records,
    the audit verification endpoint correctly validates the cryptographic chain
    starting from the first hashed record without reporting legacy rows as tampered.
    """
    # Get latest existing hash before inserting legacy and new rows
    last_hash = db.execute(text("SELECT hash FROM audit_logs WHERE hash IS NOT NULL ORDER BY id DESC LIMIT 1")).scalar() or "GENESIS"

    # 1. Insert a legacy row (simulating pre-existing record without hash)
    # Bypass before_insert listener by executing raw SQL
    db.execute(text("""
        INSERT INTO audit_logs (action, details, prev_hash, hash)
        VALUES ('LEGACY_EVENT', 'Legacy unhashed row', NULL, NULL)
    """))
    db.commit()

    # 2. Insert new audit log via ORM (triggers set_audit_hash)
    log_new1 = AuditLog(
        user_id=1,
        action="POST_MIGRATION_EVENT_1",
        entity_type="Content",
        entity_id=50,
        details="First signed event"
    )
    db.add(log_new1)
    db.commit()
    db.refresh(log_new1)

    assert log_new1.prev_hash == last_hash
    assert log_new1.hash is not None
    assert log_new1.hash == compute_audit_hash(last_hash, log_new1)

    # 3. Insert second new audit log via ORM
    log_new2 = AuditLog(
        user_id=1,
        action="POST_MIGRATION_EVENT_2",
        entity_type="Content",
        entity_id=50,
        details="Second signed event"
    )
    db.add(log_new2)
    db.commit()
    db.refresh(log_new2)

    assert log_new2.prev_hash == log_new1.hash
    assert log_new2.hash == compute_audit_hash(log_new1.hash, log_new2)

    # 4. Verify via endpoint returns ok
    res = client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {create_access_token('1', UserRole.ADMIN.value)}"}
    )
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

    # Clean up test rows
    db.delete(log_new2)
    db.delete(log_new1)
    db.execute(text("DELETE FROM audit_logs WHERE action = 'LEGACY_EVENT'"))
    db.commit()
