# API Contract: Admin

All admin endpoints require authentication via httpOnly cookie (`session_token`). User must have `role: admin`.

---

## GET /admin/users

List all users in the system.

**Query params:** `?role=volunteer` (optional filter)

**Response 200:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "jane@gmail.com",
    "name": "Jane Doe",
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "role": "trainee",
    "created_at": "2026-06-22T10:00:00Z"
  }
]
```

**Response 403:** `{ "detail": "Insufficient permissions" }`

---

## PATCH /admin/users/{user_id}/role

Update a user's role. Only admin can do this.

**Path param:** `user_id` (UUID)

**Request body:**
```json
{
  "role": "volunteer"
}
```

Valid roles: `trainee`, `volunteer`, `admin`

**Response 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "jane@gmail.com",
  "name": "Jane Doe",
  "profile_picture": "https://lh3.googleusercontent.com/...",
  "role": "volunteer",
  "created_at": "2026-06-22T10:00:00Z"
}
```

**Response 404:** `{ "detail": "User not found" }`
**Response 403:** `{ "detail": "Insufficient permissions" }`
**Response 422:** `{ "detail": "Invalid role" }`
