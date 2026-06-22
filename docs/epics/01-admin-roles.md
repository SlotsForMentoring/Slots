# Epic 1: Admin Role Management

## Description

An admin can list all users and change their roles (trainee → volunteer, etc.). This is the prerequisite for the entire system — without volunteers, there are no slots.

## Acceptance Criteria

- [ ] Admin can see a list of all registered users with their current role
- [ ] Admin can change a user's role to trainee, volunteer, or admin
- [ ] Non-admin users get 403 when accessing admin endpoints
- [ ] Role changes take effect immediately (next request uses new role)

## User Flow

```
Admin (UI)                    Server (API)                  Database
─────────                     ────────────                  ────────
Opens admin page         →    GET /admin/users         →    SELECT * FROM users
Sees list of users       ←    [{ id, email, role }]    ←    returns rows

Clicks "Make Volunteer"  →    PATCH /admin/users/:id/role → UPDATE users SET role='volunteer'
  body: { role: volunteer }                                  WHERE id = :id
Sees updated role        ←    { id, email, role }      ←    returns updated row
```

## Contract

[admin.md](../contracts/admin.md)

## Tickets

### 1.1 — Role authorization middleware
Create a `require_role(role)` dependency that checks `user.role` and raises 403 if not authorized. Reusable across all epics.
- Input: current user from `get_current_user`
- Output: raises `HTTPException(403)` or passes through
- Files: `api/app/dependencies/auth.py`

### 1.2 — List users endpoint
`GET /admin/users` with optional `?role=` filter. Protected by `require_role("admin")`.
- Input: optional query param `role`
- Output: list of `UserResponse`
- Contract: [admin.md](../contracts/admin.md)
- Files: `api/app/routers/admin.py`, `api/app/crud/users.py`

### 1.3 — Update user role endpoint
`PATCH /admin/users/{user_id}/role`. Protected by `require_role("admin")`. Validates role is one of the allowed values.
- Input: path `user_id`, body `{ role }`
- Output: updated `UserResponse`
- Contract: [admin.md](../contracts/admin.md)
- Files: `api/app/routers/admin.py`, `api/app/crud/users.py`, `api/app/schemas/user.py`
