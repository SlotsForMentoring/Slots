import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Button — the single button primitive for the app.
 *
 * All visual variants/sizes are defined once here via `cva` so every button
 * in the app (nav, forms, cards, hero CTAs) stays visually consistent.
 * Do not create a second Button component — extend the variants below instead.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium select-none',
    'transition-all duration-200 ease-out cursor-pointer',
    'active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-[var(--shadow-soft-sm)] hover:shadow-[var(--shadow-soft-md)] hover:brightness-105',
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:border-ink-300 dark:hover:border-ink-500',
        ghost: 'text-foreground hover:bg-muted',
        outline: 'border border-border text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:brightness-105',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-4 text-[13px] rounded-full',
        md: 'h-11 px-5 text-sm rounded-full',
        lg: 'h-[3.25rem] px-7 text-base rounded-full',
        icon: 'h-11 w-11 rounded-full shrink-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export const Button = forwardRef(function Button(
  { className, variant, size, fullWidth, loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})
