import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const fieldClasses = (error, className) =>
  cn(
    'rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground',
    'outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20',
    error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
    className,
  )

/** Label + hint/error text shared by TextField and TextAreaField, so both stay in sync. */
function FieldChrome({ inputId, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/** TextField — a single-line input with label/hint/error, wired up for accessibility (aria-describedby, aria-invalid). */
export const TextField = forwardRef(function TextField(
  { className, label, hint, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <FieldChrome inputId={inputId} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={inputId}
        className={cn('h-12', fieldClasses(error, className))}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
    </FieldChrome>
  )
})

/** TextAreaField — the multi-line counterpart to TextField, same label/hint/error behavior. */
export const TextAreaField = forwardRef(function TextAreaField(
  { className, label, hint, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <FieldChrome inputId={inputId} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={inputId}
        className={cn('py-3 resize-none', fieldClasses(error, className))}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
    </FieldChrome>
  )
})
