from datetime import datetime, timedelta, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.booking import (
    create_booking,
    get_slot,
)
from app.models.booking import Booking


async def book_slot(
    session: AsyncSession,
    slot_id: UUID,
    trainee_id: UUID,
    agenda: str | None,
) -> Booking:

    slot = await get_slot(session, slot_id)

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    now = datetime.now(timezone.utc)
    min_allowed = now + timedelta(hours=slot.min_booking_notice_hours)

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