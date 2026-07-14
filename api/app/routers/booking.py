from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User
from app.models.booking import Booking
from app.models.slots import Slot
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking import book_slot, create_meeting_and_store, cancel_meeting
from app.crud.booking import delete_booking

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    body: BookingCreate,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_role("trainee")),
    session: AsyncSession = Depends(get_db),
):
    booking = await book_slot(
        session,
        body.slot_id,
        user.id,
        body.agenda,
    )

    volunteer = booking.slot.volunteer
    background_tasks.add_task(
        create_meeting_and_store,
        booking_id=booking.id,
        refresh_token=volunteer.google_refresh_token,
        volunteer_name=volunteer.name,
        volunteer_email=volunteer.email,
        trainee_name=booking.trainee.name,
        trainee_email=booking.trainee.email,
        start_time=booking.slot.start_time,
        end_time=booking.slot.end_time,
    )

    return booking


@router.delete("/{booking_id}", status_code=204)
async def cancel_booking(
    booking_id: UUID,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await delete_booking(session, booking_id, user)

    if result.status == "not_found":
        raise HTTPException(status_code=404, detail="Booking not found")
    if result.status == "forbidden":
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    background_tasks.add_task(
        cancel_meeting,
        refresh_token=result.volunteer_refresh_token,
        event_id=result.event_id,
    )


@router.get("/mine", response_model=list[BookingResponse])
async def my_bookings(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    status: str | None = None,
):
    opts = [
        selectinload(Booking.slot).selectinload(Slot.volunteer),
        selectinload(Booking.trainee),
    ]

    if user.role == "trainee":
        query = (
            select(Booking)
            .where(Booking.trainee_id == user.id)
            .options(*opts)
        )
    else:
        query = (
            select(Booking)
            .join(Slot, Booking.slot_id == Slot.id)
            .where(Slot.volunteer_id == user.id)
            .options(*opts)
        )

    if status:
        query = query.where(Booking.status == status)

    result = await session.execute(query)
    return result.scalars().all()
