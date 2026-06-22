from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from httpx import HTTPStatusError
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import upsert_user
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import AuthCallbackResponse, UserResponse
from app.services.auth import (
    create_access_token,
    exchange_code_for_userinfo,
    get_google_auth_url,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login():
    return RedirectResponse(url=get_google_auth_url())


@router.get("/callback", response_model=AuthCallbackResponse)
async def callback(code: str, session: AsyncSession = Depends(get_db)):
    try:
        userinfo = await exchange_code_for_userinfo(code)
    except HTTPStatusError:
        raise HTTPException(status_code=502, detail="Failed to authenticate with Google")

    user = await upsert_user(
        session=session,
        google_id=userinfo["id"],
        email=userinfo["email"],
        name=userinfo["name"],
        profile_picture=userinfo.get("picture"),
    )

    token = create_access_token(user.id, user.email, user.role)
    return AuthCallbackResponse(token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
