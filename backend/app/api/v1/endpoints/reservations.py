from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user
from app.core.database import get_db
from app.crud import crud_reservation
from app.models.user import User
from app.schemas import reservation as schemas
from app.services import audit_service, reservation_service

router = APIRouter()


@router.post("/", response_model=schemas.Reservation, status_code=status.HTTP_201_CREATED)
def create_reservation(
    *,
    request: Request,
    db: Session = Depends(get_db),
    reservation_in: schemas.ReservationCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create new reservation.
    
    - **start_time**: Reservation start time in UTC.
    - **end_time**: Reservation end time in UTC.
    - **node_id**: The ID of the node to reserve.
    - **type**: 'machine' or 'device'.
    - **device_ids**: A list of device IDs to reserve (required if type is 'device').
    
    Requires authentication.
    """
    client_ip = get_client_ip(request)
    
    try:
        reservation = reservation_service.create_reservation(
            db=db, reservation_data=reservation_in, user_id=current_user.id
        )
        
        # Log reservation creation
        audit_service.log_reservation_created(
            db=db,
            user_id=current_user.id,
            reservation_id=reservation.id,
            node_id=reservation.node_id,
            reservation_type=reservation.type.value,
            start_time=reservation.start_time.isoformat(),
            end_time=reservation.end_time.isoformat(),
            device_ids=reservation_in.device_ids,
            ip_address=client_ip,
        )
        
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        # Catch-all for other potential errors
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.get("/", response_model=List[schemas.Reservation])
def list_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Filter by user ID (admin only)"),
    node_id: Optional[int] = Query(None, description="Filter by node ID"),
    start_date: Optional[datetime] = Query(None, description="Filter reservations ending after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter reservations starting before this date"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
):
    """
    Get reservations with optional filters.
    
    - **user_id**: Filter by user (admin only, otherwise returns current user's reservations)
    - **node_id**: Filter by node
    - **start_date**: Get reservations ending after this date
    - **end_date**: Get reservations starting before this date
    - **skip**: Pagination offset
    - **limit**: Maximum results
    
    Requires authentication.
    """
    # Non-admin users can only see their own reservations unless no user_id filter is specified
    if user_id is not None and not current_user.is_admin:
        if user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own reservations",
            )
    
    # If user_id is not specified and user is not admin, show only their reservations
    if user_id is None and not current_user.is_admin:
        user_id = current_user.id
    
    reservations = crud_reservation.get_reservations(
        db=db,
        user_id=user_id,
        node_id=node_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    
    return reservations


@router.get("/my", response_model=List[schemas.Reservation])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """
    Get all reservations for the current user.
    
    Requires authentication.
    """
    reservations = crud_reservation.get_reservations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    
    return reservations


@router.get("/{reservation_id}", response_model=schemas.Reservation)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific reservation by ID.
    
    Users can only view their own reservations unless they are admin.
    
    Requires authentication.
    """
    reservation = crud_reservation.get_reservation(db, reservation_id)
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    # Check authorization: user can only view their own reservations unless admin
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own reservations",
        )
    
    return reservation


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(
    reservation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Release/delete a reservation.
    
    Users can only delete their own reservations unless they are admin.
    
    Requires authentication.
    """
    client_ip = get_client_ip(request)
    
    # First, get the reservation to check ownership
    reservation = crud_reservation.get_reservation(db, reservation_id)
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    # Check authorization: user can only delete their own reservations unless admin
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reservations",
        )
    
    # Delete the reservation
    deleted = crud_reservation.delete_reservation(db, reservation_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    # Log reservation deletion
    audit_service.log_reservation_deleted(
        db=db,
        user_id=current_user.id,
        reservation_id=reservation_id,
        ip_address=client_ip,
    )
    
    return None
