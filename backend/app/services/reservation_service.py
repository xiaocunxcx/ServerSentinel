"""
Reservation service - handles business logic for resource reservations.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.crud import crud_node, crud_reservation
from app.models.reservation import ReservationType
from app.schemas.reservation import ReservationCreate


def create_reservation(
    db: Session, reservation_data: ReservationCreate, user_id: int
):
    """
    Create a reservation with full validation.
    
    Validates:
    - Node exists
    - Device IDs are valid and belong to the node
    - No time conflicts exist
    """
    # Validate node exists
    node = crud_node.get_node(db, reservation_data.node_id)
    if not node:
        raise ValueError(f"Node with ID {reservation_data.node_id} not found")
    
    # If device-level reservation, validate devices
    if reservation_data.type == ReservationType.DEVICE:
        if not reservation_data.device_ids:
            raise ValueError("Device IDs must be provided for device-level reservations")
        
        # Get all devices for this node
        node_devices = crud_node.get_node_devices(db, reservation_data.node_id)
        node_device_ids = {device.id for device in node_devices}
        
        # Validate all requested device IDs belong to this node
        for device_id in reservation_data.device_ids:
            if device_id not in node_device_ids:
                raise ValueError(
                    f"Device {device_id} does not belong to node {reservation_data.node_id}"
                )
    
    # Create the reservation (includes conflict checking)
    return crud_reservation.create_reservation(db, reservation_data, user_id)


def get_active_reservations(db: Session, node_id: Optional[int] = None):
    """
    Get all currently active reservations, optionally filtered by node.
    
    Args:
        db: Database session
        node_id: Optional node ID to filter by
    
    Returns:
        List of active reservations
    """
    return crud_reservation.get_active_reservations(db, node_id)
