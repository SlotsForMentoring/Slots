# Sprint 2 Plan — MVP Pair Scheduling

## How to read this documentation

Start here. This file is the overview of everything — what we're building, who does what, and how the pieces connect. Then go deeper into the specific docs depending on your role.

| Document | What it answers | Who reads it |
|----------|----------------|--------------|
| `SPRINT2_PLAN.md` (this file) | What are we building and who does what? | Everyone |
| `contracts/*.md` | What exact data does each endpoint receive and return? | The dev implementing the endpoint AND the dev consuming it |
| `epics/*.md` | What is the context, user flow, and task breakdown for each feature? | The dev assigned to that epic |

**Contracts** are the agreement between backend and frontend. If the contract says `GET /slots/available` returns `{ id, volunteer_name, start_time, end_time }`, the backend dev implements it exactly like that and the frontend dev builds the UI expecting that exact shape. Nobody guesses.

**Epics** are NOT kanban cards. Each epic contains multiple **tickets** — those are the actual cards you pick up on the board. Each ticket links back to its contract so you know the expected input/output.

---

## Goal

A trainee can see available time slots and book one. A volunteer can offer and manage slots. An admin can assign roles. Everything works end-to-end (backend + frontend + deployed).

Google Calendar integration and calendar invites are built as separate services and connected post-MVP.

---

## Team (4 developers)

| Dev | Focus | Epics |
|-----|-------|-------|
| Dev A (Tech Lead) | Backend infra + Admin | Epic 1 (Admin Roles) + Epic 4 (Google Calendar Service) + code review |
| Dev B | Backend | Epic 2 (Slot Management) |
| Dev C | Backend | Epic 3 (Booking) |
| Dev D | Frontend | Epic 5 (Frontend Shell + all pages) |

---

## Database Schema

```
users (exists)
├── id              UUID PK
├── google_id       VARCHAR(255) UNIQUE
├── email           VARCHAR(255) UNIQUE
├── name            VARCHAR(255)
├── profile_picture TEXT
├── role            VARCHAR(50) DEFAULT 'trainee'  ← 'trainee' | 'volunteer' | 'admin'
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

slots (new)
├── id                      UUID PK
├── volunteer_id             UUID FK → users.id
├── start_time               TIMESTAMPTZ NOT NULL
├── end_time                 TIMESTAMPTZ NOT NULL  (always start_time + 1 hour)
├── min_booking_notice_hours INT DEFAULT 24
├── created_at               TIMESTAMPTZ
└── updated_at               TIMESTAMPTZ

bookings (new)
├── id          UUID PK
├── slot_id     UUID FK → slots.id  UNIQUE (one booking per slot)
├── trainee_id  UUID FK → users.id
├── agenda      TEXT  (optional, trainee describes what they want to work on)
├── status      VARCHAR(50) DEFAULT 'confirmed'  ← 'confirmed' | 'cancelled'
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ
```

A slot is "available" when: no booking exists for it AND start_time > now() + min_booking_notice_hours.

Recurring slots: the backend stores individual slots. The frontend offers a "repeat weekly" option that creates N individual slots at once. No recurring logic on the backend for MVP.

---

## Epics Summary

| # | Epic | Priority | Depends on | Contract |
|---|------|----------|------------|----------|
| 1 | Admin Role Management | MVP | Nothing | [admin.md](contracts/admin.md) |
| 2 | Slot Management (Volunteer) | MVP | Epic 1 (mock: seed volunteer) | [slots.md](contracts/slots.md) |
| 3 | Slot Browsing & Booking (Trainee) | MVP | Epic 2 (mock: seed slots) | [bookings.md](contracts/bookings.md) |
| 4 | Google Calendar Service | Post-MVP | Epic 3 | TBD |
| 5 | Frontend Shell | MVP | Nothing (uses mocks) | All contracts |

---

## Dependency Map & Mock Strategy

```
Epic 1 (Admin Roles) ──→ Epic 2 (Slots) ──→ Epic 3 (Bookings) ──→ Epic 4 (Calendar)
                                                                         
Epic 5 (Frontend) ─── uses mock endpoints, fully independent ───────────
```

### How to eliminate blocking dependencies

| Blocked by | Solution |
|-----------|----------|
| Epic 2 needs a volunteer user | Dev B seeds a volunteer via SQL: `UPDATE users SET role = 'volunteer' WHERE email = '...'` |
| Epic 3 needs slots to exist | Dev C seeds slots via SQL or imports from Dev B's seed script |
| Epic 5 needs all APIs | Dev D works against mock data (local JSON or hardcoded responses). Contracts define the exact shape |
| Epic 4 needs bookings | Built independently. Connected when Epic 3 is done |

### Contract-first workflow

1. All contracts are defined upfront (this document)
2. Each dev implements their endpoints following the contract exactly
3. Frontend dev builds against the contract shape (mock data)
4. When a real endpoint is deployed, frontend switches — no changes needed

---

## Tickets Overview

See each epic doc for full ticket breakdown. Quick summary:

| Ticket | Epic | Assignee | Estimate |
|--------|------|----------|----------|
| Admin: list users endpoint | 1 | Dev A | 0.5 day |
| Admin: update user role endpoint | 1 | Dev A | 0.5 day |
| Admin: role authorization middleware | 1 | Dev A | 0.5 day |
| Slot: create slot endpoint | 2 | Dev B | 1 day |
| Slot: list my slots endpoint | 2 | Dev B | 0.5 day |
| Slot: delete slot endpoint | 2 | Dev B | 0.5 day |
| Slot: list available slots endpoint | 2 | Dev B | 1 day |
| Slot: model + migration | 2 | Dev B | 0.5 day |
| Booking: create booking endpoint | 3 | Dev C | 1 day |
| Booking: list my bookings endpoint | 3 | Dev C | 0.5 day |
| Booking: model + migration | 3 | Dev C | 0.5 day |
| Frontend: auth flow (login/logout) | 5 | Dev D | 1 day |
| Frontend: routing + layout + navbar | 5 | Dev D | 1 day |
| Frontend: available slots page | 5 | Dev D | 1.5 days |
| Frontend: my slots page (volunteer) | 5 | Dev D | 1.5 days |
| Frontend: my bookings page | 5 | Dev D | 1 day |
| Frontend: admin users page | 5 | Dev D | 1 day |

---

## What is NOT in Sprint 2

- Google Calendar integration (Epic 4 — built separately, connected later)
- Calendar invites with Google Meet links
- Recurring slot backend logic (frontend convenience only)
- Booking cancellation by trainee/volunteer
- Admin cancel/remove/ban users
- Email notifications
