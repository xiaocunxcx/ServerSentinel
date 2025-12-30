"""
Node and device management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_admin, get_current_user
from app.core.database import get_db
from app.crud import crud_node
from app.models.user import User
from app.schemas.node import Device, DeviceCreate, Node, NodeCreate, NodeWithDevices
from app.services import node_service

router = APIRouter()


@router.get("/", response_model=List[NodeWithDevices])
def list_nodes(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all nodes with their devices.
    
    Requires authentication.
    """
    nodes = crud_node.get_nodes(db, skip=skip, limit=limit)
    return nodes


@router.get("/{node_id}", response_model=NodeWithDevices)
def get_node(
    node_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific node by ID.
    """
    node = crud_node.get_node(db, node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {node_id} not found",
        )
    return node


@router.post("/", response_model=Node, status_code=status.HTTP_201_CREATED)
def create_node(
    *,
    db: Session = Depends(get_db),
    node_in: NodeCreate,
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new node (server).
    
    Requires admin privileges.
    """
    try:
        node = node_service.create_node_with_validation(db, node_in)
        return node
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/{node_id}/devices", response_model=Device, status_code=status.HTTP_201_CREATED
)
def add_device(
    *,
    db: Session = Depends(get_db),
    node_id: int,
    device_in: DeviceCreate,
    current_user: User = Depends(get_current_active_admin),
):
    """
    Add a new device (NPU) to a node.
    
    Requires admin privileges.
    """
    try:
        device = node_service.add_device_to_node(db, node_id, device_in)
        return device
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
