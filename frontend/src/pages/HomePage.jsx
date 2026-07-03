import { useAuthStore } from "../stores/authStore"
import { api } from "../services/api"
import { useNavigate, Link } from "react-router-dom"

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.logout()
    clearUser()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pair Scheduling</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Logout
          </button>
        </div>
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-900 font-medium">{user.name}</p>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">Role: {user.role}</p>
            {user.role === "admin" && (
              <Link to="/admin/users" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
                Manage users
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
