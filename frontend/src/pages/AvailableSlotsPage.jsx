import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarSearch, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/atoms'
import { EmptyState, ErrorState, OfflineBanner, SearchBar, SlotCardSkeleton } from '@/components/molecules'
import { SlotCard } from '@/features/slots/SlotCard'
import { SlotFlowSheet } from '@/features/slots/SlotFlowSheet'
import { useAvailableSlots, useOnlineStatus } from '@/features/slots/useAvailableSlots'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { formatDate } from '@/lib/dateUtils'

export default function AvailableSlotsPage() {
  const { slots, state, reload, removeSlot } = useAvailableSlots()
  const online = useOnlineStatus()
  const [query, setQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selected, setSelected] = useState(null)

  // Every slot here is bookable, so every day with a slot just gets the
  // "available" dot on the calendar.
  const markedDates = useMemo(() => {
    const map = {}
    slots.forEach((slot) => {
      const dateStr = slot.start_time.slice(0, 10)
      map[dateStr] = { type: 'available' }
    })
    return map
  }, [slots])

  const filtered = useMemo(() => {
    return slots.filter((s) => {
      const matchesQuery = query.trim().length === 0 || s.volunteer_name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesDate = !selectedDate || s.start_time.slice(0, 10) === selectedDate
      return matchesQuery && matchesDate
    })
  }, [slots, query, selectedDate])

  const handleDayClick = (dateStr) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  const handleBooked = (slotId) => {
    removeSlot(slotId)
  }

  const handleSheetClose = () => {
    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <OfflineBanner show={!online} />

      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/90 px-5 pt-6 pb-4 backdrop-blur-md">
        <div>
          <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">Available Slots</p>
          <p className="text-sm text-muted-foreground mt-0.5">Find a mentor and book a session in one tap.</p>
        </div>

        <SearchBar
          placeholder="Search mentors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
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

        {state === 'loading' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SlotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {state === 'error' && (
          <ErrorState
            description="We couldn't load available slots. Check your connection and try again."
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
            title={query ? 'No mentors match your search' : selectedDate ? 'No slots on this day' : 'No slots available'}
            description={
              query
                ? 'Try a different name or clear your search.'
                : selectedDate
                  ? 'Pick a different day on the calendar, or clear the filter.'
                  : 'Check back later — mentors add new slots regularly.'
            }
          />
        )}

        {state === 'success' && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((slot, i) => (
              <SlotCard key={slot.id} slot={slot} index={i} onSelect={setSelected} />
            ))}
          </motion.div>
        )}
      </main>

      <SlotFlowSheet slot={selected} onClose={handleSheetClose} onBooked={handleBooked} />
    </div>
  )
}
