import { cn } from '@/lib/cn'

/** Shared icon-circle + title + description + action layout used by both EmptyState and ErrorState. */
function StateLayout({ iconWrapClassName, icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 px-6 text-center', className)}>
      <div className={cn('flex h-14 w-14 items-center justify-center rounded-full', iconWrapClassName)} aria-hidden="true">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** EmptyState — "nothing here yet" placeholder for empty lists. Pass any icon (usually a lucide-react icon). */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <StateLayout
      iconWrapClassName="bg-muted text-muted-foreground"
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}

const DEFAULT_ERROR_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

/** ErrorState — same layout as EmptyState, defaulted to a warning icon and "Something went wrong" copy. */
export function ErrorState({ title = 'Something went wrong', description, action, className }) {
  return (
    <StateLayout
      iconWrapClassName="bg-destructive/10 text-destructive"
      icon={DEFAULT_ERROR_ICON}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}

/** OfflineBanner — thin bar shown at the top of a page when the browser reports it's offline. */
export function OfflineBanner({ show }) {
  if (!show) return null
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-foreground text-background text-xs font-medium py-2 px-4">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
      You are offline — showing the last saved data
    </div>
  )
}
