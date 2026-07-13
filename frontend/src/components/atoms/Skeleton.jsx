import { cn } from '@/lib/cn'

/** Skeleton — a pulsing placeholder block used to build loading states (see molecules/SlotCardSkeleton). */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden="true" />
}
