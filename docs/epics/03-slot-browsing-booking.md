# Epic 3: Slot Browsing & Booking (Trainee)

## Description

A trainee can browse available time slots and book one. Once booked, the slot disappears from the available list. The trainee can optionally set an agenda describing what they want to work on.

## Acceptance Criteria

- [ ] Trainee sees a list of available slots (unbooked, future, within notice window)
- [ ] Trainee can book a slot by clicking on it
- [ ] Trainee can optionally write an agenda when booking
- [ ] Booked slot immediately disappears from the available list
- [ ] Trainee cannot book a slot within the minimum notice window
- [ ] Trainee cannot book an already-booked slot
- [ ] Trainee can see their booked sessions
- [ ] Volunteer can see bookings on their slots

## User Flow

```
Trainee (UI)                  Server (API)                  Database
────────────                  ────────────                  ────────
Opens "Available Slots"  →    GET /slots/available     →    SELECT slots LEFT JOIN bookings
                                                            WHERE booking IS NULL
                                                            AND start_time > now() + notice
Sees available slots     ←    [{ id, volunteer, time }] ←   returns available rows

Clicks "Book" on a slot  →    POST /bookings           →    Check: slot exists,
  body: { slot_id,            Validates: not booked,         not booked, within window
          agenda? }            within notice window
                                                            INSERT INTO bookings
                                                            (slot_id, trainee_id, agenda)
Sees confirmation        ←    { booking }              ←    returns new row
Slot gone from list

Opens "My Bookings"      →    GET /bookings/mine       →    SELECT bookings JOIN slots
Sees booked sessions     ←    [{ booking, slot }]      ←    WHERE trainee_id = :user_id
```

## Contract

[bookings.md](../contracts/bookings.md)

## Tickets

### 3.1 — Booking model + migration
Create `Booking` SQLAlchemy model and Alembic migration. UNIQUE constraint on `slot_id` (one booking per slot).
- Files: `api/app/models/booking.py`, `api/alembic/versions/`, `api/alembic/env.py`

### 3.2 — Create booking endpoint
`POST /bookings`. Protected by `require_role("trainee")`. Only trainees can book — volunteers and admins cannot. Validates slot availability and notice window. Uses DB-level UNIQUE constraint to prevent race conditions.
- Input: `{ slot_id, agenda? }`
- Output: `BookingResponse` (201) — includes `trainee_name`
- Contract: [bookings.md](../contracts/bookings.md)
- Files: `api/app/routers/bookings.py`, `api/app/crud/bookings.py`, `api/app/schemas/booking.py`

### 3.3 — List my bookings endpoint
`GET /bookings/mine`. Any authenticated user. The query changes based on the user's role:
- **Trainee**: `WHERE trainee_id = current_user.id`
- **Volunteer**: `WHERE slot.volunteer_id = current_user.id`

Both return the same response shape (includes `trainee_name` and `volunteer_name`).
- Input: optional `?status=confirmed`
- Output: list of `BookingResponse`
- Contract: [bookings.md](../contracts/bookings.md)
- Files: `api/app/routers/bookings.py`, `api/app/crud/bookings.py`
