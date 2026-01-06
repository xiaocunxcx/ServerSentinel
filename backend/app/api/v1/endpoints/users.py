"""
User management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user
from app.core.database import get_db
from app.crud import crud_user
from app.models.user import User
from app.schemas.user import SSHKey, SSHKeyCreate, User as UserSchema, UserWithKeys
from app.services import audit_service, auth_service

router = APIRouter()


@router.get("/me", response_model=UserWithKeys)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information including SSH keys.
    
    Requires authentication.
    """
    return current_user


@router.post("/me/ssh-keys", response_model=SSHKey, status_code=status.HTTP_201_CREATED)
def create_ssh_key(
    *,
    request: Request,
    db: Session = Depends(get_db),
    key_in: SSHKeyCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Add a new SSH public key for the current user.
    
    - **public_key**: SSH public key content (e.g., "ssh-rsa AAAAB3...")
    
    Requires authentication.
    """
    client_ip = get_client_ip(request)
    
    try:
        ssh_key = auth_service.add_ssh_key(db, current_user.id, key_in)
        
        # Log SSH key creation
        audit_service.log_ssh_key_created(
            db=db,
            user_id=current_user.id,
            key_id=ssh_key.id,
            fingerprint=ssh_key.fingerprint,
            ip_address=client_ip,
        )
        
        return ssh_key
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me/ssh-keys", response_model=List[SSHKey])
def list_ssh_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all SSH keys for the current user.
    
    Requires authentication.
    """
    return crud_user.get_user_ssh_keys(db, current_user.id)


@router.delete("/me/ssh-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ssh_key(
    *,
    request: Request,
    db: Session = Depends(get_db),
    key_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    Delete an SSH key owned by the current user.
    
    - **key_id**: ID of the SSH key to delete
    
    Requires authentication.
    """
    client_ip = get_client_ip(request)
    
    deleted = crud_user.delete_ssh_key(db, key_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSH key not found",
        )
    
    # Log SSH key deletion
    audit_service.log_ssh_key_deleted(
        db=db,
        user_id=current_user.id,
        key_id=key_id,
        ip_address=client_ip,
    )
    
    return None
