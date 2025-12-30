"""
User management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import crud_user
from app.models.user import User
from app.schemas.user import SSHKey, SSHKeyCreate, UserWithKeys
from app.services import auth_service

router = APIRouter()


@router.get("/me", response_model=UserWithKeys)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information including SSH keys.
    """
    return current_user


@router.post("/me/keys", response_model=SSHKey, status_code=status.HTTP_201_CREATED)
def create_ssh_key(
    *,
    db: Session = Depends(get_db),
    key_in: SSHKeyCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Add a new SSH public key for the current user.
    """
    try:
        ssh_key = auth_service.add_ssh_key(db, current_user.id, key_in)
        return ssh_key
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me/keys", response_model=List[SSHKey])
def list_ssh_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all SSH keys for the current user.
    """
    return crud_user.get_user_ssh_keys(db, current_user.id)


@router.delete("/me/keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ssh_key(
    *,
    db: Session = Depends(get_db),
    key_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    Delete an SSH key owned by the current user.
    """
    deleted = crud_user.delete_ssh_key(db, key_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSH key not found",
        )
    return None
