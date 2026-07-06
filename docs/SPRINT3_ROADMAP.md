# Sprint 3 — Roadmap

Deadline: July 11, 2026


## Phase 1 — Critical bugs (jul 6-7)

Nothing else can start until these are done.

- [ ] B1: Fix BookingResponse schema (from_attributes)
- [ ] B2: Add booking field to SlotResponse
- [ ] B3: Make cookie settings configurable via env
- [ ] B4: Fix logout delete_cookie for cross-origin (needs B3)
- [ ] B5: Prevent admin self-demote


## Phase 2 — Calendar auth prep (jul 7-8)

Needs B1 and B2 done first.

- [ ] FT1: Add calendar scope to OAuth + store refresh token


## Phase 3 — Calendar service + tests slots (jul 8-9)

FT2 needs FT1. FT4 needs B2. These two can be done in parallel.

- [ ] FT2: Google Calendar service
- [ ] FT4: Tests for slots endpoints


## Phase 4 — Calendar connect + tests bookings (jul 9-10)

FT3 needs FT2. FT5 needs B1. These two can be done in parallel.

- [ ] FT3: Connect calendar service to booking creation
- [ ] FT5: Tests for bookings endpoints


## Phase 5 — Docs and fixes (jul 9-10)

Can be done in parallel with Phase 4. F3 needs FT1.

- [ ] F1: Update contracts to reflect cookie auth
- [ ] F2: Rewrite api/README.md
- [ ] F3: Update OAUTH_AUTHENTICATION.md (needs FT1)
- [ ] F4: Add type hints to crud/booking and services/booking
- [ ] F5: Extract formatDate/formatTime to shared utils


## Phase 6 — Cleanup (jul 10-11)

No dependencies. Do last.

- [ ] C1: Remove placeholder model and migration
- [ ] C2: Remove dead Placeholder component
- [ ] C3: Fix HTML title
- [ ] C4: Add frontend .env.example
- [ ] C5: Fix models/__init__.py imports


## Dependency graph

```
B1 ─────────────────────────→ FT5
B2 ─────────────────────────→ FT4
B3 → B4
B1 + B2 → FT1 → FT2 → FT3
FT1 ────────────────────────→ F3
```


## Parallel tracks

Track A (backend heavy): B1, B2, B3, B4, FT1, FT2, FT3
Track B (tests + docs + cleanup): B5, FT4, FT5, F1-F5, C1-C5

These two tracks can run in parallel after Phase 1.
