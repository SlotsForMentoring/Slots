import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
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
    { label: 'All Slots', to: '/admin/slots' },
  ],
}

const linkClass = ({ isActive }) =>
  cn(
    'text-sm font-medium px-1 py-0.5 border-b-2 transition-colors duration-150',
    isActive
      ? 'text-flame-600 dark:text-flame-400 border-flame-500'
      : 'text-muted-foreground hover:text-foreground border-transparent',
  )

const mobileLinkClass = ({ isActive }) =>
  cn(
    'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
    isActive
      ? 'text-flame-600 dark:text-flame-400 bg-flame-50 dark:bg-flame-500/10'
      : 'text-foreground hover:bg-muted',
  )

export default function Navbar() {
  const user      = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)
  const { dark, toggle: toggleTheme } = useThemeStore()

  const links = user ? (NAV_LINKS[user.role] ?? []) : []

  const handleLogout = async () => {
    await api.logout()
    clearUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        <NavLink to="/" aria-label="iMeet home">
          <Logo size="xl" />
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
          <button
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-flame-500 flex items-center justify-center text-xs font-semibold text-white ring-2 ring-border">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className="text-sm text-muted-foreground">{user.name}</span>
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
          className="sm:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
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
        <div className="sm:hidden border-t border-border bg-card px-4 pb-4">
          {user && (
            <div className="flex items-center gap-2 py-3 mb-1 border-b border-border">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-flame-500 flex items-center justify-center text-xs font-semibold text-white">
                  {user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-sm text-muted-foreground">{user.name}</span>
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
          <button
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
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
