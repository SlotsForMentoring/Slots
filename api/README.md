# Pair Scheduling API

Backend for the Pair Scheduling platform. Volunteers offer 1:1 time slots, trainees book them.

## Stack

- **Python 3.12** + **FastAPI**
- **SQLAlchemy 2.0** async ORM + **Alembic** migrations
- **PostgreSQL** on Supabase
- **Google OAuth** (no passwords)
- **JWT** in httpOnly cookie for session
- **uv** for package management

## Setup

```bash
cd api

# Install dependencies
uv sync

# Copy env file and fill in values
cp .env.example .env
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from Supabase dashboard) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (`http://localhost:8000/auth/callback` for local) |
| `APP_JWT_SECRET` | Secret for signing JWTs. Generate with `openssl rand -hex 32` |
| `FRONTEND_URL` | Frontend URL for OAuth redirect (default: `http://localhost:5173`) |
| `CORS_ORIGINS` | Allowed origins, comma-separated (default: `http://localhost:5173`) |
| `ADMIN_EMAIL` | Email that gets admin role on first login (optional) |
| `COOKIE_SECURE` | `true` for production (HTTPS), `false` for local (HTTP) |
| `COOKIE_SAMESITE` | `none` for production (cross-origin), `lax` for local |

## Run

```bash
uv run uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Docs at `/docs` (Swagger) or `/redoc`.

## Tests

```bash
uv run pytest
```

## Migrations

We use Alembic for database migrations.

```bash
# Apply all migrations
uv run alembic upgrade head

# Create a new migration after model changes
uv run alembic revision --autogenerate -m "description"
```

## Project structure

```
api/
├── app/
│   ├── main.py              # FastAPI app, middleware, CORS
│   ├── config.py            # Settings from env vars (pydantic-settings)
│   ├── database.py          # SQLAlchemy async engine and session
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── crud/                # Database queries
│   ├── services/            # Business logic
│   ├── routers/             # API route handlers
│   └── dependencies/        # Auth middleware (JWT from cookie)
├── alembic/                 # Migration files
├── tests/                   # pytest test suite
├── .env.example             # Required environment variables
└── pyproject.toml           # Dependencies
```

## Auth flow

1. User clicks login → redirects to Google OAuth
2. Google redirects back to `/auth/callback` with a code
3. Backend exchanges code for user info, creates a JWT
4. JWT is set as httpOnly cookie → redirects to frontend
5. Frontend calls `/auth/me` (cookie travels automatically)
6. Logout clears the cookie

## Roles

- **trainee** — default role, can browse and book slots
- **volunteer** — can create and manage time slots
- **admin** — can change user roles
