import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { api } from './services/api'

// Layout + guards
import RootLayout     from '@/components/layouts/RootLayout'
import ProtectedRoute from '@/components/guards/ProtectedRoute'

// Pages
import LandingPage    from '@/pages/LandingPage'
import LoginPage      from '@/pages/LoginPage'
import HomePage       from '@/pages/HomePage'
import AdminUsersPage from '@/pages/AdminUsersPage'

// Placeholder — replace when epics are implemented
const Placeholder = ({ title }) => (
  <div className="mx-auto max-w-5xl px-6 py-16">
    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
    <p className="mt-2 text-gray-500">Coming in a future sprint.</p>
  </div>
)

/**
 * AppRoutes — hydrates auth state from cookie on load, then renders routes.
 *
 * Cookie auth flow:
 *   1. On mount → GET /auth/me (backend reads cookie, returns user)
 *   2. User stored in Zustand → Navbar + ProtectedRoute react immediately
 *   3. On logout → POST /auth/logout clears cookie + Zustand
 */
function AppRoutes() {
  const setUser   = useAuthStore((s) => s.setUser)
  const user      = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe()
      .then((data) => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setUser])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<RootLayout />}>

        {/* ── Public ── */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/users' : '/'} replace />
            : <LoginPage />
        } />

        {/* ── Trainee ── */}
        <Route element={<ProtectedRoute allowedRoles={['trainee']} />}>
          <Route path="/slots"    element={<Placeholder title="Available Slots" />} />
          <Route path="/bookings" element={<Placeholder title="My Bookings" />} />
          <Route path="/home"     element={<HomePage />} />
        </Route>

        {/* ── Volunteer ── */}
        <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
          <Route path="/my-slots" element={<Placeholder title="My Slots" />} />
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
