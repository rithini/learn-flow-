import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.security import get_password_hash
from app.models.user import User, StudentProfile, TrainerProfile, AdminProfile
from app.models.enums import UserRole

# Use in-memory SQLite database for testing with StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_test_users(db_session):
    admin = User(
        email="admin@test.edu",
        full_name="Admin Test",
        password_hash=get_password_hash("Secret123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    trainer = User(
        email="trainer@test.edu",
        full_name="Trainer Test",
        password_hash=get_password_hash("Secret123!"),
        role=UserRole.TRAINER,
        is_active=True,
    )
    student = User(
        email="student@test.edu",
        full_name="Student Test",
        password_hash=get_password_hash("Secret123!"),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db_session.add_all([admin, trainer, student])
    db_session.flush()

    db_session.add(AdminProfile(user_id=admin.id))
    db_session.add(TrainerProfile(user_id=trainer.id, employee_code="T-01"))
    db_session.add(StudentProfile(user_id=student.id, student_code="S-01"))
    db_session.commit()

    return {"admin": admin, "trainer": trainer, "student": student}
