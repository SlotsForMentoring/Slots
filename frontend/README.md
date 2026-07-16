# iMeet Frontend

The web interface for the iMeet scheduling platform. Built with React and styled with Tailwind CSS.

## Tech Stack

- **React 19** with functional components and hooks
- **Vite 8** for fast development and builds
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **React Router 7** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set the API URL in `.env`:

```bash
# Local development (backend running on port 8000)
VITE_API_URL=http://localhost:8000

# Production (Netlify proxy)
VITE_API_URL=/api
```

## Run

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview    # preview the production build
```

## Pages

| Path | Role | Page |
|------|------|------|
| `/` | public | Landing page |
| `/login` | public | Login with Google |
| `/slots` | trainee | Browse and book available slots |
| `/bookings` | trainee | View my bookings |
| `/home` | trainee | Home dashboard |
| `/my-slots` | volunteer | Manage my time slots |
| `/admin/users` | admin | Manage user roles |
| `/privacy` | public | Privacy policy |
| `/terms` | public | Terms of service |

## Architecture

The frontend uses **Atomic Design** to organize components:

```
src/
├── components/
│   ├── atoms/          # Small, reusable elements (Button, Badge, Card, Avatar)
│   ├── molecules/      # Combinations of atoms (BottomSheet, SearchBar, EmptyState)
│   ├── organisms/      # Full UI sections (Navbar, ConsentBanner)
│   ├── guards/         # Route protection (ProtectedRoute)
│   └── layouts/        # Page wrappers (RootLayout)
├── features/           # Feature-specific components
│   ├── calendar/       # Calendar grid, slot creation modal
│   └── slots/          # Slot cards, booking cards, data hooks
├── pages/              # One component per route
├── services/           # API client (all fetch calls in one place)
├── stores/             # Zustand stores (auth state)
├── lib/                # Utility functions (dates, classnames)
└── mocks/              # Mock data for development
```

### Rules

- **Atoms** — No business logic, no API calls. Reusable in any project
- **Molecules** — Combine atoms, minimal logic, presentation only
- **Organisms** — Full page sections, can fetch data or receive it as props
- **Pages** — One per route, connect data to organisms

### Data Flow

```
Pages → fetch data → pass to Organisms → Organisms use Molecules → Molecules use Atoms
```

No API calls inside atoms or molecules.

## Deploy

The frontend is deployed on **Netlify**. The `netlify.toml` file proxies `/api/*` requests to the backend on Railway, so the frontend and API share the same domain in production.
