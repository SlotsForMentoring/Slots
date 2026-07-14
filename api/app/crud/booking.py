from dataclasses import dataclass
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking
from app.models.slots import Slot
from app.models.user import User


@dataclass
class CancelResult:
    """What the router needs to respond to the request and, on success,
    schedule the Google Calendar cancellation background task."""
    status: str  # "not_found" | "forbidden" | "deleted"
    event_id: str | None = None
    volunteer_refresh_token: str | None = None


async def get_slot(session: AsyncSession, slot_id: UUID) -> Slot | None:
    result = await session.execute(
        select(Slot).where(Slot.id == slot_id)
    )
    return result.scalar_one_or_none()


async def get_booking_by_slot(session: AsyncSession, slot_id: UUID) -> Booking | None:
    result = await session.execute(
        select(Booking).where(Booking.slot_id == slot_id)
    )
    return result.scalar_one_or_none()


async def set_calendar_info(
    session: AsyncSession,
    booking_id: UUID,
    meet_link: str | None,
    event_id: str | None,
) -> None:
    result = await session.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        return

    booking.meet_link = meet_link
    booking.event_id = event_id
    await session.commit()


async def delete_booking(
    session: AsyncSession,
    booking_id: UUID,
    user: User,
) -> CancelResult:
    """Cancel a booking on behalf of either the trainee who made it or the
    volunteer whose slot it belongs to - either side of the session should
    be able to back out of it."""
    result = await session.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.slot).selectinload(Slot.volunteer))
    )
    booking = result.scalar_one_or_none()

    if booking is None:
        return CancelResult(status="not_found")

    is_trainee_owner = booking.trainee_id == user.id
    is_volunteer_owner = booking.slot.volunteer_id == user.id

    if not (is_trainee_owner or is_volunteer_owner):
        return CancelResult(status="forbidden")

    event_id = booking.event_id
    volunteer_refresh_token = booking.slot.volunteer.google_refresh_token

    await session.delete(booking)
    await session.commit()

    return CancelResult(
        status="deleted",
        event_id=event_id,
        volunteer_refresh_token=volunteer_refresh_token,
    )


async def create_booking(
    session: AsyncSession,
    slot_id: UUID,
    trainee_id: UUID,
    agenda: str | None,
) -> Booking:
    booking = Booking(
        slot_id=slot_id,
        trainee_id=trainee_id,
        agenda=agenda,
    )

    session.add(booking)
    await session.commit()

    result = await session.execute(
        select(Booking)
        .where(Booking.id == booking.id)
        .options(
            selectinload(Booking.slot).selectinload(Slot.volunteer),
            selectinload(Booking.trainee),
        )
    )
    return result.scalar_one()