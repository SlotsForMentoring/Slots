from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, and_, func, cast
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.slots import Slot


async def create_slot(
    session: AsyncSession,
    volunteer_id: UUID,
    start_time: datetime,
    end_time: datetime,
    min_booking_notice_hours: int,
) -> Slot:
    slot = Slot(
        volunteer_id=volunteer_id,
        start_time=start_time,
        end_time=end_time,
        min_booking_notice_hours=min_booking_notice_hours,
    )
    session.add(slot)
    await session.commit()
    await session.refresh(slot)
    return slot


async def check_overlap(
    session: AsyncSession,
    volunteer_id: UUID,
    start_time: datetime,
    end_time: datetime,
) -> bool:
    result = await session.execute(
        select(Slot).where(
            and_(
                Slot.volunteer_id == volunteer_id,
                Slot.start_time < end_time,
                Slot.end_time > start_time,
            )
        )
    )
    return result.scalar_one_or_none() is not None


async def get_slots_by_volunteer(
    session: AsyncSession,
    volunteer_id: UUID,
    include_past: bool = False,
) -> list[Slot]:
    query = select(Slot).where(Slot.volunteer_id == volunteer_id)
    if not include_past:
        query = query.where(Slot.start_time > datetime.now(timezone.utc))
    result = await session.execute(query)
    return list(result.scalars().all())


async def delete_slot(
    session: AsyncSession,
    slot_id: UUID,
    volunteer_id: UUID,
) -> str:
    result = await session.execute(
        select(Slot).where(Slot.id == slot_id)
    )
    slot = result.scalar_one_or_none()

    if slot is None:
        return "not_found"

    if slot.volunteer_id != volunteer_id:
        return "not_yours"

    await session.delete(slot)
    await session.commit()
    return "deleted"


async def get_available_slots(
    session: AsyncSession,
) -> list[Slot]:
    now = datetime.now(timezone.utc)
    notice_interval = cast(
        func.concat(Slot.min_booking_notice_hours, " hours"),
        INTERVAL,
    )
    result = await session.execute(
        select(Slot).where(
            Slot.start_time > func.now() + notice_interval
        )
    )
    return list(result.scalars().all())
