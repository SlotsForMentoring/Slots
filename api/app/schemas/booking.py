import uuid
from datetime import datetime
from pydantic import BaseModel


class BookingCreate(BaseModel):
    slot_id: uuid.UUID
    agenda: str | None = None


class SlotInfo(BaseModel):
    id: uuid.UUID
    volunteer_name: str
    volunteer_profile_picture: str | None = None
    start_time: datetime
    end_time: datetime

    model_config = {"from_attributes": True}


class BookingResponse(BaseModel):
    id: uuid.UUID
    slot: SlotInfo
    trainee_name: str
    agenda: str | None
    status: str
    meet_link: str | None
    created_at: datetime

    model_config = {"from_attributes": True}