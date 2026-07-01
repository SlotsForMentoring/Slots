from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.models.booking import Booking
from app.models.slots import Slot
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking import book_slot

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    body: BookingCreate,
    user: User = Depends(require_role("trainee")),
    session: AsyncSession = Depends(get_db),
):
    return await book_slot(
        session,
        body.slot_id,
        user.id,
        body.agenda,
    )


@router.get("/mine", response_model=list[BookingResponse])
async def my_bookings(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if user.role == "trainee":
        query = select(Booking).where(Booking.trainee_id == user.id)
    else:
        query = (
            select(Booking)
            .join(Slot, Booking.slot_id == Slot.id)
            .where(Slot.volunteer_id == user.id)
        )

    result = await session.execute(query)
    return result.scalars().all()
