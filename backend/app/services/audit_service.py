"""
Audit logging service - handles audit log creation for all critical operations.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """
    Create an audit log entry.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action (None for system actions)
        action: Action type (e.g., "create_reservation", "delete_ssh_key")
        resource_type: Type of resource (e.g., "reservation", "ssh_key", "node")
        resource_id: ID of the affected resource
        details: Additional details as a dictionary
        ip_address: Client IP address
    
    Returns:
        Created AuditLog instance
    """
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    
    return audit_log


def log_user_login(
    db: Session,
    user_id: int,
    ip_address: Optional[str] = None,
    success: bool = True,
) -> AuditLog:
    """Log user login attempt."""
    return log_action(
        db=db,
        user_id=user_id,
        action="user_login" if success else "user_login_failed",
        resource_type="user",
        resource_id=user_id,
        details={"success": success},
        ip_address=ip_address,
    )


def log_reservation_created(
    db: Session,
    user_id: int,
    reservation_id: int,
    node_id: int,
    reservation_type: str,
    start_time: str,
    end_time: str,
    device_ids: Optional[list] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log reservation creation."""
    details = {
        "node_id": node_id,
        "type": reservation_type,
        "start_time": start_time,
        "end_time": end_time,
    }
    
    if device_ids:
        details["device_ids"] = device_ids
    
    return log_action(
        db=db,
        user_id=user_id,
        action="create_reservation",
        resource_type="reservation",
        resource_id=reservation_id,
        details=details,
        ip_address=ip_address,
    )


def log_reservation_deleted(
    db: Session,
    user_id: int,
    reservation_id: int,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log reservation deletion/release."""
    return log_action(
        db=db,
        user_id=user_id,
        action="delete_reservation",
        resource_type="reservation",
        resource_id=reservation_id,
        ip_address=ip_address,
    )


def log_ssh_key_created(
    db: Session,
    user_id: int,
    key_id: int,
    fingerprint: str,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log SSH key creation."""
    return log_action(
        db=db,
        user_id=user_id,
        action="create_ssh_key",
        resource_type="ssh_key",
        resource_id=key_id,
        details={"fingerprint": fingerprint},
        ip_address=ip_address,
    )


def log_ssh_key_deleted(
    db: Session,
    user_id: int,
    key_id: int,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log SSH key deletion."""
    return log_action(
        db=db,
        user_id=user_id,
        action="delete_ssh_key",
        resource_type="ssh_key",
        resource_id=key_id,
        ip_address=ip_address,
    )


def log_node_created(
    db: Session,
    user_id: int,
    node_id: int,
    node_name: str,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log node creation (admin action)."""
    return log_action(
        db=db,
        user_id=user_id,
        action="create_node",
        resource_type="node",
        resource_id=node_id,
        details={"name": node_name},
        ip_address=ip_address,
    )


def log_device_created(
    db: Session,
    user_id: int,
    device_id: int,
    node_id: int,
    device_index: int,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Log device creation (admin action)."""
    return log_action(
        db=db,
        user_id=user_id,
        action="create_device",
        resource_type="device",
        resource_id=device_id,
        details={"node_id": node_id, "device_index": device_index},
        ip_address=ip_address,
    )
