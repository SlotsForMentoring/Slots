import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import { Logo, Button, RoleBadge } from '@/components/atoms'
import { cn } from '@/lib/cn'

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

const mobileLinkClass = ({ isActive }) =>
  cn(
    'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
    isActive
      ? 'text-brand-600 bg-brand-50'
      : 'text-gray-700 hover:bg-gray-50',
  )

export default function Navbar() {
  const user      = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const links = user ? (NAV_LINKS[user.role] ?? []) : []

  const handleLogout = async () => {
    await api.logout()
    clearUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        <NavLink to="/" aria-label="AgenGate home">
          <Logo size="sm" />
        </NavLink>

        {links.length > 0 && (
          <ul className="hidden sm:flex items-center gap-6 list-none m-0 p-0">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>{label}</NavLink>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
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

        <button
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

      </nav>

      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 pb-4">
          {user && (
            <div className="flex items-center gap-2 py-3 mb-1 border-b border-gray-100">
              <span className="text-sm text-gray-500">{user.name}</span>
              <RoleBadge role={user.role} />
            </div>
          )}
          {links.length > 0 && (
            <ul className="list-none m-0 p-0 mt-1 mb-2">
              {links.map(({ label, to }) => (
                <li key={to}>
                  <NavLink to={to} className={mobileLinkClass} onClick={() => setOpen(false)}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
          {user ? (
            <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button size="sm" fullWidth onClick={() => { navigate('/login'); setOpen(false) }}>
              Sign in
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
