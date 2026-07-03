import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./stores/authStore"
import { api } from "./services/api"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import AdminUsersPage from "./pages/AdminUsersPage"

function ProtectedRoute({ children, role }) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function getHomeRoute(role) {
  if (role === "admin") return "/admin/users"
  return "/"
}

function AppRoutes() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe()
      .then((data) => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setUser])

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getHomeRoute(user.role)} replace /> : <LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === "admin" ? <Navigate to="/admin/users" replace /> : <HomePage />}
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersPage /></ProtectedRoute>} />
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
