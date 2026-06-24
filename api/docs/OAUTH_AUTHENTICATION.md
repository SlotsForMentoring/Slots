# Google OAuth 2.0 Authentication

## What it does

Users log in with their Google account. The server verifies their identity with Google, saves them in the database as `trainee`, and returns a JWT token. The frontend sends that token on every request to access protected endpoints.

## Sequence Diagram

```
Browser                    Server                     Google
  |                          |                          |
  |  GET /auth/login         |                          |
  |------------------------->|                          |
  |  302 Redirect            |                          |
  |<-------------------------|                          |
  |                          |                          |
  |  GET /o/oauth2/v2/auth?client_id=...               |
  |---------------------------------------------------->|
  |  Google consent screen   |                          |
  |<----------------------------------------------------|
  |  User clicks "Allow"     |                          |
  |---------------------------------------------------->|
  |                          |                          |
  |  302 Redirect to /auth/callback?code=abc123         |
  |<----------------------------------------------------|
  |                          |                          |
  |  GET /auth/callback?code=abc123                     |
  |------------------------->|                          |
  |                          |  POST /token (code)      |
  |                          |------------------------->|
  |                          |  { access_token }        |
  |                          |<-------------------------|
  |                          |  GET /userinfo            |
  |                          |------------------------->|
  |                          |  { id, email, name }     |
  |                          |<-------------------------|
  |                          |                          |
  |                          |  Upsert user in DB       |
  |                          |  (role = "trainee")      |
  |                          |  Generate JWT            |
  |                          |                          |
  |  { token, user }         |                          |
  |<-------------------------|                          |
  |                          |                          |
  |  GET /auth/me            |                          |
  |  Authorization: Bearer   |                          |
  |------------------------->|                          |
  |                          |  Decode JWT              |
  |                          |  Query user from DB      |
  |  { id, email, role, ...} |                          |
  |<-------------------------|                          |
```

## Endpoints

| Method | URL | Auth | Returns |
|--------|-----|------|---------|
| GET | `/auth/login` | No | Redirects to Google consent screen |
| GET | `/auth/callback?code=...` | No | `{ token, user }` |
| GET | `/auth/me` | Bearer token | `{ id, email, name, role, ... }` |

## How to protect a route

```python
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("/protected")
async def protected(user: User = Depends(get_current_user)):
    return {"email": user.email, "role": user.role}
```

`get_current_user` decodes the JWT and queries the database, so `user` always has fresh data (including updated roles).

## Code architecture

```
services/auth.py      Google OAuth logic + JWT creation (no HTTP, no DB)
crud/users.py         Upsert and query users (DB only, no HTTP)
dependencies/auth.py  Decode JWT + fetch user from DB (middleware)
routers/auth.py       Thin handler: calls services → crud → returns schema
```

## Environment variables

See `.env.example`. All are required:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console → Credentials
- `GOOGLE_REDIRECT_URI` — must match exactly in Google Cloud Console (`http://localhost:8000/auth/callback`)
- `APP_JWT_SECRET` — generate with `python3 -c "import secrets; print(secrets.token_hex(32))"`

## Testing the flow

1. Start server: `cd api && uv run uvicorn app.main:app --reload`
2. Open `http://localhost:8000/auth/login` in the browser
3. Log in with Google
4. Copy the `token` from the response
5. Test protected endpoint: `curl -H "Authorization: Bearer <token>" http://localhost:8000/auth/me`
