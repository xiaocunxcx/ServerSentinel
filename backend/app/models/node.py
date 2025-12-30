from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base

class Node(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    ip_address = Column(String(50), unique=True, nullable=False)
    ssh_port = Column(Integer, default=22, nullable=False)
    status = Column(String(50), default="offline")

    devices = relationship("Device", back_populates="node")
    reservations = relationship("Reservation", back_populates="node")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    device_index = Column(Integer, nullable=False)
    model_name = Column(String(100))
    node_id = Column(Integer, ForeignKey("nodes.id"))

    node = relationship("Node", back_populates="devices")
