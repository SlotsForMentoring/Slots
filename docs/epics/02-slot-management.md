# Epic 2: Slot Management (Volunteer)

## Description

A volunteer can offer 1-hour time slots, see their offered slots (with booking status), and cancel unbooked slots. The backend stores individual slots — recurring is a frontend convenience that creates multiple slots at once.

## Acceptance Criteria

- [ ] Volunteer can create a 1-hour slot at a specific date/time
- [ ] Volunteer can set a minimum booking notice (default 24 hours)
- [ ] Volunteer can see all their offered slots with booking info
- [ ] Volunteer can delete an unbooked slot
- [ ] Cannot delete a slot that is already booked
- [ ] Cannot create overlapping slots
- [ ] Non-volunteers get 403

## User Flow

```
Volunteer (UI)                Server (API)                  Database
──────────────                ────────────                  ────────
Opens "My Slots" page    →    GET /slots/mine          →    SELECT slots LEFT JOIN bookings
Sees slots + booking info ←   [{ slot, booking }]      ←    WHERE volunteer_id = :user_id

Picks date/time          →    POST /slots              →    INSERT INTO slots
  body: { start, end }        Validates: no overlap,        (volunteer_id, start, end, notice)
                               exactly 1 hour
Sees new slot in list    ←    { slot }                 ←    returns new row

Clicks "Delete"          →    DELETE /slots/:id        →    Check: no booking exists
  (on unbooked slot)          Validates: owner,             DELETE FROM slots WHERE id = :id
                               not booked
Slot removed from list   ←    204 No Content           ←    row deleted
```

## Contract

[slots.md](../contracts/slots.md)

## Tickets

### 2.1 — Slot model + migration
Create `Slot` SQLAlchemy model and Alembic migration matching the schema in SPRINT2_PLAN.md.
- Files: `api/app/models/slot.py`, `api/alembic/versions/`, `api/alembic/env.py`

### 2.2 — Create slot endpoint
`POST /slots`. Protected by `require_role("volunteer")`. Validates 1-hour duration and no overlapping slots for the same volunteer.
- Input: `{ start_time, end_time, min_booking_notice_hours? }`
- Output: `SlotResponse` (201)
- Contract: [slots.md](../contracts/slots.md)
- Files: `api/app/routers/slots.py`, `api/app/crud/slots.py`, `api/app/schemas/slot.py`

### 2.3 — List my slots endpoint
`GET /slots/mine`. Protected by `require_role("volunteer")`. Includes booking info via LEFT JOIN.
- Input: optional `?include_past=false`
- Output: list of `SlotDetailResponse` (includes nested booking if exists)
- Contract: [slots.md](../contracts/slots.md)
- Files: `api/app/routers/slots.py`, `api/app/crud/slots.py`

### 2.4 — Delete slot endpoint
`DELETE /slots/{slot_id}`. Protected by `require_role("volunteer")`. Only owner can delete. Cannot delete if booked.
- Input: path `slot_id`
- Output: 204 No Content
- Contract: [slots.md](../contracts/slots.md)
- Files: `api/app/routers/slots.py`, `api/app/crud/slots.py`

### 2.5 — List available slots endpoint
`GET /slots/available`. Any authenticated user. Returns unbooked future slots within notice window.
- Input: none
- Output: list of `AvailableSlotResponse` (minimal: id, volunteer_name, start, end)
- Contract: [slots.md](../contracts/slots.md)
- Files: `api/app/routers/slots.py`, `api/app/crud/slots.py`
