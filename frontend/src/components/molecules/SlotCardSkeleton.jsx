import { Skeleton } from '@/components/atoms'

/** SlotCardSkeleton — loading placeholder shaped like a slot/booking card, built from Skeleton atoms. */
export function SlotCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  )
}
