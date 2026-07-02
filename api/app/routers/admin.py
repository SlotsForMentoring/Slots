from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import users as crud
from app.database import get_db
from app.dependencies.auth import require_role
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    role: str | None = Query(None),
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    return await crud.get_all_users(session=session, role=role)
