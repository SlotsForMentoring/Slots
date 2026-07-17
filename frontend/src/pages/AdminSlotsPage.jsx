import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarSearch, RefreshCw, X } from 'lucide-react'
import { Chip, Button } from '@/components/atoms'
import { EmptyState, ErrorState, SlotCardSkeleton } from '@/components/molecules'
import { AdminSlotCard } from '@/features/slots/AdminSlotCard'
import { useAllSlots } from '@/features/slots/useAllSlots'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { formatDate } from '@/lib/dateUtils'

const STATUS_FILTERS = ['all', 'available', 'booked']

export default function AdminSlotsPage() {
  const { slots, state, reload } = useAllSlots()
  const [selectedDate, setSelectedDate] = useState(null)
  const [filter, setFilter] = useState('all')

  const markedDates = useMemo(() => {
    const map = {}
    slots.forEach((slot) => {
      const dateStr = slot.start_time.slice(0, 10)
      const type = slot.is_booked ? 'booked' : 'available'
      if (!map[dateStr]) {
        map[dateStr] = { type }
      } else if (map[dateStr].type !== type) {
        map[dateStr] = { type: 'mixed' }
      }
    })
    return map
  }, [slots])

  const byDate = useMemo(() => {
    if (!selectedDate) return slots
    return slots.filter((s) => s.start_time.slice(0, 10) === selectedDate)
  }, [slots, selectedDate])

  const availableCount = useMemo(() => byDate.filter((s) => !s.is_booked).length, [byDate])
  const bookedCount = useMemo(() => byDate.filter((s) => s.is_booked).length, [byDate])

  const filtered = useMemo(() => {
    if (filter === 'available') return byDate.filter((s) => !s.is_booked)
    if (filter === 'booked') return byDate.filter((s) => s.is_booked)
    return byDate
  }, [byDate, filter])

  const handleDayClick = (dateStr) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/90 px-5 pt-6 pb-4 backdrop-blur-md">
        <div>
          <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">All Slots</p>
          <p className="text-sm text-muted-foreground mt-0.5">Read-only view across every mentor's slots.</p>
        </div>
      </header>

      <main className="px-5 pt-6 max-w-5xl mx-auto">

        <div className="mb-6">
          <CalendarGrid
            markedDates={markedDates}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-flame-400 transition-colors"
            >
              {formatDate(selectedDate)}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {' '}({f === 'all' ? byDate.length : f === 'available' ? availableCount : bookedCount})
            </Chip>
          ))}
        </div>

        {state === 'loading' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SlotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {state === 'error' && (
          <ErrorState
            description="Could not load slots. Please try again."
            action={
              <Button variant="secondary" onClick={reload}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            }
          />
        )}

        {state === 'success' && filtered.length === 0 && (
          <EmptyState
            icon={<CalendarSearch className="h-6 w-6" aria-hidden="true" />}
            title={slots.length === 0 ? 'No slots yet' : 'No slots match this filter'}
            description={slots.length === 0 ? 'Slots will appear here once mentors create them.' : 'Try a different filter or date.'}
          />
        )}

        {state === 'success' && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((slot, i) => (
              <AdminSlotCard key={slot.id} slot={slot} index={i} />
            ))}
          </motion.div>
        )}

      </main>
    </div>
  )
}
