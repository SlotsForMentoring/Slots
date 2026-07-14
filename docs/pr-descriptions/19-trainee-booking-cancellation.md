## Trainee Booking Cancellation

**Branch:** `feat/cancel-booking` → `develop`

### Summary
Lets a trainee cancel their own upcoming bookings. Previously there was no way to back out of a booking once made — the slot stayed marked "booked" indefinitely even if the trainee could no longer attend, leaving the mentor's time unusable by anyone else.

### Changes
- `api/app/crud/booking.py` — add `delete_booking(session, booking_id, trainee_id)`, returning `"not_found"` / `"not_yours"` / `"deleted"`.
- `api/app/routers/booking.py` — add `DELETE /bookings/{booking_id}`, restricted to the owning trainee (`require_role("trainee")` + an ownership check); 404 if the booking doesn't exist, 403 if it belongs to someone else. Deleting the row is enough to free the slot back up, since availability is already derived from the absence of a `Booking` row — no extra status flag needed.
- `frontend/src/services/api.js` — add `api.deleteBooking(id, mock)`.
- `frontend/src/features/slots/useMyBookings.js` — add a `removeBooking` optimistic-update callback (filters the cancelled booking out of local state); also fixes a stale `useAllSlots` reference left over in the doc comment from an earlier ticket.
- `frontend/src/features/slots/BookingCard.jsx` — add a "Cancel booking" button with a confirm step, mirroring `MySlotCard`'s existing delete-confirm pattern. Only rendered for upcoming bookings — past bookings show no cancel option.
- `frontend/src/pages/MyBookings.jsx` — wire `removeBooking` into the upcoming-bookings list only.

### Files
`api/app/crud/booking.py`, `api/app/routers/booking.py`, `frontend/src/services/api.js`, `frontend/src/features/slots/useMyBookings.js`, `frontend/src/features/slots/BookingCard.jsx`, `frontend/src/pages/MyBookings.jsx`

### Testing
`npx eslint .` clean; `npm run build` succeeds. Backend changes syntax-checked with `ast.parse()` (no Python environment available to run the test suite in this pass — worth a manual smoke test of `DELETE /bookings/{id}` against a real booking before merge, including the 403/404 paths).

### Risk / Rollback
Additive and narrowly scoped — new endpoint, new button, no changes to existing booking creation or read paths. Safe to revert by dropping this branch; no migration involved (the delete is a plain row delete on the existing `bookings` table).
