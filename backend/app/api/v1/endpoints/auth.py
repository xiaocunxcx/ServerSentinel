"""
Authentication endpoints.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import Token
from app.services import audit_service, auth_service

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    OAuth2 compatible token login.
    
    Returns JWT access token on successful authentication.
    """
    client_ip = get_client_ip(request)
    
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Log failed login attempt (if we can identify the user)
        # For now, we skip logging failed attempts without user_id
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Log successful login
    audit_service.log_user_login(
        db=db,
        user_id=user.id,
        ip_address=client_ip,
        success=True,
    )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
