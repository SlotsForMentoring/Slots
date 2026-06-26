from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import slots as crud
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.slot import SlotCreate, SlotResponse

router = APIRouter(prefix="/slots", tags=["slots"])

@router.post("", response_model=SlotResponse, status_code=status.HTTP_201_CREATED)
async def create_slot(
    body: SlotCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can create slots",
        )

    duration = body.end_time - body.start_time
    if duration.total_seconds() != 3600:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot duration must be exactly 1 hour",
        )

    if body.start_time < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot must be in the future",
        )

    overlap = await crud.check_overlap(
        session, current_user.id, body.start_time, body.end_time
    )
    if overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a slot at this time",
        )

    slot = await crud.create_slot(
        session=session,
        volunteer_id=current_user.id,
        start_time=body.start_time,
        end_time=body.end_time,
        min_booking_notice_hours=body.min_booking_notice_hours,
    )
    return slot

@router.get("/mine", response_model=list[SlotResponse])
async def get_my_slots(
    include_past: bool = False,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can view their slots",
        )
    slots = await crud.get_slots_by_volunteer(
        session=session,
        volunteer_id=current_user.id,
        include_past=include_past,
    )
    return slots

@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slot(
    slot_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can delete slots",
        )
    slot = await crud.delete_slot(
        session=session,
        slot_id=slot_id,
        volunteer_id=current_user.id,
    )
    if slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found or you don't own it",
        )
    
@router.get("/available", response_model=list[SlotResponse])
async def get_available_slots(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slots = await crud.get_available_slots(session=session)
    return slots