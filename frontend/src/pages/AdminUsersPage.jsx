import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { RoleBadge } from '@/components/atoms'

const ROLES = ['trainee', 'volunteer', 'admin']

function UserCard({ user, onRoleChange }) {
  const [updating, setUpdating] = useState(false)

  const handleChange = async (e) => {
    setUpdating(true)
    await onRoleChange(user.id, e.target.value)
    setUpdating(false)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <RoleBadge role={user.role} />
        <select
          value={user.role}
          onChange={handleChange}
          disabled={updating}
          className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition disabled:opacity-50"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    const updated = await api.updateUserRole(userId, newRole)
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Users</h1>
        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
          Manage roles for all registered users.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-500/5 p-5 text-sm text-danger-600 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-semibold text-gray-900">No users yet</p>
          <p className="mt-1 text-sm text-gray-500">Users will appear here once they sign in.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onRoleChange={handleRoleChange} />
          ))}
        </div>
      )}

    </div>
  )
}
