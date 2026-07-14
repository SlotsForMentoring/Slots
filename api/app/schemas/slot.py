import uuid
from datetime import datetime

from pydantic import BaseModel


class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    min_booking_notice_hours: int = 24


class BookingInfo(BaseModel):
    id: uuid.UUID
    trainee_name: str
    trainee_email: str
    trainee_profile_picture: str | None = None
    agenda: str | None
    status: str

    model_config = {"from_attributes": True}


class SlotResponse(BaseModel):
    id: uuid.UUID
    volunteer_id: uuid.UUID
    volunteer_name: str
    volunteer_profile_picture: str | None = None
    start_time: datetime
    end_time: datetime
    min_booking_notice_hours: int
    is_booked: bool
    booking: BookingInfo | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AvailableSlotResponse(BaseModel):
    id: uuid.UUID
    volunteer_name: str
    volunteer_profile_picture: str | None = None
    start_time: datetime
    end_time: datetime

    model_config = {"from_attributes": True}
