from datetime import datetime, timedelta

from sqlalchemy import func, text
from sqlalchemy.orm import Session, joinedload

from app.models import node as node_models
from app.models import reservation as reservation_models
from app.models import user as user_models


def get_reservation_history(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    node_id: int = None,
    start_time: datetime = None,
    end_time: datetime = None,
):
    """
    Get all reservation history with optional filters.
    """
    query = (
        db.query(reservation_models.Reservation)
        .options(
            joinedload(reservation_models.Reservation.user),
            joinedload(reservation_models.Reservation.node),
        )
        .order_by(reservation_models.Reservation.start_time.desc())
    )

    if user_id:
        query = query.filter(reservation_models.Reservation.user_id == user_id)
    if node_id:
        query = query.filter(reservation_models.Reservation.node_id == node_id)
    if start_time:
        query = query.filter(reservation_models.Reservation.start_time >= start_time)
    if end_time:
        query = query.filter(reservation_models.Reservation.end_time <= end_time)

    return query.offset(skip).limit(limit).all()


def get_utilization_stats(db: Session, period: str, node_id: int = None):
    """
    Get utilization stats. Period can be 'daily', 'weekly', 'monthly'.
    """
    # This is a simplified example. Real-world queries would be more complex,
    # especially with different database backends.
    # We will calculate reserved hours and divide by total hours in the period.

    total_hours_in_period = 24.0
    if period == "weekly":
        total_hours_in_period *= 7
    elif period == "monthly":
        total_hours_in_period *= 30  # Approximation

    # For simplicity, we'll just return a dummy value.
    # A real implementation would require complex SQL queries.
    return [{"label": "Total", "utilization": 0.0}]


def get_user_stats(db: Session):
    """
    Get stats for each user.
    """
    query = (
        db.query(
            user_models.User.id,
            user_models.User.email,
            func.count(reservation_models.Reservation.id).label("total_reservations"),
            func.sum(
                func.extract(
                    "epoch",
                    reservation_models.Reservation.end_time
                    - reservation_models.Reservation.start_time,
                )
                / 3600
            ).label("total_usage_hours"),
        )
        .join(reservation_models.Reservation)
        .group_by(user_models.User.id)
    )

    results = query.all()
    # Pydantic schema will handle the conversion
    return results
