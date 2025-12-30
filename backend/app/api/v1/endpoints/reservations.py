from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas import reservation as schemas
from app.services import reservation_service

router = APIRouter()


@router.post("/", response_model=schemas.Reservation)
def create_reservation(
    *,
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
    try:
        reservation = reservation_service.create_reservation(
            db=db, reservation_data=reservation_in, user_id=current_user.id
        )
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        # Catch-all for other potential errors
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
