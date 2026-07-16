<div align="center">
  <img src="frontend/public/logo.png" width="80" alt="iMeet logo">

  # This is iMeet

  **A scheduling platform for 1:1 mentoring sessions**

  [Overview](#overview) · [How It Works](#how-it-works) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure)

</div>

## Overview

iMeet helps trainees find and book mentoring sessions with volunteers. Instead of searching many calendars or links, trainees see all available time slots in one place and book with one click.


## How It Works

There are three user roles:

| Role | What they can do |
|------|-----------------|
| **Trainee** | Browse available slots, book a session, cancel bookings |
| **Volunteer** | Create 1-hour time slots, view and delete their slots |
| **Admin** | Manage user roles |

When a trainee books a slot, the system creates a Google Calendar event with a Google Meet link automatically.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Zustand |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL (Supabase) |
| Auth | Google OAuth 2.0 + JWT (httpOnly cookie) |
| Calendar | Google Calendar API + Meet |
| Deploy | Netlify (frontend), Railway (backend) |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22+
- PostgreSQL database (or a [Supabase](https://supabase.com) project)
- Google Cloud project with OAuth 2.0 and Calendar API enabled

### Setup

Clone the repository:

```bash
git clone https://github.com/SlotsForMentoring/Slots.git
cd Slots
```

Then set up the backend and frontend separately. See:

- [`api/README.md`](api/README.md) — Backend setup and API docs
- [`frontend/README.md`](frontend/README.md) — Frontend setup and development

## Project Structure

```
Slots/
├── api/                  # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── config.py     # Environment settings
│   │   ├── database.py   # Database connection
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── crud/         # Database queries
│   │   ├── services/     # Business logic
│   │   ├── routers/      # API routes
│   │   └── dependencies/ # Auth middleware
│   ├── alembic/          # Database migrations
│   └── tests/            # API tests
├── frontend/             # Frontend (React)
│   ├── src/
│   │   ├── components/   # Atoms, molecules, organisms
│   │   ├── features/     # Feature-specific components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client
│   │   ├── stores/       # Zustand state
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
└── docs/                 # Epics, contracts, sprint plans
```

## Roles and Auth Flow

1. User clicks **Login** and is sent to Google OAuth
2. Google sends the user back to the backend with a code
3. Backend gets user info from Google and creates a JWT
4. JWT is stored in a httpOnly cookie and the user is sent to the frontend
5. Frontend calls `/auth/me` on load — the cookie is sent automatically
6. New users get the `trainee` role by default. An admin can change roles
