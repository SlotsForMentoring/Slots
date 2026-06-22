# Team Workflow

## Git Flow (Vincent Driessen)

This project uses Git Flow. Every developer must understand this before writing any code.

### Branches

- `main` — production. Always deployable. Never touched directly.
- `develop` — active development. The next version lives here. Must always work.
- `feature/*` — one per task. Created from `develop`, merged back into `develop` via PR.
- `fix/*` — same as feature but for bug fixes.

```
feature/slot-management  ──┐
feature/admin-roles      ──┼──→  develop  ──→  main
fix/booking-validation   ──┘
```

### Rules

1. **Never clone from `main`.** Always branch from `develop`.
2. **Never push directly to `main` or `develop`.** Everything goes through a PR with review.
3. `develop` and `main` must always work. If `develop` is broken, fixing it is the top priority.
4. When `develop` has enough complete and tested features, we open a PR from `develop` → `main` to release a new version.

### Why never clone from `main`?

`main` is the current production version. It does not have the latest work from the team. If you branch from `main`, your code will be based on an old version and you will have merge conflicts when trying to merge into `develop`. Always start from `develop` — that is where the latest code lives.

### Workflow for every task

1. Pull the latest `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Work, commit, push your branch
4. Open a PR from your branch → `develop`
5. Ask for review in Slack
6. Do not merge without approval

### PR format

- Clear title describing the feature or fix
- Numbered list of changes:
  ```
  1. Added POST /slots endpoint with overlap validation
  2. Added Slot model and migration
  3. Added unit test for slot creation
  ```

---

## One ticket at a time

Finish your current ticket before picking up a new one. A ticket is a single task (one endpoint, one page, one migration) — not an entire feature from database to frontend. Different developers can work on different parts of the same feature in parallel.

---

## Tickets

- Every task needs a ticket before you start working on it
- If the ticket does not exist, tell the team before creating it
- Each ticket must have: description, assignee, and updated status
- Epics are documented in `docs/epics/` — tickets come from those epics

---

## Communication (Slack)

1. **Starting work:** "Working on [ticket], branch: `feature/name`"
2. **Finished:** "Opened PR #number for [ticket]"
3. **Blocked or incomplete:** say it clearly so someone else can help or be aware

---

## Daily checklist

- [ ] I pulled the latest `develop` before starting
- [ ] I have a ticket for what I am doing
- [ ] I am working on my own branch (not `main` or `develop`)
- [ ] I told the team in Slack what I am working on
- [ ] My PR has a numbered description of changes
- [ ] I asked for a review before merging
