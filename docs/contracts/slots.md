# API Contract: Slots

---

## POST /slots

Create a new time slot offering. Requires `role: volunteer`.

**Request body:**
```json
{
  "start_time": "2026-07-01T14:00:00Z",
  "end_time": "2026-07-01T15:00:00Z",
  "min_booking_notice_hours": 24
}
```

`min_booking_notice_hours` is optional (default: 24). `end_time` must be exactly 1 hour after `start_time`.

**Response 201:**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "volunteer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "volunteer_name": "Jane Doe",
  "start_time": "2026-07-01T14:00:00Z",
  "end_time": "2026-07-01T15:00:00Z",
  "min_booking_notice_hours": 24,
  "is_booked": false,
  "created_at": "2026-06-22T10:00:00Z"
}
```

**Response 403:** `{ "detail": "Volunteer access required" }`
**Response 422:** `{ "detail": "Slot must be exactly 1 hour" }`
**Response 409:** `{ "detail": "Overlapping slot exists" }`

---

## GET /slots/mine

List all slots offered by the authenticated volunteer. Requires `role: volunteer`.

Use this endpoint to manage slots (create, delete, see status). To see booking details from the session perspective, use `GET /bookings/mine` instead.

**Query params:** `?include_past=false` (optional, default false)

**Response 200:**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "volunteer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "volunteer_name": "Jane Doe",
    "start_time": "2026-07-01T14:00:00Z",
    "end_time": "2026-07-01T15:00:00Z",
    "min_booking_notice_hours": 24,
    "is_booked": true,
    "booking": {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "trainee_name": "John Smith",
      "trainee_email": "john@gmail.com",
      "agenda": "Help with React hooks exercise",
      "status": "confirmed"
    },
    "created_at": "2026-06-22T10:00:00Z"
  }
]
```

When `is_booked` is false, `booking` is `null`.

---

## GET /slots/available

List available (unbooked, future, within notice window) slots. Any authenticated user can access.

Returns slots where:
- No booking exists
- `start_time > now() + min_booking_notice_hours`

**Response 200:**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "volunteer_name": "Jane Doe",
    "start_time": "2026-07-01T14:00:00Z",
    "end_time": "2026-07-01T15:00:00Z"
  }
]
```

Note: available slots return minimal data. No volunteer_id or internal details exposed.

---

## DELETE /slots/{slot_id}

Cancel a slot offering. Requires `role: volunteer`. Only the slot owner can delete. Cannot delete if already booked.

**Response 204:** (no body)

**Response 403:** `{ "detail": "Not your slot" }`
**Response 409:** `{ "detail": "Cannot delete a booked slot" }`
**Response 404:** `{ "detail": "Slot not found" }`
