import uuid
from datetime import datetime
from pydantic import BaseModel


class BookingCreate(BaseModel):
    slot_id: uuid.UUID
    agenda: str | None = None


class SlotInfo(BaseModel):
    id: uuid.UUID
    volunteer_name: str
    start_time: datetime
    end_time: datetime


class BookingResponse(BaseModel):
    id: uuid.UUID
    slot: SlotInfo
    trainee_name: str
    agenda: str | None
    status: str
    created_at: datetime