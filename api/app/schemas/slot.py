import uuid
from datetime import datetime

from pydantic import BaseModel


class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    min_booking_notice_hours: int = 24


class SlotResponse(BaseModel):
    id: uuid.UUID
    volunteer_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    min_booking_notice_hours: int
    created_at: datetime

    model_config = {"from_attributes": True}