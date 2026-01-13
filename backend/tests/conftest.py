"""
Test configuration and fixtures for ServerSentinel backend tests.
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
from app.core.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Create a new database session for a test.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with a test database session.
    """

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Test user data."""
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpass123",
        "is_admin": False,
    }


@pytest.fixture
def test_admin_data():
    """Test admin user data."""
    return {
        "username": "admin",
        "email": "admin@example.com",
        "password": "adminpass123",
        "is_admin": True,
    }


@pytest.fixture
def auth_headers(client: TestClient, test_user_data):
    """
    Create a test user and return authentication headers.
    """
    from app.core.security import hash_password
    from app.crud import crud_user
    from app.schemas.user import UserCreate

    # Create user in database
    user_create = UserCreate(**test_user_data)
    user = crud_user.create_user(
        db=client.app.dependency_overrides[get_db](),
        user=user_create,
    )

    # Login and get token
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["username"],
            "password": test_user_data["password"],
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client: TestClient, test_admin_data):
    """
    Create an admin user and return authentication headers.
    """
    from app.core.security import hash_password
    from app.crud import crud_user
    from app.schemas.user import UserCreate

    # Create admin in database
    admin_create = UserCreate(**test_admin_data)
    admin = crud_user.create_user(
        db=client.app.dependency_overrides[get_db](),
        user=admin_create,
    )

    # Login and get token
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_admin_data["username"],
            "password": test_admin_data["password"],
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
