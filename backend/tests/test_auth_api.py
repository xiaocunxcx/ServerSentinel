"""
Unit tests for authentication and SSH key management APIs.
"""

import pytest
from fastapi.testclient import TestClient

VALID_SSH_KEY = (
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFB8r8QKq3VqQ3t9PjFf1xw0WkPq2KzNvC5F0XbV+M2P "
    "test@example.com"
)


class TestAuthLogin:
    """Tests for POST /api/v1/auth/login"""

    def test_login_success(self, client: TestClient, db_session, test_user_data):
        """Test successful login with valid credentials."""
        from app.schemas.user import UserCreate
        from app.services import auth_service

        # Create user first
        user_create = UserCreate(**test_user_data)
        auth_service.create_user(db_session, user_create)

        # Attempt login
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user_data["username"],
                "password": test_user_data["password"],
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_username(self, client: TestClient):
        """Test login with non-existent username."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nonexistent", "password": "password123"},
        )

        assert response.status_code == 401

    def test_login_invalid_password(self, client: TestClient, db_session, test_user_data):
        """Test login with invalid password."""
        from app.schemas.user import UserCreate
        from app.services import auth_service

        # Create user first
        user_create = UserCreate(**test_user_data)
        auth_service.create_user(db_session, user_create)

        # Attempt login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user_data["username"],
                "password": "wrongpassword",
            },
        )

        assert response.status_code == 401

    def test_login_missing_fields(self, client: TestClient):
        """Test login with missing required fields."""
        response = client.post("/api/v1/auth/login", data={"username": "testuser"})
        assert response.status_code == 422  # Validation error


class TestGetCurrentUser:
    """Tests for GET /api/v1/users/me"""

    def test_get_current_user_success(self, client: TestClient, auth_headers):
        """Test getting current user info with valid token."""
        response = client.get("/api/v1/users/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert "email" in data

    def test_get_current_user_unauthorized(self, client: TestClient):
        """Test getting current user without authentication."""
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401


class TestSSHKeyManagement:
    """Tests for SSH key management endpoints"""

    def test_create_ssh_key_success(self, client: TestClient, auth_headers):
        """Test creating a new SSH key."""
        ssh_key = VALID_SSH_KEY

        response = client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "fingerprint" in data
        assert "created_at" in data

    def test_create_ssh_key_invalid_format(self, client: TestClient, auth_headers):
        """Test creating SSH key with invalid format."""
        invalid_key = "invalid-key-format"

        response = client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": invalid_key},
        )

        assert response.status_code == 400

    def test_create_ssh_key_duplicate(self, client: TestClient, auth_headers):
        """Test creating duplicate SSH key."""
        ssh_key = VALID_SSH_KEY

        # Create first key
        client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )

        # Try to create duplicate
        response = client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )

        # Should fail with 400 or 409 (conflict)
        assert response.status_code in [400, 409]

    def test_get_ssh_keys(self, client: TestClient, auth_headers):
        """Test getting all SSH keys for current user."""
        # First create a key
        ssh_key = VALID_SSH_KEY
        client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )

        # Get all keys
        response = client.get("/api/v1/users/me/ssh-keys", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_delete_ssh_key_success(self, client: TestClient, auth_headers):
        """Test deleting an SSH key."""
        # First create a key
        ssh_key = VALID_SSH_KEY
        create_response = client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )
        key_id = create_response.json()["id"]

        # Delete the key
        response = client.delete(
            f"/api/v1/users/me/ssh-keys/{key_id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # Verify key is deleted
        get_response = client.get("/api/v1/users/me/ssh-keys", headers=auth_headers)
        assert key_id not in [k["id"] for k in get_response.json()]

    def test_delete_ssh_key_not_found(self, client: TestClient, auth_headers):
        """Test deleting non-existent SSH key."""
        response = client.delete(
            "/api/v1/users/me/ssh-keys/99999",
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_delete_ssh_key_unauthorized(self, client: TestClient):
        """Test deleting SSH key without authentication."""
        response = client.delete("/api/v1/users/me/ssh-keys/1")
        assert response.status_code == 401

    def test_delete_other_user_key(
        self, client: TestClient, auth_headers, admin_headers
    ):
        """Test that users cannot delete other users' keys."""
        # Create key as regular user
        ssh_key = VALID_SSH_KEY
        create_response = client.post(
            "/api/v1/users/me/ssh-keys",
            headers=auth_headers,
            json={"public_key": ssh_key},
        )
        key_id = create_response.json()["id"]

        # Try to delete as admin (should work for admin)
        # This test verifies the API structure - adjust based on actual requirements
        delete_response = client.delete(
            f"/api/v1/users/me/ssh-keys/{key_id}",
            headers=admin_headers,
        )
        # Admin should get 404 since it's not their key
        assert delete_response.status_code == 404
