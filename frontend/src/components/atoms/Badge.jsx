import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

/**
 * Badge — small pill for status/labels (e.g. "Booked", "Upcoming").
 * Pass `dot` to prefix a small colored dot (inherits the text color).
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-muted-foreground',
        accent: 'bg-accent/10 text-flame-600 dark:text-flame-400',
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        outline: 'border border-border text-foreground',
        flame: 'bg-flame-500 text-white',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export function Badge({ className, variant, dot, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}

// Every recognized role currently renders with the same solid flame style
// (previously trainee/volunteer/admin each had their own color — simplified
// to one consistent look, matching the rest of the app's palette). Kept as
// a set rather than a per-role map so an unrecognized role still falls back
// to a neutral badge instead of rendering with no color at all.
const KNOWN_ROLES = new Set(['trainee', 'volunteer', 'admin'])

/** RoleBadge — a Badge preset for a user's role pill, used in the navbar and admin user list. */
export function RoleBadge({ role, className }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1)
  const known = KNOWN_ROLES.has(role)
  return (
    <Badge
      variant={known ? 'flame' : 'neutral'}
      dot
      className={cn('ring-1 ring-inset', known ? 'ring-flame-600/30' : 'ring-border', className)}
    >
      {label}
    </Badge>
  )
}
