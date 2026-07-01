from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.crud.bookings import (
    get_slot,
    create_booking,
)
from app.config import settings


async def book_slot(session, slot_id, trainee_id, agenda):

    slot = await get_slot(session, slot_id)

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    now = datetime.now(timezone.utc)
    min_allowed = now + timedelta(hours=settings.min_notice_hours)

    if slot.start_time <= min_allowed:
        raise HTTPException(
            status_code=422,
            detail="Booking window has passed"
        )

    try:
        return await create_booking(
            session,
            slot_id,
            trainee_id,
            agenda,
        )

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Slot is already booked"
        )