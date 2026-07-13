## Core UI Kit: Foundational Atoms

**Branch:** `feat/foundational-atoms` → merges `feat/theme-semantic-tokens-dark-mode` + `refactor/atomic-design-architecture`, then → `develop`

### Summary

Builds out the reusable atom-level primitives needed by every page, replacing duplicated one-off markup with a `cva`-based, token-driven set of components.

### Changes

- **Button** — rewritten on `cva` with `forwardRef`; gained `outline`, `destructive` (renamed from `danger`), and `link` variants plus an `icon` size; pill-shaped (`rounded-full`) with `active:scale-[0.97]` press feedback; `lucide-react`'s `Loader2` replaces the hand-rolled spinner; `aria-busy` added.
- **Badge** — collapsed the separate `RoleBadge`/`roleStyles` map and `StatusBadge`/`statusStyles` map into one generic `cva` `Badge` (`neutral/accent/success/warning/outline/flame`), with `RoleBadge` now composing `Badge`. `StatusBadge` is removed entirely — call sites use `Badge variant="success"/"warning"` directly.
- **Logo** — replaced the DOM-generated gradient icon-square + text with a single `<img src="/logo.png">` wordmark, sized via a `heights` map; dropped the `iconOnly` prop, added an `xl` size for later use.
- **New atoms**: `Avatar` (image or initials-on-flame fallback), `Card` (shared bordered/rounded surface with optional `interactive` state), `Chip` (toggle-pill filter button), `Skeleton` (pulsing loading placeholder), `TextField`/`TextAreaField` (label+hint+error input wrapper sharing an internal `FieldChrome` layout).
- Updated `components/atoms/index.js` to export all of the above.
- Migrated `MySlots.jsx`'s inline `SlotCard` off the now-removed `StatusBadge` (→ `Badge variant="success"/"warning"`) and the renamed `danger` → `destructive` Button variant, since those two call sites would otherwise break. The rest of `MySlots.jsx`'s redesign (hooks, filters, extracted `MySlotCard`) is out of scope here — that's a later ticket.

### Files

- `frontend/src/components/atoms/Button.jsx`, `Badge.jsx`, `Logo.jsx`, `Avatar.jsx` (new), `Card.jsx` (new), `Chip.jsx` (new), `Skeleton.jsx` (new), `TextField.jsx` (new), `index.js`
- `frontend/src/pages/MySlots.jsx` (minimal compatibility fix only)

### Testing

- `npx eslint .` — clean.
- `npm run build` — succeeds (1814 modules transformed, no errors).

### Risk / Rollback

Any other page still referencing the old `variant="danger"` Button prop or a raw `brand-*`/`gray-*` class will keep rendering with degraded (not broken) styling until it's migrated in a later ticket — no runtime errors, just missing color classes. Full re-styling of each page happens ticket-by-ticket as they're rebuilt.
