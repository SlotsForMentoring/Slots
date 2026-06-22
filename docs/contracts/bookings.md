# API Contract: Bookings

---

## POST /bookings

Book an available slot. Requires `role: trainee`.

**Request body:**
```json
{
  "slot_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "agenda": "Help with React hooks exercise"
}
```

`agenda` is optional.

Server validates:
- Slot exists and is not already booked
- `start_time > now() + min_booking_notice_hours`
- User has role `trainee`

**Response 201:**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "slot": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "volunteer_name": "Jane Doe",
    "start_time": "2026-07-01T14:00:00Z",
    "end_time": "2026-07-01T15:00:00Z"
  },
  "trainee_name": "John Smith",
  "agenda": "Help with React hooks exercise",
  "status": "confirmed",
  "created_at": "2026-06-22T10:00:00Z"
}
```

**Response 409:** `{ "detail": "Slot is already booked" }`
**Response 422:** `{ "detail": "Booking window has passed" }`
**Response 404:** `{ "detail": "Slot not found" }`
**Response 403:** `{ "detail": "Trainee access required" }`

---

## GET /bookings/mine

List bookings for the authenticated user. Works for both trainees and volunteers.

- Trainee sees their booked sessions
- Volunteer sees bookings on their slots

**Query params:** `?status=confirmed` (optional filter)

**Response 200 (trainee view):**
```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "slot": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "volunteer_name": "Jane Doe",
      "start_time": "2026-07-01T14:00:00Z",
      "end_time": "2026-07-01T15:00:00Z"
    },
    "agenda": "Help with React hooks exercise",
    "status": "confirmed",
    "created_at": "2026-06-22T10:00:00Z"
  }
]
```
