import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarSearch, RefreshCw } from 'lucide-react'
import { Chip, Button } from '@/components/atoms'
import { EmptyState, ErrorState, SlotCardSkeleton } from '@/components/molecules'
import { MySlotCard } from '@/features/slots/MySlotCard'
import { useMySlots } from '@/features/slots/useMySlots'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { SlotCreateModal } from '@/features/calendar/SlotCreateModal'

export default function MySlots() {
  const { slots, state, reload, addSlot, removeSlot, cancelSlotBooking } = useMySlots()
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalDate, setModalDate] = useState(null)
  const [filter, setFilter] = useState('all')

  // Build markedDates from slots for the calendar
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

  const filtered = useMemo(() => {
    if (filter === 'available') return slots.filter((s) => !s.is_booked)
    if (filter === 'booked') return slots.filter((s) => s.is_booked)
    return slots
  }, [slots, filter])

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr)
    setModalDate(dateStr)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/90 px-5 pt-6 pb-4 backdrop-blur-md">
        <div>
          <p className="[font-family:var(--font-family-display)] text-[26px] font-semibold tracking-tight text-foreground">My Slots</p>
          <p className="text-sm text-muted-foreground mt-0.5">Tap a day to create a slot. Past days and booked slots cannot be deleted.</p>
        </div>
      </header>

      <main className="px-5 pt-6 max-w-5xl mx-auto">

        <div className="relative mb-8">
          {/* Blurred color blobs behind the glass card — this is what the
              frosted panel's backdrop-blur picks up to create the liquid-glass look */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -top-24 -z-10 h-72 overflow-hidden blur-3xl">
            <div className="absolute left-6 top-0 h-52 w-52 rounded-full bg-flame-400 opacity-50 dark:opacity-30" />
            <div className="absolute right-10 top-8 h-44 w-44 rounded-full bg-flame-600 opacity-40 dark:opacity-25" />
          </div>
          <CalendarGrid
            markedDates={markedDates}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        </div>

        <div className="flex gap-2 mb-6">
          <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>All</Chip>
          <Chip selected={filter === 'available'} onClick={() => setFilter('available')}>Available</Chip>
          <Chip selected={filter === 'booked'} onClick={() => setFilter('booked')}>Booked</Chip>
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
            description="Could not load your slots. Please try again."
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
            description={slots.length === 0 ? 'Tap any future day on the calendar to create your first slot.' : 'Try a different filter.'}
          />
        )}

        {state === 'success' && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((slot, i) => (
              <MySlotCard key={slot.id} slot={slot} index={i} onDelete={removeSlot} onCancelBooking={cancelSlotBooking} />
            ))}
          </motion.div>
        )}

      </main>

      {modalDate && (
        <SlotCreateModal
          date={modalDate}
          onCreated={addSlot}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  )
}
