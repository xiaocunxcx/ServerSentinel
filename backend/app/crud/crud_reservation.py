from datetime import datetime

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
