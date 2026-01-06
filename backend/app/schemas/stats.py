from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# Schema for a single reservation record in the history
class ReservationHistory(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    node_id: int
    user_id: int
    # Add user and node details for richer context
    user_email: str = Field(..., alias="user.email")
    node_name: str = Field(..., alias="node.name")

    class Config:
        from_attributes = True
        populate_by_name = True


# Schema for utilization statistics
class UtilizationStat(BaseModel):
    # e.g., '2024-01-01', or 'Node A'
    label: str
    # Percentage
    utilization: float


class UtilizationStats(BaseModel):
    # Daily, Weekly, Monthly
    period_type: str
    stats: List[UtilizationStat]


# Schema for user-specific report
class UserReport(BaseModel):
    user_id: int
    user_email: str
    total_reservations: int
    total_usage_hours: float


class UserStats(BaseModel):
    reports: List[UserReport]
