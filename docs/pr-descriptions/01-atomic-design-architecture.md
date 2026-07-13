## Adopt Atomic Design Component Architecture

**Branch:** `refactor/atomic-design-architecture` → `develop`

### Summary

Restructures the frontend's component tree from a flat, mixed-responsibility layout into a strict atomic-design hierarchy (`atoms → molecules → organisms → layouts`) plus a `features/<domain>/` convention for domain-specific logic, and brings in the styling/animation/icon primitives the rest of the redesign work depends on.

### Changes

- Added `class-variance-authority`, `framer-motion`, and `lucide-react` to `frontend/package.json` (lockfile refreshed).
- Moved `components/calendar/CalendarGrid.jsx` and `components/calendar/SlotCreateModal.jsx` to `features/calendar/`, converting both from default to named exports (`CalendarGrid`, `SlotCreateModal`).
- Added `components/atoms/index.js`, a barrel re-exporting `RoleBadge`/`StatusBadge`, `Button`, and `Logo` so consumers import from one path instead of one file per atom.
- Updated every consumer of the moved/barreled files — `Navbar.jsx`, `AdminUsersPage.jsx`, `AvailableSlotsPage.jsx`, `LandingPage.jsx`, `MySlots.jsx` — to the new import paths. No component's internal markup, styling, or behavior changed in this PR; it is a pure structural move.

### Why

Every subsequent design-system ticket (theming, new atoms, bottom sheet, etc.) needs a predictable place to add a new primitive and a consistent barrel to import from. Doing this first avoids re-touching every import site again later.

### Files

- `frontend/package.json`, `frontend/package-lock.json`
- `frontend/src/components/atoms/index.js` (new)
- `frontend/src/features/calendar/CalendarGrid.jsx` (moved)
- `frontend/src/features/calendar/SlotCreateModal.jsx` (moved)
- `frontend/src/components/organisms/Navbar.jsx`
- `frontend/src/pages/AdminUsersPage.jsx`
- `frontend/src/pages/AvailableSlotsPage.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/MySlots.jsx`

### Testing

- `npx eslint .` — clean, no warnings.
- `npm run build` — succeeds (51 modules transformed, no errors).
- Verified no remaining references to the old `components/calendar/*` or per-file atom import paths (`grep` across `src/`).

### Risk / Rollback

Pure refactor, no behavior change. Safe to revert by reverting this commit — no data or API changes involved.
