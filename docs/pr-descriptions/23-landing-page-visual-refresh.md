## Landing Page Visual Refresh

**Branch:** `feat/landing-page-visual-refresh` → `develop`

### Summary
Bigger, consistent titles; a fixed mobile hero illustration; and a redesigned hero background animation.

### Changes
- New `Heading` atom (`frontend/src/components/atoms/Heading.jsx`) — single reusable title component, used for all four landing page titles. Fixes two section titles that had silently drifted onto the wrong font/weight, and bumps all titles up a size.
- Mobile hero hand illustration now bleeds off the true screen edge instead of floating centered with a visible cut-off wrist.
- "How it works" circles rest at a 30% fill instead of fully empty.
- Hero screenshot background: four solid shapes (blob, circle, square, triangle) now orbit the center like watch hands, replacing the old blurred/glowing blobs. Card itself is solid instead of translucent, and scales down on mobile.
- Also commits four PR-description docs (#19–22) that were written earlier but never actually committed.

### Testing
`npx eslint .` clean; `npm run build` succeeds.

### Risk / Rollback
Cosmetic only — no backend or data changes. Single-file revert if needed.
