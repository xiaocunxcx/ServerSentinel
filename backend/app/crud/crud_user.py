from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import SSHKey, User
from app.schemas.user import SSHKeyCreate, UserCreate


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate, hashed_password: str) -> User:
    """Create a new user."""
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_admin=False,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_ssh_keys(db: Session, user_id: int) -> list[SSHKey]:
    """Get all SSH keys for a user."""
    return db.query(SSHKey).filter(SSHKey.user_id == user_id).all()


def create_ssh_key(
    db: Session, key: SSHKeyCreate, user_id: int, fingerprint: str
) -> SSHKey:
    """Create a new SSH key for a user."""
    db_key = SSHKey(
        public_key=key.public_key,
        fingerprint=fingerprint,
        user_id=user_id,
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    return db_key


def delete_ssh_key(db: Session, key_id: int, user_id: int) -> bool:
    """Delete an SSH key. Returns True if deleted, False if not found."""
    key = db.query(SSHKey).filter(SSHKey.id == key_id, SSHKey.user_id == user_id).first()
    if key:
        db.delete(key)
        db.commit()
        return True
    return False
