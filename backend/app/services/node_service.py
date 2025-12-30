"""
Node management service - handles business logic for nodes and devices.
"""
from sqlalchemy.orm import Session

from app.crud import crud_node
from app.schemas.node import DeviceCreate, NodeCreate


def create_node_with_validation(db: Session, node_data: NodeCreate):
    """Create a new node with validation."""
    # Check if node with same name already exists
    existing = crud_node.get_node_by_name(db, node_data.name)
    if existing:
        raise ValueError(f"Node with name '{node_data.name}' already exists")
    
    return crud_node.create_node(db, node_data)


def add_device_to_node(db: Session, node_id: int, device_data: DeviceCreate):
    """Add a device to a node with validation."""
    # Verify node exists
    node = crud_node.get_node(db, node_id)
    if not node:
        raise ValueError(f"Node with ID {node_id} not found")
    
    # Check if device index already exists for this node
    existing_devices = crud_node.get_node_devices(db, node_id)
    for device in existing_devices:
        if device.device_index == device_data.device_index:
            raise ValueError(
                f"Device with index {device_data.device_index} already exists on node {node_id}"
            )
    
    return crud_node.create_device(db, device_data, node_id)
