from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.reservation import ReservationType


# Base properties shared by all reservation schemas
class ReservationBase(BaseModel):
    node_id: int
    start_time: datetime
    end_time: datetime


# Properties to receive on reservation creation
class ReservationCreate(ReservationBase):
    type: ReservationType
    device_ids: Optional[List[int]] = None


# Properties to return to client
class Reservation(ReservationBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True  # Changed from orm_mode for Pydantic v2
