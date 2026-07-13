import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

/** SearchBar — a pill-shaped text input with a search icon and an optional clear button (shown once `value` is non-empty). */
export function SearchBar({ className, value, onClear, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-full border border-border bg-card px-4 h-14 shadow-[var(--shadow-soft-sm)]',
        'transition-all duration-200 focus-within:shadow-[var(--shadow-soft-md)] focus-within:border-ink-300 dark:focus-within:border-ink-500',
        className,
      )}
    >
      <Search className="h-[18px] w-[18px] text-muted-foreground shrink-0" aria-hidden="true" />
      <input
        type="text"
        value={value}
        className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        {...props}
      />
      {!!value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
