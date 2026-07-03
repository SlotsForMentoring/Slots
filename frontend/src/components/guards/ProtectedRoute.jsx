import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * ProtectedRoute — Guard  (ticket 5.2)
 *
 * Redirects to /login if not authenticated.
 * Redirects to / if authenticated but wrong role.
 *
 * Usage in App.jsx (wraps nested routes via <Outlet />):
 *   <Route element={<ProtectedRoute allowedRoles={['trainee']} />}>
 *     <Route path="/slots" element={<SlotsPage />} />
 *   </Route>
 *
 * Props:
 *   allowedRoles  string[]  e.g. ['trainee', 'admin']
 *                           Omit to allow any authenticated user.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
