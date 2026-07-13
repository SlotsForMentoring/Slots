## Bottom Sheet Modal System

**Branch:** `feat/bottom-sheet-modal-system` → `develop`

### Summary

Introduces one shared, accessible modal shell for every dialog in the app instead of each modal hand-rolling its own backdrop/focus/scroll-lock logic.

### Changes

- Added `components/molecules/BottomSheet.jsx`: a portal-rendered (`react-dom` `createPortal`) modal using `framer-motion` to slide up from the bottom on mobile and appear centered on desktop, with body-scroll locking, Escape-to-close, and drag-down-to-dismiss built in.
- Added `components/molecules/index.js` barrel.
- Rewrote `features/calendar/SlotCreateModal.jsx` to render inside `<BottomSheet open onClose={onClose} title="New slot">` instead of a hand-rolled fixed-backdrop `<div>` with its own manual `useEffect` Escape-key listener (removed — `BottomSheet` now owns that). Close button icon swapped from a hand-drawn SVG path to `lucide-react`'s `X`.

### Why

Consistent modal behavior across every dialog in the app is both a UX-consistency win and removes duplicated, easy-to-get-wrong overlay/focus code. This will also be reused by `SlotFlowSheet` (booking flow ticket, later).

### Files

- `frontend/src/components/molecules/BottomSheet.jsx` (new)
- `frontend/src/components/molecules/index.js` (new)
- `frontend/src/features/calendar/SlotCreateModal.jsx`

### Testing

- `npx eslint .` — clean.
- `npm run build` — succeeds (2218 modules transformed, no errors).

### Risk / Rollback

Pure UI refactor of one modal; behavior (create-slot flow, validation, error messages) is unchanged. Touch-target sizing of the modal's own close button is intentionally left as-is here — that's addressed in the later mobile/accessibility hardening ticket.
