from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


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
