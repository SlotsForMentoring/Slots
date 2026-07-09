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
  |                          |  Receive:                |
  |                          |  - access_token (Google) |
  |                          |  - refresh_token (Google)|
  |                          |<-------------------------|
  |                          |                          |
  |                          |  Fetch userinfo with     |
  |                          |  Google access_token     |
  |                          |------------------------->|
  |                          |  { id, email, name }     |
  |                          |<-------------------------|
  |                          |                          |
  |                          |  Upsert user in DB       |
  |                          |  Save refresh_token      |
  |                          |  Generate app JWT        |
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

## OAuth scopes

```
openid email profile https://www.googleapis.com/auth/calendar.events
```

- `openid email profile` — get user identity and info
- `calendar.events` — create Google Calendar events with Meet links (used when a trainee books a slot)

## Tokens explained

| Token | What it does | Where it lives |
|-------|-------------|----------------|
| Google access_token | Call Google APIs (Calendar, etc.) | Not stored. Requested on demand using refresh_token |
| Google refresh_token | Get new access_tokens from Google | Stored in DB (`users.google_refresh_token`) |
| App JWT | Identify the user in our API | httpOnly cookie (`session_token`) |

Google only sends the refresh_token on the **first consent**. If the user logs in again, it comes as null. The code only updates the DB when it receives a non-null value to avoid overwriting.

## Cookie settings

Cookie settings are configurable via environment variables:

| Variable | Production | Local dev |
|----------|-----------|-----------|
| `COOKIE_SECURE` | `true` (requires HTTPS) | `false` (HTTP) |
| `COOKIE_SAMESITE` | `none` (cross-origin) | `lax` (same domain) |

Production needs `none`/`true` because frontend (Netlify) and backend (Railway) are on different domains.

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
crud/users.py         Upsert user and store refresh_token
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
- `COOKIE_SECURE` — `true` for production, `false` for local
- `COOKIE_SAMESITE` — `none` for production, `lax` for local
