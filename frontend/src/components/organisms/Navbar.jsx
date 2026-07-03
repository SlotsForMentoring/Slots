import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import Logo from '@/components/atoms/Logo'
import Button from '@/components/atoms/Button'
import { RoleBadge } from '@/components/atoms/Badge'
import { cn } from '@/lib/cn'

/**
 * Role → nav links mapping.
 * Unauthenticated users see only the Sign in button (no links).
 */
const NAV_LINKS = {
  trainee:   [
    { label: 'Browse Slots', to: '/slots' },
    { label: 'My Bookings', to: '/bookings' },
  ],
  volunteer: [
    { label: 'My Slots', to: '/my-slots' },
  ],
  admin: [
    { label: 'Users', to: '/admin/users' },
  ],
}

const linkClass = ({ isActive }) =>
  cn(
    'text-sm font-medium px-1 py-0.5 border-b-2 transition-colors duration-150',
    isActive
      ? 'text-brand-600 border-brand-500'
      : 'text-gray-600 hover:text-gray-900 border-transparent',
  )

/**
 * Navbar — Organism  (ticket 5.2)
 *
 * Reads user from Zustand.
 * Shows different links per role.
 * Logout calls POST /auth/logout then clears store.
 */
export default function Navbar() {
  const user    = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate  = useNavigate()

  const links = user ? (NAV_LINKS[user.role] ?? []) : []

  const handleLogout = async () => {
    await api.logout()
    clearUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <NavLink to="/" aria-label="Mentoria home">
          <Logo size="sm" />
        </NavLink>

        {/* Centre links */}
        {links.length > 0 && (
          <ul className="hidden sm:flex items-center gap-6 list-none m-0 p-0">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>{label}</NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Right — auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-500">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </div>

      </nav>
    </header>
  )
}
