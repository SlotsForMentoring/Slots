import { cn } from '@/lib/cn'

/** Chip — a small toggle pill button, used for filter groups (e.g. All / Today / This week). */
export function Chip({ className, selected = false, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium',
        'transition-all duration-200 ease-out active:scale-[0.96] cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'bg-foreground text-background'
          : 'bg-secondary text-secondary-foreground border border-border hover:border-ink-300 dark:hover:border-ink-500',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
