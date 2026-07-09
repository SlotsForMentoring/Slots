from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking
from app.models.slots import Slot


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

async def set_meet_link(session: AsyncSession, booking_id: UUID, meet_link: str) -> None:
    result = await session.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        return

    booking.meet_link = meet_link
    await session.commit()

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