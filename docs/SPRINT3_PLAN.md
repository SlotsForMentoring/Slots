# Sprint 3 Plan

Deadline: July 11, 2026
Milestone: Sprint 3


## Labels

sprint:3, bug, fix, feature, cleanup
urgency:critical, urgency:high, urgency:medium, urgency:low
difficulty:small (< 1h), difficulty:medium (1-4h), difficulty:large (4-8h)


## Execution order

Phase 1 (jul 6-7): #01-#02 — critical bugs
Phase 2 (jul 7-8): #03 — calendar auth prep
Phase 3 (jul 8-9): #04 — calendar service + tests slots (parallel)
Phase 4 (jul 9-10): #05 — calendar connect + tests bookings (parallel)
Phase 5 (jul 9-10): #06 — docs and fixes (parallel with phase 4)
Phase 6 (jul 10-11): #07 — cleanup



## [BUGS] Sprint 3 — Critical fixes

Issue padre. Contiene los siguientes sub-issues:


### #01 — B1: Fix BookingResponse schema

Labels: sprint:3, bug, urgency:critical, difficulty:small
Dependency: none

BookingResponse and SlotInfo in api/app/schemas/booking.py are missing model_config = {"from_attributes": True}. Without this, Pydantic cannot serialize SQLAlchemy ORM objects and the booking endpoints (POST /bookings, GET /bookings/mine) return 500 errors.

Files:
- api/app/schemas/booking.py

What to do:
- Add model_config = {"from_attributes": True} to BookingResponse
- Add model_config = {"from_attributes": True} to SlotInfo


### #01 — B2: Add booking field to SlotResponse

Labels: sprint:3, bug, urgency:critical, difficulty:medium
Dependency: none

The contract for GET /slots/mine includes a nested booking object (trainee_name, trainee_email, agenda, status). The frontend MySlots.jsx reads slot.booking.trainee_name. But SlotResponse in api/app/schemas/slot.py has no booking field. The volunteer's "My Slots" page never shows booking details.

Files:
- api/app/schemas/slot.py
- api/app/crud/slots.py

What to do:
- Create a BookingInfo schema (trainee_name, trainee_email, agenda, status)
- Add optional booking field to SlotResponse (booking: BookingInfo | None)
- In get_volunteer_slots query, use joinedload to include the booking relationship
- Ensure from_attributes is set on all related schemas


### #01 — B3: Make cookie settings configurable via env

Labels: sprint:3, bug, urgency:critical, difficulty:small
Dependency: none

Cookie is hardcoded to samesite="none", secure=True. This works in production (HTTPS) but breaks localhost development (HTTP). Needs to be configurable.

Files:
- api/app/config.py
- api/app/routers/auth.py
- api/.env.example

What to do:
- Add to Settings: cookie_secure: bool = True, cookie_samesite: str = "none"
- Use settings.cookie_secure and settings.cookie_samesite in set_cookie
- In local .env: COOKIE_SECURE=false, COOKIE_SAMESITE=lax
- Add to .env.example


### #02 — B4: Fix logout delete_cookie for cross-origin

Labels: sprint:3, bug, urgency:critical, difficulty:small
Dependency: B3

delete_cookie in the logout endpoint does not pass samesite and secure params. Browsers require matching attributes to delete a cookie. Logout silently fails in cross-origin production deployment.

Files:
- api/app/routers/auth.py

What to do:
- Pass samesite=settings.cookie_samesite, secure=settings.cookie_secure to delete_cookie
- Also pass httponly=True and path="/" to match the original set_cookie


### #02 — B5: Prevent admin self-demote

Labels: sprint:3, bug, urgency:high, difficulty:small
Dependency: none

An admin can change their own role to trainee, locking themselves out permanently. There is no check preventing self-role-change. If this is the only admin, the platform becomes unmanageable.

Files:
- api/app/routers/admin.py

What to do:
- Compare user_id with current_user.id
- If equal, return 400 with message "Cannot change your own role"



## [FEATURES] Sprint 3 — New functionality

Issue padre. Contiene los siguientes sub-issues (FT1, FT2, FT3 son Google Calendar):


### #03 — FT1: Add calendar scope to OAuth + store refresh token

Labels: sprint:3, feature, urgency:critical, difficulty:large
Dependency: B1, B2 must be done first

The current OAuth flow only requests "openid email profile" scope. Google Calendar API requires the calendar.events scope. Also, exchange_code_for_userinfo receives a refresh_token from Google but discards it. The refresh_token is needed to create calendar events later (when a trainee books a slot, days after the volunteer logged in).

Files:
- api/app/services/auth.py
- api/app/models/user.py
- api/app/crud/users.py
- api/app/routers/auth.py
- new alembic migration

What to do:
1. In get_google_auth_url, add scope "https://www.googleapis.com/auth/calendar.events"
2. In exchange_code_for_userinfo, extract and return refresh_token from Google's token response (it may be None on subsequent logins — Google only sends it on first consent)
3. Add column google_refresh_token (Text, nullable) to User model
4. Create alembic migration for the new column
5. In upsert_user, accept and save refresh_token (only update if not None — don't overwrite existing token with null)
6. In auth callback, pass refresh_token from exchange result to upsert_user

Note: existing users will have null refresh_token. They need to re-login (Google will re-prompt consent because of the new scope). Handle null gracefully in calendar service.


### #04 — FT2: Google Calendar service

Labels: sprint:3, feature, urgency:high, difficulty:large
Dependency: FT1

Create a standalone service that creates a Google Calendar event with a Google Meet link using a user's refresh token.

Files:
- api/app/services/calendar.py (new)

What to do:
1. Function to exchange refresh_token for a new access_token using Google's token endpoint
2. Function to create a calendar event:
   - Title: "Pair Scheduling: {volunteer_name} + {trainee_name}"
   - Start/end: slot start_time and end_time
   - Attendees: volunteer email + trainee email
   - Conference data: Google Meet link (conferenceDataVersion=1)
3. Handle errors gracefully:
   - Token revoked: log warning, don't crash
   - API rate limit: log warning, don't retry
   - No refresh_token: skip silently
4. Return the Meet link URL if successful, None if not


### #05 — FT3: Connect calendar service to booking creation

Labels: sprint:3, feature, urgency:high, difficulty:medium
Dependency: FT2

When a booking is confirmed, trigger calendar event creation as a background task. The booking must succeed even if the calendar service fails (fire-and-forget).

Files:
- api/app/routers/booking.py
- api/app/services/booking.py

What to do:
1. Import calendar service in booking router
2. After successful booking creation, add BackgroundTask to create calendar event
3. Pass: volunteer refresh_token, volunteer email, trainee email, slot start/end, trainee name, volunteer name
4. If volunteer has no refresh_token, skip calendar creation silently
5. Optionally: store meet_link in booking record (requires adding column to Booking model + migration)


### #04 — FT4: Tests for slots endpoints

Labels: sprint:3, feature, urgency:high, difficulty:medium
Dependency: B2

Zero test coverage on slot creation, deletion, overlap validation, and available slots query. These are core business features.

Files:
- api/tests/test_slots.py (new)

What to do:
- test_create_slot_success
- test_create_slot_overlap_rejected
- test_create_slot_non_volunteer_403
- test_delete_slot_success
- test_delete_booked_slot_rejected
- test_delete_slot_not_owner_403
- test_get_available_slots_excludes_booked
- test_get_available_slots_excludes_past
- test_get_volunteer_slots_includes_booking_info


### #05 — FT5: Tests for bookings endpoints

Labels: sprint:3, feature, urgency:high, difficulty:medium
Dependency: B1

Zero test coverage on booking creation, mine endpoint, notice window validation, and double-booking prevention.

Files:
- api/tests/test_bookings.py (new)

What to do:
- test_create_booking_success
- test_create_booking_already_booked_409
- test_create_booking_within_notice_window_400
- test_create_booking_non_trainee_403
- test_get_my_bookings_trainee
- test_get_my_bookings_volunteer



## [FIXES] Sprint 3 — Improvements

Issue padre. Contiene los siguientes sub-issues:


### #06 — F1: Update contracts to reflect cookie auth

Labels: sprint:3, fix, urgency:medium, difficulty:small
Dependency: none

All three contracts (admin.md, slots.md, bookings.md) say "Authorization: Bearer token" but the real implementation uses httpOnly cookies. The 403 error messages also differ from actual implementation.

Files:
- docs/contracts/admin.md
- docs/contracts/slots.md
- docs/contracts/bookings.md

What to do:
- Change "Authorization: Bearer" to "Cookie: access_token (httpOnly)"
- Update error messages to match actual implementation ("Insufficient permissions")


### #06 — F2: Rewrite api/README.md

Labels: sprint:3, fix, urgency:medium, difficulty:small
Dependency: none

The README says "no ORM", "asyncpg direct", "bcrypt for passwords", lists wrong env vars, and shows files that don't exist. Completely outdated.

Files:
- api/README.md

What to do:
- Rewrite to reflect: SQLAlchemy 2.0 async, Alembic migrations, Google OAuth (no passwords), cookie-based JWT, correct env vars, correct project structure


### #06 — F3: Update OAUTH_AUTHENTICATION.md

Labels: sprint:3, fix, urgency:medium, difficulty:small
Dependency: FT1 (needs to reflect calendar scope)

Cookie settings in docs say samesite=lax, secure=False but code uses configurable settings. Also needs to document calendar scope after FT1.

Files:
- api/docs/OAUTH_AUTHENTICATION.md

What to do:
- Update cookie settings section to say "configurable via env"
- Add calendar scope to the OAuth flow description
- Add refresh_token storage info


### #06 — F4: Add type hints to crud/booking and services/booking

Labels: sprint:3, fix, urgency:low, difficulty:small
Dependency: none

Functions in crud/booking.py and services/booking.py lack type annotations. All other modules are properly typed.

Files:
- api/app/crud/booking.py
- api/app/services/booking.py

What to do:
- Add type hints to all function parameters and return types
- Use UUID for ids, AsyncSession for session, str | None for agenda


### #06 — F5: Extract formatDate/formatTime to shared utils

Labels: sprint:3, fix, urgency:low, difficulty:small
Dependency: none

Identical formatDate and formatTime functions are copy-pasted in AvailableSlotsPage.jsx, MyBookings.jsx, and MySlots.jsx.

Files:
- frontend/src/lib/dateUtils.js (new)
- frontend/src/pages/AvailableSlotsPage.jsx
- frontend/src/pages/MyBookings.jsx
- frontend/src/pages/MySlots.jsx

What to do:
- Create dateUtils.js with formatDate and formatTime
- Import from dateUtils.js in the three pages
- Remove duplicated functions



## [CLEANUP] Sprint 3 — Code cleanup

Issue padre. Contiene los siguientes sub-issues:


### #07 — C1: Remove placeholder model and migration

Labels: sprint:3, cleanup, urgency:medium, difficulty:small
Dependency: none

ExampleItem model and its migration are scaffolding leftovers. The migration contains op.drop_table('users') which is dangerous.

Files:
- api/app/models/placeholder.py (delete)
- api/alembic/versions/024dfab56d8f_create_placeholder_table.py (delete)
- api/alembic/env.py (remove import)

What to do:
- Delete placeholder.py
- Delete the migration file
- Remove import app.models.placeholder from alembic/env.py
- Verify alembic history still works


### #07 — C2: Remove dead Placeholder component

Labels: sprint:3, cleanup, urgency:low, difficulty:small
Dependency: none

Files:
- frontend/src/App.jsx

What to do:
- Remove the unused Placeholder component definition


### #07 — C3: Fix HTML title

Labels: sprint:3, cleanup, urgency:low, difficulty:small
Dependency: none

Files:
- frontend/index.html

What to do:
- Change title from "slots" to "Pair Scheduling"


### #07 — C4: Add frontend .env.example

Labels: sprint:3, cleanup, urgency:medium, difficulty:small
Dependency: none

VITE_API_URL is not documented anywhere. New developers won't know to set it.

Files:
- frontend/.env.example (new)

What to do:
- Create .env.example with VITE_API_URL=http://localhost:8000


### #07 — C5: Fix models/__init__.py imports

Labels: sprint:3, cleanup, urgency:medium, difficulty:small
Dependency: none

models/__init__.py imports slots and booking but not user. This is fragile for Alembic auto-detection.

Files:
- api/app/models/__init__.py

What to do:
- Add import of user model
- Ensure alembic/env.py does not need manual imports


## Dependency graph

B1 ──────────────────────────────────────→ FT5
B2 ──────────────────────────────────────→ FT4
B3 → B4
B1 + B2 → FT1 → FT2 → FT3
FT1 ─────────────────────────────────────→ F3
