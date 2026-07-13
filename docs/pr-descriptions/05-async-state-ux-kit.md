## Async State UX Kit (Empty / Error / Offline / Loading)

**Branch:** `feat/async-state-ux-kit` → `develop`

### Summary
Standardizes how list-driven screens will communicate loading, empty, error, and offline states, ahead of the pages that consume this kit being rebuilt in later tickets.

### Changes
- `components/molecules/EmptyState.jsx` — exports `EmptyState`, `ErrorState`, `OfflineBanner`, all built on a shared internal `StateLayout` helper so `ErrorState` doesn't duplicate `EmptyState`'s layout.
- `components/molecules/SearchBar.jsx` — pill search input with icon + clear button.
- `components/molecules/SlotCardSkeleton.jsx` — card-shaped loading placeholder built from `Skeleton` atoms.
- Wired into the `molecules` barrel.

### Files
`frontend/src/components/molecules/EmptyState.jsx`, `SearchBar.jsx`, `SlotCardSkeleton.jsx`, `index.js`

### Testing
`npx eslint .` clean; `npm run build` succeeds (2221 modules, no errors).

### Risk / Rollback
Purely additive — no existing page imports these yet, so there is no behavior change in this PR. They get wired into Available Slots / My Slots / My Bookings / Admin Slots in later tickets.
