def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_login_seeded_users(client):
    # Test Admin login
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@finnova.com",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

    # Test Creator login
    res = client.post("/api/v1/auth/login", json={
        "email": "creator@finnova.com",
        "password": "Creator@123"
    })
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "CREATOR"

def test_login_invalid_credentials(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@finnova.com",
        "password": "WrongPassword"
    })
    assert res.status_code == 401

def test_user_registration(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "new_creator@finnova.com",
        "full_name": "Test Creator",
        "password": "Password@123",
        "role": "CREATOR"
    })
    assert res.status_code == 201
    assert res.json()["user"]["email"] == "new_creator@finnova.com"

