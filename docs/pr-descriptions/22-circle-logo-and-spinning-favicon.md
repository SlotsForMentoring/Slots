## Circle-Dot Logo & Spinning Favicon

**Branch:** `feat/circle-logo-and-spinning-favicon` → `develop`

### Summary
Replaces the wordmark's old plus/cross dot on the "i" with a red circle (ring), matching a redesigned logo asset. Regenerates the favicon and Apple touch icon from the same ring shape, and adds a small animation that spins the ring on its vertical axis directly in the browser tab.

### Changes
- `frontend/public/logo.png` — background removed and trimmed/centered from the new source artwork; despeckled to avoid a noisy edge halo on dark backgrounds.
- `frontend/public/favicon.png`, `favicon.ico`, `apple-touch-icon.png` — regenerated as a procedurally-drawn ring (not a raster crop), so they stay crisp at 16–180px.
- `frontend/src/lib/spinningFavicon.js` (new) — draws the ring on a `<canvas>` and continuously re-renders it into a dedicated `<link rel="icon">` via data URL. Rotation is a real 3D-style spin (horizontal squash by `cos(angle)` + dimming on the "back" half), not a loading-spinner brightness sweep. Pauses on `visibilitychange` while the tab is hidden.
- `frontend/src/main.jsx` — calls `startSpinningFavicon()` once on boot.

### Files
`frontend/public/logo.png`, `frontend/public/favicon.png`, `frontend/public/favicon.ico`, `frontend/public/apple-touch-icon.png`, `frontend/src/lib/spinningFavicon.js`, `frontend/src/main.jsx`

### Testing
`npx eslint .` clean; `npm run build` succeeds. Verified the new logo renders with clean edges (no background halo) composited over white, dark, and brand-flame backgrounds. Verified the favicon animation logic against a standalone frame-by-frame render matching the in-app canvas code before wiring it in.

### Risk / Rollback
Purely cosmetic/branding — no backend, routing, or data changes. If the animated favicon is too distracting in practice, `startSpinningFavicon()` can be removed from `main.jsx` and the static `favicon.png`/`favicon.ico` (already updated to the new ring design) remain as the fallback. Static asset changes only otherwise; revert is a single file revert with no migration or data implications.
