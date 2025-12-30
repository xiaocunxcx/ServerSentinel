"""
Database initialization script.

This script creates an initial admin user for the system.
Run this after the first database migration.

Usage:
    python scripts/init_db.py
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import user as user_models
from app.models.node import Base

# Create all tables (if not using Alembic)
# Base.metadata.create_all(bind=engine)


def init_db(db: Session) -> None:
    """Initialize database with default admin user."""
    # Check if admin user exists
    admin = (
        db.query(user_models.User)
        .filter(user_models.User.username == "admin")
        .first()
    )

    if not admin:
        print("Creating default admin user...")
        admin = user_models.User(
            username="admin",
            email="admin@serversentinel.local",
            hashed_password=get_password_hash("admin123"),  # Change this!
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✓ Admin user created: username='admin', password='admin123'")
        print("⚠️  IMPORTANT: Change the default password immediately!")
    else:
        print("✓ Admin user already exists")

    # Create a test regular user
    test_user = (
        db.query(user_models.User)
        .filter(user_models.User.username == "testuser")
        .first()
    )

    if not test_user:
        print("Creating test user...")
        test_user = user_models.User(
            username="testuser",
            email="test@serversentinel.local",
            hashed_password=get_password_hash("test123"),
            is_admin=False,
            is_active=True,
        )
        db.add(test_user)
        db.commit()
        print("✓ Test user created: username='testuser', password='test123'")
    else:
        print("✓ Test user already exists")


def main():
    """Main function."""
    print("Initializing ServerSentinel database...")
    print("-" * 50)

    db = SessionLocal()
    try:
        init_db(db)
        print("-" * 50)
        print("✓ Database initialization complete!")
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
