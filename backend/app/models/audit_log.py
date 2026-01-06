from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditLog(Base):
    """
    审计日志表，记录所有关键操作
    符合 design.md 第 3.2 节的要求
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # 可为NULL，用于系统操作
    action = Column(String(50), nullable=False)  # 操作类型，如 "create_reservation", "delete_reservation"
    resource_type = Column(String(50), nullable=False)  # 资源类型，如 "reservation", "node", "user"
    resource_id = Column(Integer, nullable=True)  # 资源ID
    details = Column(JSON, nullable=True)  # 详细信息，JSON格式
    ip_address = Column(String(45), nullable=True)  # 客户端IP地址（支持IPv4和IPv6）
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # 关联用户
    user = relationship("User")
