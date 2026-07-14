## Mentor Booking Cancellation & Calendar Notice

**Branch:** `feat/mentor-cancel-and-calendar-notice` → `develop`

### Summary
Lets mentors cancel a booking on their own slots (previously only trainees could), and fixes a real gap where cancelling a booking — from either side — never actually removed the session from Google Calendar. Cancelling now deletes the Calendar event and lets Google's own `sendUpdates=all` notify attendees, the same mechanism already used for the original booking confirmation.

### Changes
- `api/alembic/versions/c728e849efd2_add_event_id_to_bookings.py` — adds `event_id` to `bookings`. The app was only ever storing the Meet link, with no way to look up the underlying Calendar event again to cancel it.
- `api/app/models/booking.py` — `event_id` column on the `Booking` model.
- `api/app/services/calendar.py` — `create_calendar_event` now returns a `PairingEvent` (event_id + meet_link) instead of just the link. Added `delete_calendar_event` / `cancel_pairing_event`, mirroring the existing creation path's resilience (never raises; logs and returns on revoked tokens, rate limits, or an already-deleted event).
- `api/app/crud/booking.py` — `set_meet_link` renamed to `set_calendar_info` (now persists `event_id` too). `delete_booking` broadened to accept either the trainee who booked or the volunteer whose slot it is, returning a `CancelResult` carrying what's needed to schedule the calendar cancellation.
- `api/app/services/booking.py` — new `cancel_meeting` background task, parallel to the existing `create_meeting_and_store`.
- `api/app/routers/booking.py` — `DELETE /bookings/{id}` now accepts any authenticated role (ownership is enforced inside `delete_booking`) and schedules `cancel_meeting` on success.
- `frontend/src/features/slots/MySlotCard.jsx` — "Cancel booking" confirm flow on booked slots, mirroring the existing "Delete slot" pattern.
- `frontend/src/features/slots/useMySlots.js` — `cancelSlotBooking`, which flips a slot back to available in place (as opposed to `removeSlot`, which removes it entirely — cancelling a booking doesn't delete the slot itself).
- `frontend/src/pages/MySlots.jsx` — wires `cancelSlotBooking` into `MySlotCard`.

### Known limitation (intentional, not a bug)
Google never emails the account whose own token performed an action — and cancellation always uses the volunteer's token, since only the calendar owner can fully cancel an event for both attendees. So the trainee reliably gets Google's cancellation email regardless of who cancels; the volunteer does not get one specifically when the *trainee* is the one who cancelled (when the volunteer cancels it themselves, they obviously already know). A custom Gmail-based notification to close that gap was built and then deliberately reverted to keep this PR scoped to plain Google Calendar behavior — worth a follow-up ticket if it's needed.

### Files
`api/alembic/versions/c728e849efd2_add_event_id_to_bookings.py`, `api/app/models/booking.py`, `api/app/services/calendar.py`, `api/app/services/booking.py`, `api/app/crud/booking.py`, `api/app/routers/booking.py`, `frontend/src/features/slots/MySlotCard.jsx`, `frontend/src/features/slots/useMySlots.js`, `frontend/src/pages/MySlots.jsx`

### Testing
`npx eslint .` clean; `npm run build` succeeds. Backend syntax-checked with `ast.parse()`. Ran locally against the real dev database: confirmed `DELETE /bookings/{id}` returns `204` for both a trainee-owned and volunteer-owned booking, the slot reopens as available, and a non-owning user gets `403`. Requires running `uv run alembic upgrade head` before testing locally, since this PR adds a migration.

### Risk / Rollback
Additive to the booking-cancel flow introduced in #158 — no changes to booking creation or read paths. The migration only adds a nullable column, so it's safe to roll forward or back without data loss. Bookings that predate this column simply have no `event_id`, and cancellation gracefully skips the calendar step for those rather than erroring.
