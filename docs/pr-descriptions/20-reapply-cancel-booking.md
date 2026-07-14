## Re-apply: Trainee Booking Cancellation

**Branch:** `reapply/cancel-booking` → `develop`

### Summary
Re-lands the trainee booking cancellation feature (originally PR #156) after it was reverted in PR #157. The revert wasn't due to a bug in the code — it was a stale Railway deploy that hadn't picked up the new endpoint yet, which made every cancel attempt fail with a generic error on the live site. This PR contains no functional changes from the original; it's the same diff, re-applied via `git revert` of the revert commit.

### What happened
1. PR #156 merged the feature into `develop`.
2. Testing on the live Netlify/Railway deployment showed "Could not cancel booking" on every attempt.
3. Rather than debug against a possibly-stale backend, PR #157 reverted the merge to get the broken button off the live site quickly. (That revert also incidentally deleted `hand-right.png`, an unrelated fix that had been riding along in the same branch stack — that was corrected in the same PR and is untouched here.)
4. Ran the backend and frontend locally against the real database to isolate whether this was a code bug or a deploy issue. Every `DELETE /bookings/{id}` call returned a clean `204 No Content` and the corresponding slot correctly became available again — confirming the code was correct all along.

### Changes
Identical to PR #156:
- `api/app/crud/booking.py` — `delete_booking(session, booking_id, trainee_id)`, returning `"not_found"` / `"not_yours"` / `"deleted"`.
- `api/app/routers/booking.py` — `DELETE /bookings/{booking_id}`, restricted to the owning trainee; 404 if not found, 403 if it belongs to someone else. Deleting the row frees the slot back up since availability is derived from the absence of a `Booking` row.
- `frontend/src/services/api.js` — `api.deleteBooking(id, mock)`.
- `frontend/src/features/slots/useMyBookings.js` — `removeBooking` optimistic-update callback.
- `frontend/src/features/slots/BookingCard.jsx` — "Cancel booking" button with a confirm step, upcoming bookings only.
- `frontend/src/pages/MyBookings.jsx` — wires `removeBooking` into the upcoming list.

### Files
`api/app/crud/booking.py`, `api/app/routers/booking.py`, `frontend/src/services/api.js`, `frontend/src/features/slots/useMyBookings.js`, `frontend/src/features/slots/BookingCard.jsx`, `frontend/src/pages/MyBookings.jsx`

### Testing
`npx eslint .` clean; `npm run build` succeeds. Unlike PR #156, this time the endpoint was exercised against a real local backend + live database — four separate bookings cancelled successfully, each logging `DELETE /bookings/{id} → 204 No Content`, with slots reappearing as available afterward.

### Risk / Rollback
Same as PR #156 — additive, no changes to existing booking creation/read paths, no migration involved. **Before merging, confirm Railway's auto-deploy on push to `develop` is actually enabled** — that's the root cause of the original incident, and if it's still off, this PR will appear broken on the live site again for the same non-code reason.
