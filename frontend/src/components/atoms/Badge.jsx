import { cn } from '@/lib/cn'

/**
 * RoleBadge — coloured pill for user role.
 * Usage: <RoleBadge role="trainee" />
 */
const roleStyles = {
  trainee:   'bg-blue-50   text-blue-700  ring-blue-600/20',
  volunteer: 'bg-green-50  text-green-700 ring-green-600/20',
  admin:     'bg-brand-50  text-brand-700 ring-brand-600/20',
}

export function RoleBadge({ role, className }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1)
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5',
      'text-xs font-medium ring-1 ring-inset',
      roleStyles[role] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20',
      className,
    )}>
      {label}
    </span>
  )
}

/**
 * StatusBadge — slot availability status.
 * Usage: <StatusBadge status="available" />
 */
const statusStyles = {
  available: 'bg-green-50  text-green-700 ring-green-600/20',
  booked:    'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  past:      'bg-gray-50   text-gray-500  ring-gray-500/20',
}

export function StatusBadge({ status, dot = true, className }) {
  const labels = { available: 'Available', booked: 'Booked', past: 'Past' }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
      'text-xs font-medium ring-1 ring-inset',
      statusStyles[status] ?? 'bg-gray-50 text-gray-500 ring-gray-500/20',
      className,
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {labels[status] ?? status}
    </span>
  )
}
