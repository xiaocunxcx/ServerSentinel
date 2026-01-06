from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import crud_stats
from app.schemas import stats as stats_schemas

router = APIRouter()

@router.get(
    "/history/reservations", response_model=List[stats_schemas.ReservationHistory]
)
def get_reservation_history(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    node_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
):
    """
    Retrieve reservation history with filters.
    """
    history = crud_stats.get_reservation_history(
        db=db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        node_id=node_id,
        start_time=start_time,
        end_time=end_time,
    )
    return history


@router.get("/stats/utilization", response_model=stats_schemas.UtilizationStats)
def get_utilization_stats(
    db: Session = Depends(get_db),
    period: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    node_id: Optional[int] = None,
):
    """
    Get resource utilization statistics.
    """
    stats = crud_stats.get_utilization_stats(db=db, period=period, node_id=node_id)
    return {"period_type": period, "stats": stats}


@router.get("/stats/users", response_model=stats_schemas.UserStats)
def get_user_stats(db: Session = Depends(get_db)):
    """
    Get usage statistics per user.
    """
    reports = crud_stats.get_user_stats(db=db)
    # Map the raw results to the Pydantic schema
    user_reports = [
        stats_schemas.UserReport(
            user_id=r.id,
            user_email=r.email,
            total_reservations=r.total_reservations,
            total_usage_hours=r.total_usage_hours or 0.0,
        )
        for r in reports
        ) for r in reports
    ]
    return {"reports": user_reports}
