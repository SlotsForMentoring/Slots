## Design System: Semantic Theme Tokens & Dark Mode

**Branch:** `feat/theme-semantic-tokens-dark-mode` → `develop`

### Summary

Replaces the ad-hoc purple `brand-*` palette and flat `danger/success/warning` colors with a semantic, themeable design-token system on top of Tailwind v4's CSS-first `@theme`, and adds dark mode support.

### Changes

- Replaced `--color-brand-{50-900}` and `--color-danger/success/warning` with a two-scale palette: `--color-ink-{50-900}` (neutral surfaces/text) and `--color-flame-{50,100,400,500,600,700}` (red accent).
- Added a semantic alias layer — `--color-background`, `-foreground`, `-card`, `-primary`, `-secondary`, `-muted`, `-accent`, `-destructive`, `-border`, `-input`, `-ring` (each with a `-foreground` counterpart) — that resolves to raw custom properties (`--surface-app`, `--surface-card`, `--text-ink`, `--brand-primary`, etc.) defined once in `:root`, so components reference roles, not raw colors.
- Added `@custom-variant dark (&:where(.dark, .dark *));` and a `.dark { ... }` block that flips every surface/text/border/brand property for dark mode.
- Added a soft shadow scale (`--shadow-soft-sm/md/lg`), an expanded radius scale (`--radius-sm` → `--radius-2xl`, `--radius-full`), the Space Grotesk display typeface alongside Inter, and `blob-1`/`blob-2`/`wave-scroll` keyframes (all respecting `prefers-reduced-motion`).

### Why

A token layer means future color/brand changes touch one file instead of every component, and dark mode is table stakes for a modern product. This is purely additive to the CSS layer — no component markup changes in this PR.

### Files

- `frontend/src/index.css`

### Testing

- `npx eslint .` — clean, no warnings.
- `npm run build` — succeeds (50 modules transformed, no errors).

### Risk / Rollback

Removing the old `brand-*`/`danger`/`success`/`warning` tokens means any component still referencing them (e.g. `bg-brand-500`, `text-danger-600`) will silently lose that styling until it's migrated onto the new tokens — that migration is the next ticket (Core UI Kit: Foundational Atoms) and is expected to land immediately after this one. Safe to revert independently if needed; no data or API changes involved.
