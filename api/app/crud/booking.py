from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking
from app.models.slots import Slot


async def get_slot(session: AsyncSession, slot_id):
    result = await session.execute(
        select(Slot).where(Slot.id == slot_id)
    )
    return result.scalar_one_or_none()


async def get_booking_by_slot(session: AsyncSession, slot_id):
    result = await session.execute(
        select(Booking).where(Booking.slot_id == slot_id)
    )
    return result.scalar_one_or_none()


async def create_booking(session: AsyncSession, slot_id, trainee_id, agenda):
    booking = Booking(
        slot_id=slot_id,
        trainee_id=trainee_id,
        agenda=agenda,
    )

    session.add(booking)
    await session.commit()
    await session.refresh(booking)
    return booking