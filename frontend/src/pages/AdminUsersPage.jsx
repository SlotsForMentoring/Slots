import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { RoleBadge, Chip } from '@/components/atoms'

const ROLES = ['trainee', 'volunteer', 'admin']
const FILTERS = ['all', ...ROLES]

function UserCard({ user, onRoleChange }) {
  const [updating, setUpdating] = useState(false)

  const handleChange = async (e) => {
    setUpdating(true)
    await onRoleChange(user.id, e.target.value)
    setUpdating(false)
  }

  return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft-sm)] flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role} />
          <select
            value={user.role}
            onChange={handleChange}
            disabled={updating}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50"
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
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = filter === 'all'
    ? users
    : users.filter((user) => user.role === filter)

  const handleRoleChange = async (userId, newRole) => {
    const updated = await api.updateUserRole(userId, newRole)
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">

          <div className="mb-8">
            <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">Users</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage roles for all registered users.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-base font-semibold text-foreground">No users yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Users will appear here once they sign in.</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {FILTERS.map((f) => (
                  <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {' '}({f === 'all' ? users.length : users.filter((u) => u.role === f).length})
                  </Chip>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} onRoleChange={handleRoleChange} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
