from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models import node as node_models
from app.models import reservation as models
from app.schemas import reservation as schemas


def check_conflict(
    db: Session,
    node_id: int,
    start_time: datetime,
    end_time: datetime,
    device_ids: list[int] = None,
):
    """
    Checks for reservation conflicts.
    """
    # Check for overlapping time range
    time_overlap_filter = or_(
        and_(
            models.Reservation.start_time < end_time,
            models.Reservation.end_time > start_time,
        )
    )

    # Find all reservations for the given node within the time window
    conflicting_reservations = (
        db.query(models.Reservation)
        .filter(models.Reservation.node_id == node_id, time_overlap_filter)
        .all()
    )

    if not conflicting_reservations:
        return None  # No conflict

    for conflict in conflicting_reservations:
        # Case 1: Existing reservation is for the whole machine
        if conflict.type == models.ReservationType.MACHINE:
            return conflict  # Any new reservation conflicts with a full machine reservation

        # Case 2: New reservation is for the whole machine
        if not device_ids:
            return conflict  # A new full machine reservation conflicts with any existing reservation

        # Case 3: Both are device-level reservations, check for device ID intersection

        # Get device ids for the conflicting reservation
        conflicting_device_ids = {dev.id for dev in conflict.reserved_devices}

        if conflicting_device_ids.intersection(set(device_ids)):
            return conflict  # Found an overlapping device reservation

    return None


def create_reservation(
    db: Session, reservation: schemas.ReservationCreate, user_id: int
):
    # First, check for conflicts
    conflict = check_conflict(
        db,
        node_id=reservation.node_id,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        device_ids=reservation.device_ids,
    )
    if conflict:
        # A more specific error could be raised here
        raise ValueError(
            f"Reservation conflict with existing reservation ID: {conflict.id}"
        )

    # Create the base reservation object
    db_reservation = models.Reservation(
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        type=reservation.type,
        node_id=reservation.node_id,
        user_id=user_id,
    )

    # If it's a device-level reservation, associate the devices
    if reservation.type == models.ReservationType.DEVICE and reservation.device_ids:
        devices = (
            db.query(node_models.Device)
            .filter(
                node_models.Device.id.in_(reservation.device_ids),
                node_models.Device.node_id == reservation.node_id,
            )
            .all()
        )
        if len(devices) != len(reservation.device_ids):
            raise ValueError(
                "One or more device IDs are invalid or do not belong to the specified node."
            )
        db_reservation.reserved_devices.extend(devices)

    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def get_reservations(
    db: Session,
    user_id: Optional[int] = None,
    node_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Reservation]:
    """
    Get reservations with optional filters.
    
    Args:
        db: Database session
        user_id: Filter by user ID
        node_id: Filter by node ID
        start_date: Filter reservations that end after this date
        end_date: Filter reservations that start before this date
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
    
    Returns:
        List of Reservation objects
    """
    query = db.query(models.Reservation)
    
    if user_id is not None:
        query = query.filter(models.Reservation.user_id == user_id)
    
    if node_id is not None:
        query = query.filter(models.Reservation.node_id == node_id)
    
    if start_date is not None:
        # Get reservations that end after start_date
        query = query.filter(models.Reservation.end_time > start_date)
    
    if end_date is not None:
        # Get reservations that start before end_date
        query = query.filter(models.Reservation.start_time < end_date)
    
    return query.order_by(models.Reservation.start_time.desc()).offset(skip).limit(limit).all()


def get_reservation(db: Session, reservation_id: int) -> Optional[models.Reservation]:
    """Get a single reservation by ID."""
    return db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()


def delete_reservation(db: Session, reservation_id: int, user_id: Optional[int] = None) -> bool:
    """
    Delete a reservation.
    
    Args:
        db: Database session
        reservation_id: ID of the reservation to delete
        user_id: If provided, only delete if the reservation belongs to this user
    
    Returns:
        True if deleted, False if not found or not authorized
    """
    query = db.query(models.Reservation).filter(models.Reservation.id == reservation_id)
    
    if user_id is not None:
        query = query.filter(models.Reservation.user_id == user_id)
    
    reservation = query.first()
    
    if reservation:
        db.delete(reservation)
        db.commit()
        return True
    
    return False


def get_active_reservations(
    db: Session, node_id: Optional[int] = None
) -> list[models.Reservation]:
    """
    Get all currently active reservations.
    
    Args:
        db: Database session
        node_id: Optional filter by node ID
    
    Returns:
        List of active Reservation objects
    """
    now = datetime.now(timezone.utc)
    
    query = db.query(models.Reservation).filter(
        models.Reservation.start_time <= now,
        models.Reservation.end_time > now,
    )
    
    if node_id is not None:
        query = query.filter(models.Reservation.node_id == node_id)
    
    return query.all()
