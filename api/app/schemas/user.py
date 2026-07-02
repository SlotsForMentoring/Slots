import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class Role(StrEnum):
    TRAINEE = "trainee"
    VOLUNTEER = "volunteer"
    ADMIN = "admin"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    profile_picture: str | None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RoleUpdate(BaseModel):
    role: Role


class AuthCallbackResponse(BaseModel):
    token: str
    user: UserResponse
