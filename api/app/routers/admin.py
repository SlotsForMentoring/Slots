from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import users as crud
from app.database import get_db
from app.dependencies.auth import require_role
from app.models.user import User
from app.schemas.user import RoleUpdate, UserResponse
from app.services.booking import cancel_meeting

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    role: str | None = Query(None),
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    return await crud.get_all_users(session=session, role=role)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID,
    body: RoleUpdate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )

    target = await crud.get_user_by_id(session, user_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if target.role != body.role:
        cancels = await crud.reset_user_data(session, user_id, target.role)
        for c in cancels:
            background_tasks.add_task(
                cancel_meeting,
                refresh_token=c.refresh_token,
                event_id=c.event_id,
            )

    user = await crud.update_user_role(
        session=session, user_id=user_id, role=body.role
    )
    return user
