from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from httpx import HTTPStatusError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.crud.users import upsert_user
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.auth import (
    create_access_token,
    exchange_code_for_userinfo,
    get_google_auth_url,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login():
    return RedirectResponse(url=get_google_auth_url())


@router.get("/callback")
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
    response = RedirectResponse(url=settings.frontend_url, status_code=302)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=86400,
    )
    return response


@router.post("/logout")
async def logout():
    response = Response(status_code=200)
    response.delete_cookie(key="access_token")
    return response


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
