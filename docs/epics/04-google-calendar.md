# Epic 4: Google Calendar Service (Post-MVP)

## Description

A standalone service that creates Google Calendar events with Google Meet links when a booking is confirmed. Built independently and connected to the booking flow later.

This epic is NOT part of Sprint 2 MVP. It is documented here so the dev can start working on it in parallel. When Epic 3 (Bookings) is done, the calendar service hooks into the booking creation.

## Acceptance Criteria

- [ ] When a booking is created, a Google Calendar event is created
- [ ] Both volunteer and trainee receive calendar invites
- [ ] The event includes a Google Meet link
- [ ] If the calendar service fails, the booking still succeeds (fire-and-forget)

## User Flow

```
Trainee (UI)                  Server (API)                  Google Calendar API
────────────                  ────────────                  ───────────────────
Books a slot             →    POST /bookings           →    INSERT booking
                              (booking confirmed)
                              
                              Calls calendar service    →    POST /calendar/v3/events
                              (async, fire-and-forget)       { summary, start, end,
                                                               attendees, conferenceData }
                                                        ←    { event with Meet link }
                              
Sees confirmation        ←    { booking }
                              
Both parties receive          (Google sends invites
calendar invites              automatically)
```

## Technical Notes

- Requires adding `https://www.googleapis.com/auth/calendar.events` scope to OAuth
- Requires storing Google OAuth refresh tokens in the users table
- The calendar event creation should be async (BackgroundTasks) — booking succeeds even if calendar fails
- Google Meet link is created via `conferenceDataVersion=1` parameter

## Tickets

### 4.1 — Add calendar scope to OAuth and store refresh tokens
Modify OAuth flow to request calendar scope. Store `google_refresh_token` in users table.
- Files: `api/app/services/auth.py`, `api/app/models/user.py`, new migration

### 4.2 — Google Calendar service
Create `api/app/services/calendar.py` with function to create a calendar event with Meet link using a user's refresh token.
- Input: volunteer refresh token, event details (title, start, end, attendee emails)
- Output: Google Calendar event with Meet link

### 4.3 — Connect calendar service to booking creation
Call calendar service as a BackgroundTask when a booking is created in `POST /bookings`.
- Files: `api/app/routers/bookings.py`
