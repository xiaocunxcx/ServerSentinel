from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Device Schemas
class DeviceBase(BaseModel):
    device_index: int
    model_name: Optional[str] = None


class DeviceCreate(DeviceBase):
    pass


class Device(DeviceBase):
    id: int
    node_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Node Schemas
class NodeBase(BaseModel):
    name: str
    ip_address: str


class NodeCreate(NodeBase):
    ssh_port: int = 22


class NodeUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    ssh_port: Optional[int] = None
    status: Optional[str] = None


class Node(NodeBase):
    id: int
    status: str
    ssh_port: int = 22
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NodeWithDevices(Node):
    devices: List[Device] = []

    class Config:
        from_attributes = True
