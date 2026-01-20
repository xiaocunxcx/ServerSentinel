"""
Authentication and user management service.
"""
import base64
import binascii
import hashlib
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.crud import crud_user
from app.models.user import User
from app.schemas.user import SSHKeyCreate, UserCreate


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user by username and password."""
    user = crud_user.get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user with hashed password."""
    hashed_password = get_password_hash(user_data.password)
    return crud_user.create_user(db, user_data, hashed_password)


def _is_valid_ssh_public_key(public_key: str) -> bool:
    parts = public_key.strip().split()
    if len(parts) < 2:
        return False

    key_type = parts[0]
    allowed_types = {
        "ssh-rsa",
        "ssh-ed25519",
        "ecdsa-sha2-nistp256",
        "ecdsa-sha2-nistp384",
        "ecdsa-sha2-nistp521",
        "sk-ssh-ed25519@openssh.com",
        "sk-ecdsa-sha2-nistp256@openssh.com",
    }
    if key_type not in allowed_types:
        return False

    key_body = parts[1]
    try:
        padding = "=" * (-len(key_body) % 4)
        base64.b64decode(key_body + padding, validate=True)
    except (ValueError, binascii.Error, UnicodeEncodeError):
        return False

    return True


def add_ssh_key(db: Session, user_id: int, key_data: SSHKeyCreate):
    """Add an SSH key for a user."""
    if not _is_valid_ssh_public_key(key_data.public_key):
        raise ValueError("Invalid SSH public key format")

    # Generate fingerprint from public key
    fingerprint = hashlib.sha256(key_data.public_key.encode()).hexdigest()[:32]
    
    # Check if key already exists (by fingerprint)
    existing_keys = crud_user.get_user_ssh_keys(db, user_id)
    for key in existing_keys:
        if key.fingerprint == fingerprint:
            raise ValueError("SSH key already exists")
    
    return crud_user.create_ssh_key(db, key_data, user_id, fingerprint)
