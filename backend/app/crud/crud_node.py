from typing import Optional

from sqlalchemy.orm import Session

from app.models.node import Device, Node
from app.schemas.node import DeviceCreate, NodeCreate, NodeUpdate


def get_node(db: Session, node_id: int) -> Optional[Node]:
    """Get node by ID."""
    return db.query(Node).filter(Node.id == node_id).first()


def get_node_by_name(db: Session, name: str) -> Optional[Node]:
    """Get node by name."""
    return db.query(Node).filter(Node.name == name).first()


def get_nodes(db: Session, skip: int = 0, limit: int = 100) -> list[Node]:
    """Get all nodes."""
    return db.query(Node).offset(skip).limit(limit).all()


def create_node(db: Session, node: NodeCreate) -> Node:
    """Create a new node."""
    db_node = Node(
        name=node.name,
        ip_address=node.ip_address,
        ssh_port=node.ssh_port,
        status="offline",  # Default status
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node


def update_node(db: Session, node_id: int, node_update: NodeUpdate) -> Optional[Node]:
    """Update node information."""
    db_node = get_node(db, node_id)
    if not db_node:
        return None
    
    update_data = node_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_node, field, value)
    
    db.commit()
    db.refresh(db_node)
    return db_node


def create_device(db: Session, device: DeviceCreate, node_id: int) -> Device:
    """Create a new device for a node."""
    db_device = Device(
        device_index=device.device_index,
        model_name=device.model_name,
        node_id=node_id,
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


def get_node_devices(db: Session, node_id: int) -> list[Device]:
    """Get all devices for a node."""
    return db.query(Device).filter(Device.node_id == node_id).all()
