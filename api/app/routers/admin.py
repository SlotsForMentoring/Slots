from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import users as crud
from app.database import get_db
from app.dependencies.auth import require_role
from app.models.user import User
from app.schemas.user import RoleUpdate, UserResponse

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
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    user = await crud.update_user_role(
        session=session, user_id=user_id, role=body.role
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
