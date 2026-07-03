# Google OAuth 2.0 Authentication

## Flow

```
Browser                    Server                     Google
  |                          |                          |
  |  GET /auth/login         |                          |
  |------------------------->|                          |
  |  302 → Google consent    |                          |
  |<-------------------------|                          |
  |                          |                          |
  |  User authorizes         |                          |
  |---------------------------------------------------->|
  |                          |                          |
  |  302 → /auth/callback?code=abc123                   |
  |<----------------------------------------------------|
  |                          |                          |
  |  GET /auth/callback?code=abc123                     |
  |------------------------->|                          |
  |                          |  Exchange code for token |
  |                          |------------------------->|
  |                          |  Fetch userinfo          |
  |                          |------------------------->|
  |                          |  { id, email, name }     |
  |                          |<-------------------------|
  |                          |                          |
  |                          |  Upsert user in DB       |
  |                          |  Generate JWT            |
  |                          |  Set httpOnly cookie     |
  |                          |                          |
  |  302 → frontend (cookie set)                        |
  |<-------------------------|                          |
  |                          |                          |
  |  GET /auth/me (cookie)   |                          |
  |------------------------->|                          |
  |  { id, email, role, ...} |                          |
  |<-------------------------|                          |
```

## Endpoints

| Method | URL | Auth | Returns |
|--------|-----|------|---------|
| GET | `/auth/login` | No | Redirects to Google consent screen |
| GET | `/auth/callback?code=...` | No | Sets httpOnly cookie, redirects to frontend |
| GET | `/auth/me` | Cookie | `{ id, email, name, role, ... }` |
| POST | `/auth/logout` | No | Clears the cookie |

## Auth mechanism

The JWT travels in an **httpOnly cookie** (`access_token`), not in an Authorization header. The browser sends it automatically on every request. The frontend never reads or stores the token — it only stores the user object (via Zustand) after calling `/auth/me`.

Cookie settings: `httponly=True`, `samesite=lax`, `secure=False` (localhost only — must be `True` in production).

## How to protect a route

```python
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("/protected")
async def protected(user: User = Depends(get_current_user)):
    return {"email": user.email, "role": user.role}
```

For role-restricted routes, use `require_role`:

```python
from app.dependencies.auth import require_role

@router.get("/admin-only")
async def admin_only(_user: User = Depends(require_role("admin"))):
    ...
```

## Code architecture

```
services/auth.py      Google OAuth logic + JWT creation
crud/users.py         Upsert and query users
dependencies/auth.py  Read JWT from cookie, decode, fetch user
routers/auth.py       Login redirect, callback with cookie, logout
```

## Environment variables

See `.env.example`. All required:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google Cloud Console → Credentials
- `GOOGLE_REDIRECT_URI` — must match Google Console (`http://localhost:8000/auth/callback`)
- `APP_JWT_SECRET` — generate: `python3 -c "import secrets; print(secrets.token_hex(32))"`
- `FRONTEND_URL` — where to redirect after login (`http://localhost:5173`)
- `ADMIN_EMAIL` — first user with this email gets `admin` role automatically
