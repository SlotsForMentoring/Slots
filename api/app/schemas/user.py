import uuid
from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    profile_picture: str | None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthCallbackResponse(BaseModel):
    token: str
    user: UserResponse
