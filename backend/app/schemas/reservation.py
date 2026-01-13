from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.reservation import ReservationType
from app.schemas.node import Device


# Base properties shared by all reservation schemas
class ReservationBase(BaseModel):
    node_id: int
    start_time: datetime
    end_time: datetime
    type: ReservationType


# Properties to receive on reservation creation
class ReservationCreate(ReservationBase):
    device_ids: Optional[List[int]] = None


# Properties to return to client
class Reservation(ReservationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    reserved_devices: List[Device] = []

    class Config:
        from_attributes = True  # Changed from orm_mode for Pydantic v2
