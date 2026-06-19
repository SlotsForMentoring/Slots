from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from app.config import settings
import httpx
import jwt
from datetime import datetime, timedelta, timezone
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

@router.get("/login")
async def login():
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(url=url)


@router.get("/callback")
async def callback(code: str):
    # 1. Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        tokens = token_response.json()

    access_token = tokens["access_token"]

    # 2. Fetch user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo = userinfo_response.json()

    # 3. Save user to database
    from app.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO users (google_id, email, name, profile_picture)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (google_id)
            DO UPDATE SET email = $2, name = $3, profile_picture = $4, updated_at = NOW()
            """,
            userinfo["id"],
            userinfo["email"],
            userinfo["name"],
            userinfo.get("picture"),
        )

    # 4. Generate JWT
    app_token = jwt.encode(
        {
            "google_id": userinfo["id"],
            "email": userinfo["email"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        },
        settings.app_jwt_secret,
        algorithm="HS256",
    )

    return {"token": app_token, "user": {"email": userinfo["email"], "name": userinfo["name"]}}




@router.get("/me")
async def me(user=Depends(get_current_user)):
    return user