import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Card — the shared bordered/rounded surface used by every list card in the
 * app (slots, bookings, etc). Pass `interactive` for cards that respond to
 * hover/press (e.g. clickable slot cards); leave it off for static ones.
 *
 * Wrap with `motion(Card)` when you need entrance/layout animation — Card
 * itself stays a plain forwardRef div so it composes cleanly with
 * framer-motion.
 */
export const Card = forwardRef(function Card({ className, interactive = false, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-[var(--shadow-soft-sm)]',
        interactive &&
          'transition-all duration-200 ease-out hover:shadow-[var(--shadow-soft-md)] hover:border-ink-300 dark:hover:border-ink-500 cursor-pointer active:scale-[0.99]',
        className,
      )}
      {...props}
    />
  )
})
