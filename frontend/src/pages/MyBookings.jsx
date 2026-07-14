import { CalendarClock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/atoms'
import { EmptyState, ErrorState, SlotCardSkeleton } from '@/components/molecules'
import { BookingCard } from '@/features/slots/BookingCard'
import { useMyBookings } from '@/features/slots/useMyBookings'

function isPast(iso) {
  return new Date(iso) < new Date()
}

export default function MyBookings() {
  const { bookings, state, reload, removeBooking } = useMyBookings()

  const upcoming = bookings.filter((b) => !isPast(b.slot.end_time))
  const past     = bookings.filter((b) =>  isPast(b.slot.end_time))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">

        <div className="mb-8 sm:mb-10">
          <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">My Bookings</p>
          <p className="text-sm text-muted-foreground mt-0.5">Your scheduled 1-on-1 sessions with volunteer mentors.</p>
        </div>

        {state === 'loading' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SlotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {state === 'error' && (
          <ErrorState
            description="Could not load your bookings. Please try again."
            action={
              <Button variant="secondary" onClick={reload}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            }
          />
        )}

        {state === 'success' && bookings.length === 0 && (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" aria-hidden="true" />}
            title="No bookings yet"
            description="Browse available slots to book your first session."
          />
        )}

        {state === 'success' && upcoming.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Upcoming</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((b, i) => <BookingCard key={b.id} booking={b} index={i} onDelete={removeBooking} />)}
            </div>
          </div>
        )}

        {state === 'success' && past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Past</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
