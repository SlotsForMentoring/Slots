import { useEffect, useMemo, useState } from 'react'
import { api } from '@/services/api'
import { StatusBadge } from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import SlotCreateModal from '@/components/calendar/SlotCreateModal'
import { formatDate, formatTime } from '@/lib/dateUtils'

function SlotCard({ slot, onDelete }) {
  const isBooked = slot.is_booked
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteSlot(slot.id)
      onDelete(slot.id)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('409')) setDeleteError('Slot is already booked and cannot be deleted.')
      else if (msg.includes('403')) setDeleteError('You can only delete your own slots.')
      else setDeleteError('Could not delete slot. Please try again.')
      setConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(slot.start_time)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </p>
        </div>
        <StatusBadge status={isBooked ? 'booked' : 'available'} />
      </div>

      {isBooked && slot.booking && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-sm space-y-1">
          <p>
            <span className="text-gray-500">Trainee </span>
            <span className="font-medium text-gray-900">{slot.booking.trainee_name}</span>
          </p>
          <p>
            <span className="text-gray-500">Email </span>
            <span className="text-gray-700">{slot.booking.trainee_email}</span>
          </p>
          {slot.booking.agenda && (
            <p>
              <span className="text-gray-500">Agenda </span>
              <span className="text-gray-700">{slot.booking.agenda}</span>
            </p>
          )}
        </div>
      )}

      {!isBooked && (
        <div className="mt-auto">
          {!confirm ? (
            <Button variant="danger" size="sm" fullWidth onClick={() => setConfirm(true)}>
              Delete slot
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 text-center">Are you sure?</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => setConfirm(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" fullWidth loading={deleting} onClick={handleDelete}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
          {deleteError && (
            <p className="mt-2 text-xs text-danger-600 font-medium">{deleteError}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function MySlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalDate, setModalDate] = useState(null)

  useEffect(() => {
    api.getMySlots()
      .then(setSlots)
      .catch(() => setError('Could not load your slots. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

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

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr)
    setModalDate(dateStr)
  }

  const handleCreated = (newSlot) => {
    setSlots((prev) => [newSlot, ...prev])
  }

  const handleDeleted = (id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Slots</h1>
        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
          Tap a day to create a slot. Past days and booked slots cannot be deleted.
        </p>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm mb-10">
        <CalendarGrid
          markedDates={markedDates}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Slot list */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-500/5 p-5 text-sm text-danger-600 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && slots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No slots yet</p>
          <p className="mt-1 text-sm text-gray-500">Tap any future day on the calendar to create your first slot.</p>
        </div>
      )}

      {!loading && slots.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onDelete={handleDeleted} />
          ))}
        </div>
      )}

      {/* Create slot modal */}
      {modalDate && (
        <SlotCreateModal
          date={modalDate}
          onCreated={handleCreated}
          onClose={() => setModalDate(null)}
        />
      )}

    </div>
  )
}
