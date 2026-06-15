# Team Workflow Guide

> This document has the rules for how we work together as a team.
> The goal is to keep the code clean, the team informed, and the progress clear.

---

## 1. Main rule: finish one thing before starting the next

We work on one feature at a time, from start to finish.

This means:
- Build the feature in the backend (API — Application Programming Interface, logic, database).
- Connect it in the frontend.
- Test that it works end-to-end (from the user to the database and back).
- Only then we move to the next feature.

**The only thing we can leave for the end is design and CSS (Cascading Style Sheets) styles.
First make it work, then make it look good.**

**Correct example:**
Authentication → build in backend → connect in frontend → test login/logout → ✅ done → next feature.

**Wrong example:**
Build authentication in the backend, "it works in the backend, we will connect the frontend later together with roles and permissions".

> We do not mix different features in the same cycle. Authorization, roles, permissions — each one is a separate feature with its own cycle.

---

## 2. Jira — task management

- Every task needs a ticket in Jira before you start working on it.
- If the ticket does not exist, **create it yourself** before you start.
- Each ticket must have:
  - A clear description of what you are going to do.
  - An assigned person (who is working on it).
  - An updated status (In Progress, In Review, Done).
- Jira is the official record of work. It is not for real-time communication.

---

## 3. Git — branches and commits

### Branch structure

The project uses three levels of branches:

```
feature/auth-login  ──┐
feature/user-profile ─┼──→  develop  ──→  main
fix/cart-total-bug  ──┘
```

- `main` — **production** code. What the final user sees. Never touch this directly.
- `develop` — **active development** branch. All team work goes here first.
- `feature/*` / `fix/*` — individual branches, one per task or fix.

**Rules:**
- We work by **cloning** the repository, not forking it.
- **Never push directly to `main` or `develop`**, no matter how small the change is.
- All changes go to `develop` only through a reviewed and approved PR (Pull Request).
- `develop` goes to `main` also through a PR, when the project lead decides there is enough complete and stable work to make a release (a new version).

### Before you start working

Always do `pull` from `develop` first, to make sure you have the latest code:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### When you finish and want to upload your changes

1. Push your branch to the remote repository.
2. Open a PR **from your feature branch to `develop`** (not to `main`).
3. The PR must include:
   - A clear title that describes the feature or fix.
   - A numbered list of the changes you made. Example:
     ```
     1. Added POST /auth/login endpoint with credential validation.
     2. Added JWT (JSON Web Token) verification middleware.
     3. Connected the login form in the frontend to the API.
     4. Tested login and logout — both work correctly.
     ```
4. Tell the team in Slack that you opened a PR and ask **at least one team member to review the code** before merging.
5. Do not merge without approval.

### When do we merge `develop` into `main`?

Not after every single feature. The project lead decides when `develop` has enough complete and tested work to make a release. At that point, we open a PR from `develop` → `main`, review it as a team, and merge.

---

## 4. Communication — Slack for real-time updates

Jira records the work, but **Slack is where the team stays informed in real time**.

Always communicate:

- **When you start:** "I am going to work on [feature/fix], branch: `feature/name`".
- **When you finish:** "I finished [feature/fix], I opened PR #number, still missing: [what is left]".
- **If something is not done:** say it clearly so another team member can continue or be aware.

> We move step by step, but always with the whole team knowing what is happening.

---

## 5. Coordination before you start

Before you pick up a task:

1. Ask in Slack what still needs to be done or what fix is pending.
2. Check Jira to see the current status of all tasks.
3. Confirm with the team that nobody else is already working on the same thing.

This avoids duplicated work and merge conflicts (when two people change the same code at the same time).

---

## 6. Team culture

- **If you have a question, ask.** Asking for help is the right thing to do.
- **Suggestions are welcome** — if you see a better way to do something, say it.
- **The goal is to learn together and build something that works well.**
- Code review in PRs is not about criticizing. It is about improving and learning together.

---

## Quick summary — daily checklist

```
[ ] I did pull before I started
[ ] I have a ticket in Jira for what I am going to do
[ ] I am working on my own branch (not on main or develop)
[ ] I told the team in Slack what I am working on
[ ] My feature is complete (backend + frontend + tested) before I move to the next one
[ ] I opened a PR with a numbered description
[ ] I asked for a review in Slack
[ ] When I finished, I told the team what is still missing
```