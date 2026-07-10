import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.booking import (
    create_booking,
    get_slot,
    set_meet_link,
)
from app.database import async_session
from app.models.booking import Booking
from app.services import calendar

logger = logging.getLogger(__name__)


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

async def create_meeting_and_store(
    booking_id: UUID,
    refresh_token: str | None,
    volunteer_name: str,
    volunteer_email: str,
    trainee_name: str,
    trainee_email: str,
    start_time: datetime,
    end_time: datetime,
) -> None:
    """Background task: create the Meet link and persist it on the booking.

    This runs after the booking's HTTP response has already been sent, so
    the request's DB session is closed by then - it opens its own. Never
    raises: a calendar/Meet failure must never surface once the booking
    itself has already succeeded, so failures are logged and swallowed.
    """
    meet_link = await calendar.create_pairing_event(
        refresh_token=refresh_token,
        volunteer_name=volunteer_name,
        volunteer_email=volunteer_email,
        trainee_name=trainee_name,
        trainee_email=trainee_email,
        start_time=start_time,
        end_time=end_time,
    )

    if meet_link is None:
        return

    try:
        async with async_session() as session:
            await set_meet_link(session, booking_id, meet_link)
    except Exception:
        logger.warning("Failed to store meet_link for booking %s", booking_id, exc_info=True)
