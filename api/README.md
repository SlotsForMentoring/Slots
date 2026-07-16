# iMeet API

Backend for the iMeet scheduling platform. Volunteers create time slots, trainees book them, and the system creates Google Calendar events with Meet links.

## Tech Stack

- **Python 3.12** + **FastAPI**
- **SQLAlchemy 2.0** async ORM + **Alembic** migrations
- **PostgreSQL** on Supabase
- **Google OAuth 2.0** (no passwords)
- **JWT** in httpOnly cookie
- **uv** for package management

## Setup

```bash
cd api
uv sync
cp .env.example .env
```

Fill in the `.env` file with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (`http://localhost:8000/auth/callback` for local) |
| `APP_JWT_SECRET` | Secret for signing JWTs — generate with `openssl rand -hex 32` |
| `FRONTEND_URL` | Frontend URL for redirect after login (default: `http://localhost:5173`) |
| `CORS_ORIGINS` | Allowed origins, comma-separated (default: `http://localhost:5173`) |
| `ADMIN_EMAIL` | Email that gets admin role on first login (optional) |
| `COOKIE_SECURE` | `false` for local (HTTP), `true` for production (HTTPS) |
| `COOKIE_SAMESITE` | `lax` for local, `none` for production (cross-origin) |

## Run

```bash
uv run uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Swagger docs at [`/docs`](http://localhost:8000/docs).

## Tests

```bash
uv run pytest
```

## Migrations

```bash
# Apply all migrations
uv run alembic upgrade head

# Create a new migration after model changes
uv run alembic revision --autogenerate -m "description"
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/login` | No | Redirect to Google OAuth |
| `GET` | `/auth/callback` | No | Google sends users here after login |
| `POST` | `/auth/logout` | No | Clear session cookie |
| `GET` | `/auth/me` | Yes | Get current user info |

### Slots

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/slots` | volunteer | Create a 1-hour slot |
| `GET` | `/slots/mine` | volunteer | List my slots |
| `DELETE` | `/slots/{id}` | volunteer | Delete a slot (not booked) |
| `GET` | `/slots/available` | any | List available (unbooked) slots |

### Bookings

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/bookings` | trainee | Book a slot |
| `DELETE` | `/bookings/{id}` | trainee | Cancel a booking |
| `GET` | `/bookings/mine` | any | List my bookings |

### Admin

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `GET` | `/admin/users` | admin | List all users (filter by role) |
| `PATCH` | `/admin/users/{id}/role` | admin | Change a user's role |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Check API and database status |

## Auth Flow

1. User clicks login → redirected to Google OAuth
2. Google redirects to `/auth/callback` with a code
3. Backend exchanges the code for user info and creates a JWT
4. JWT is set as a httpOnly cookie → user is redirected to the frontend
5. Frontend calls `/auth/me` — the cookie is sent automatically
6. Logout clears the cookie

## Roles

| Role | Default | Description |
|------|---------|-------------|
| `trainee` | Yes | Can browse and book slots |
| `volunteer` | No | Can create and manage slots |
| `admin` | No | Can change user roles |

## Project Structure

```
api/
├── app/
│   ├── main.py           # FastAPI app, middleware, health check
│   ├── config.py          # Settings from .env (pydantic-settings)
│   ├── database.py        # Async engine and session
│   ├── models/            # SQLAlchemy ORM models (User, Slot, Booking)
│   ├── schemas/           # Pydantic request/response models
│   ├── crud/              # Database queries
│   ├── services/          # Business logic (booking, calendar, auth)
│   ├── routers/           # API route handlers
│   └── dependencies/      # Auth middleware (JWT from cookie)
├── alembic/               # Migration files
├── tests/                 # pytest test suite
└── pyproject.toml         # Dependencies
```
