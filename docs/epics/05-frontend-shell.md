# Epic 5: Frontend Shell

## Description

The React frontend that connects everything: Google login, role-based navigation, and pages for each user story. Works against mock data initially, switches to real APIs as backends are deployed.

## Acceptance Criteria

- [ ] User can log in with Google and see their role
- [ ] Navigation shows different options based on role (trainee, volunteer, admin)
- [ ] Trainee can browse available slots and book one
- [ ] Volunteer can create slots and see their slots with booking info
- [ ] Admin can see users and change roles
- [ ] Logout clears the token and redirects to login

## Pages

| Page | Route | Role | Consumes |
|------|-------|------|----------|
| Login | `/` | Public | `GET /auth/login` |
| Available Slots | `/slots` | Trainee | `GET /slots/available`, `POST /bookings` |
| My Bookings | `/bookings` | Trainee | `GET /bookings/mine` |
| My Slots | `/volunteer/slots` | Volunteer | `GET /slots/mine`, `POST /slots`, `DELETE /slots/:id` |
| Admin Users | `/admin/users` | Admin | `GET /admin/users`, `PATCH /admin/users/:id/role` |

## Mock Data Strategy

While backend APIs are not ready, the frontend dev uses hardcoded mock data in a local file (e.g., `src/mocks/`). The API client module (`src/services/api.js`) has a single place to switch between mock and real.

```
src/
  services/
    api.js          ← single module for all API calls
  mocks/
    slots.json      ← mock available slots
    bookings.json   ← mock bookings
    users.json      ← mock user list
```

When a real endpoint is deployed, the dev removes the mock import and the API call goes to the real server. No other changes needed.

## Tickets

### 5.1 — Auth flow (login/logout + token storage)
Implement Google login redirect, token storage in localStorage, and logout. Create an auth context that provides the current user and token to all components.
- Consumes: `GET /auth/login`, `GET /auth/me`
- Files: `slots/src/services/api.js`, `slots/src/context/AuthContext.jsx`

### 5.2 — Routing + layout + role-based navbar
Set up React Router with protected routes. Navbar shows different links based on user role. Redirect unauthorized users.
- Dependencies: needs auth context from 5.1
- Files: `slots/src/App.jsx`, `slots/src/components/Navbar.jsx`, `slots/src/components/ProtectedRoute.jsx`

### 5.3 — Available slots page (trainee)
Page that lists available slots and allows booking. Shows a confirmation when booked.
- Consumes: `GET /slots/available`, `POST /bookings`
- Contract: [slots.md](../contracts/slots.md), [bookings.md](../contracts/bookings.md)
- Files: `slots/src/pages/AvailableSlots.jsx`

### 5.4 — My slots page (volunteer)
Page where volunteer creates new slots (date/time picker) and sees their existing slots with booking info. Can delete unbooked slots.
- Consumes: `POST /slots`, `GET /slots/mine`, `DELETE /slots/:id`
- Contract: [slots.md](../contracts/slots.md)
- Files: `slots/src/pages/MySlots.jsx`

### 5.5 — My bookings page (trainee)
Page that lists the trainee's booked sessions with volunteer info and time.
- Consumes: `GET /bookings/mine`
- Contract: [bookings.md](../contracts/bookings.md)
- Files: `slots/src/pages/MyBookings.jsx`

### 5.6 — Admin users page
Page where admin sees all users and can change their roles via dropdown.
- Consumes: `GET /admin/users`, `PATCH /admin/users/:id/role`
- Contract: [admin.md](../contracts/admin.md)
- Files: `slots/src/pages/AdminUsers.jsx`
