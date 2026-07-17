from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.booking import Booking
from app.models.slots import Slot
from app.models.user import User


@dataclass
class CalendarCancel:
    event_id: str | None
    refresh_token: str | None


async def get_all_users(
    session: AsyncSession,
    role: str | None = None,
) -> list[User]:
    query = select(User).order_by(User.created_at)
    if role is not None:
        query = query.where(User.role == role)
    result = await session.execute(query)
    return list(result.scalars().all())


async def update_user_role(
    session: AsyncSession,
    user_id: UUID,
    role: str,
) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        return None
    user.role = role
    await session.commit()
    await session.refresh(user)
    return user


async def reset_user_data(
    session: AsyncSession,
    user_id: UUID,
    old_role: str,
) -> list[CalendarCancel]:
    cancels: list[CalendarCancel] = []

    if old_role == "trainee":
        result = await session.execute(
            select(Booking)
            .where(Booking.trainee_id == user_id)
            .options(selectinload(Booking.slot).selectinload(Slot.volunteer))
        )
        bookings = list(result.scalars().all())
        for booking in bookings:
            cancels.append(CalendarCancel(
                event_id=booking.event_id,
                refresh_token=booking.slot.volunteer.google_refresh_token,
            ))
            await session.delete(booking)

    elif old_role == "volunteer":
        result = await session.execute(
            select(Slot)
            .where(Slot.volunteer_id == user_id)
            .options(selectinload(Slot.booking), selectinload(Slot.volunteer))
        )
        slots = list(result.scalars().all())
        for slot in slots:
            if slot.booking:
                cancels.append(CalendarCancel(
                    event_id=slot.booking.event_id,
                    refresh_token=slot.volunteer.google_refresh_token,
                ))
                await session.delete(slot.booking)
            await session.delete(slot)

    await session.flush()
    return cancels


async def get_user_by_id(session: AsyncSession, user_id: UUID) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_google_id(session: AsyncSession, google_id: str) -> User | None:
    result = await session.execute(
        select(User).where(User.google_id == google_id)
    )
    return result.scalar_one_or_none()


async def upsert_user(
    session: AsyncSession,
    google_id: str,
    email: str,
    name: str,
    profile_picture: str | None,
    google_refresh_token: str | None = None
) -> User:
    user = await get_user_by_google_id(session, google_id)
    if user is None:
        role = "admin" if settings.admin_email and email == settings.admin_email else "trainee"
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            profile_picture=profile_picture,
            role=role,
            google_refresh_token=google_refresh_token
        )
        session.add(user)
    else:
        user.email = email
        user.name = name
        user.profile_picture = profile_picture
        if google_refresh_token is not None:
            user.google_refresh_token = google_refresh_token
    await session.commit()
    await session.refresh(user)
    return user
