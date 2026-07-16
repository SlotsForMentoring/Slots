import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { api } from './services/api'
import { usePolling } from '@/hooks/usePolling'

import RootLayout     from '@/components/layouts/RootLayout'
import ProtectedRoute from '@/components/guards/ProtectedRoute'

import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/LoginPage'
import HomePage           from '@/pages/HomePage'
import AdminUsersPage     from '@/pages/AdminUsersPage'
import AvailableSlotsPage from '@/pages/AvailableSlotsPage'
import MySlots            from '@/pages/MySlots'
import MyBookings         from '@/pages/MyBookings'
import PrivacyPolicyPage  from '@/pages/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/TermsOfServicePage'

function AppRoutes() {
  const setUser   = useAuthStore((s) => s.setUser)
  const user      = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    api.getMe()
      .then((data) => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setUser])

  const refreshMe = useCallback(() => {
    if (!user) return
    api.getMe()
      .then((data) => {
        const oldRole = useAuthStore.getState().user?.role
        setUser(data)
        if (oldRole && data.role !== oldRole) {
          const dest = data.role === 'admin' ? '/admin/users'
                     : data.role === 'volunteer' ? '/my-slots'
                     : '/slots'
          navigate(dest, { replace: true })
        }
      })
      .catch(() => {})
  }, [user, setUser, navigate])

  usePolling(refreshMe)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<RootLayout />}>

        <Route path="/"       element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms"   element={<TermsOfServicePage />} />
        <Route path="/login" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/users' : '/'} replace />
            : <LoginPage />
        } />

        <Route element={<ProtectedRoute allowedRoles={['trainee']} />}>
          <Route path="/slots"    element={<AvailableSlotsPage />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/home"     element={<HomePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
          <Route path="/my-slots" element={<MySlots />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

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
