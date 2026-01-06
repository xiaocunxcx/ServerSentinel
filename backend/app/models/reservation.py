import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class ReservationType(str, enum.Enum):
    MACHINE = "machine"
    DEVICE = "device"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    type = Column(Enum(ReservationType), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), 
                       onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    node_id = Column(Integer, ForeignKey("nodes.id"))

    user = relationship("User", back_populates="reservations")
    node = relationship("Node", back_populates="reservations")

    # For device-level reservations
    reserved_devices = relationship("Device", secondary="reservation_devices")


class ReservationDevice(Base):
    __tablename__ = "reservation_devices"
    reservation_id = Column(Integer, ForeignKey("reservations.id"), primary_key=True)
    device_id = Column(Integer, ForeignKey("devices.id"), primary_key=True)
