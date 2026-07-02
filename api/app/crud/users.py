from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


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
) -> User:
    user = await get_user_by_google_id(session, google_id)
    if user is None:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            profile_picture=profile_picture,
        )
        session.add(user)
    else:
        user.email = email
        user.name = name
        user.profile_picture = profile_picture
    await session.commit()
    await session.refresh(user)
    return user
