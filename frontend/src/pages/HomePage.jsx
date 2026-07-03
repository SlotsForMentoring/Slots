import { useAuthStore } from "../stores/authStore"
import { api } from "../services/api"
import { useNavigate } from "react-router-dom"

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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Pair Scheduling</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          Logout
        </button>
      </div>
      {user && (
        <table className="w-full text-left text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-gray-500">Name</td>
              <td className="py-2">{user.name}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-gray-500">Email</td>
              <td className="py-2">{user.email}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-gray-500">Role</td>
              <td className="py-2">{user.role}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}
