from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


# Base User Schema
class UserBase(BaseModel):
    username: str
    email: EmailStr


# User Creation Schema
class UserCreate(UserBase):
    password: str


# User Response Schema
class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True


# SSH Key Schemas
class SSHKeyBase(BaseModel):
    public_key: str


class SSHKeyCreate(SSHKeyBase):
    pass


class SSHKey(SSHKeyBase):
    id: int
    fingerprint: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User with SSH Keys
class UserWithKeys(User):
    ssh_keys: List[SSHKey] = []

    class Config:
        from_attributes = True
