def test_user_registration(client):
    payload = {
        "email": "newstudent@learnflow.edu",
        "password": "Password123!",
        "full_name": "New Learner",
        "role": "STUDENT",
        "student_code": "STU-999",
        "institution_name": "Test University",
        "current_level": "Undergraduate",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newstudent@learnflow.edu"
    assert data["role"] == "STUDENT"
    assert data["student_code"] == "STU-999"


def test_user_login_and_token(client, seed_test_users):
    payload = {
        "email": "student@test.edu",
        "password": "Secret123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "student@test.edu"


def test_invalid_login(client, seed_test_users):
    payload = {
        "email": "student@test.edu",
        "password": "WrongPassword!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_rbac_trainer_route_denied_for_student(client, seed_test_users):
    # 1. Login as student
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.edu", "password": "Secret123!"},
    )
    token = login_resp.json()["access_token"]

    # 2. Attempt to create course on trainer route
    resp = client.post(
        "/api/v1/trainer/courses",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Unauthorized Course"},
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN"
