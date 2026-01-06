from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base

class Node(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    ip_address = Column(String(50), unique=True, nullable=False)
    ssh_port = Column(Integer, default=22, nullable=False)
    status = Column(String(50), default="offline")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), 
                       onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    devices = relationship("Device", back_populates="node")
    reservations = relationship("Reservation", back_populates="node")

class Device(Base):
    __tablename__ = "devices"
    # 添加唯一约束：同一节点下不能有重复的 device_index
    __table_args__ = (
        UniqueConstraint('node_id', 'device_index', name='uq_node_device_index'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    device_index = Column(Integer, nullable=False)
    model_name = Column(String(100))
    node_id = Column(Integer, ForeignKey("nodes.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    node = relationship("Node", back_populates="devices")
