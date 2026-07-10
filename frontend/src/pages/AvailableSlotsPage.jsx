import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import Button from '@/components/atoms/Button'
import { formatDate, formatTime } from '@/lib/dateUtils'

function SlotCard({ slot, onBook }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{slot.volunteer_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(slot.start_time)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
        <span className="ml-auto text-xs text-gray-400">1 hour</span>
      </div>
      <Button size="sm" fullWidth onClick={() => onBook(slot)}>
        Book this slot
      </Button>
    </div>
  )
}

function BookingModal({ slot, onConfirm, onCancel, loading, error }) {
  const [agenda, setAgenda] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-base font-semibold text-gray-900">Confirm booking</h2>

        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-1">
          <p><span className="text-gray-500">With</span> <span className="font-medium">{slot.volunteer_name}</span></p>
          <p><span className="text-gray-500">Date</span> <span className="font-medium">{formatDate(slot.start_time)}</span></p>
          <p><span className="text-gray-500">Time</span> <span className="font-medium">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span></p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Agenda <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="What do you want to discuss?"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger-600 font-medium">{error}</p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            fullWidth
            loading={loading}
            onClick={() => onConfirm(agenda)}
          >
            Confirm booking
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmationBanner({ booking, onDismiss }) {
  return (
    <div className="rounded-2xl border border-success-500/30 bg-success-500/5 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-500/10 text-success-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Booking confirmed!</p>
        <p className="text-sm text-gray-500 mt-0.5">
          Session with <span className="font-medium text-gray-700">{booking.slot.volunteer_name}</span> on{' '}
          {formatDate(booking.slot.start_time)} at {formatTime(booking.slot.start_time)}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  )
}

export default function AvailableSlotsPage() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    api.getAvailableSlots()
      .then(setSlots)
      .catch(() => setFetchError('Could not load slots. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const handleConfirmBooking = async (agenda) => {
    setBooking(true)
    setBookingError(null)
    try {
      const result = await api.createBooking({
        slot_id: selected.id,
        ...(agenda ? { agenda } : {}),
      })
      setConfirmed(result)
      setSlots((prev) => prev.filter((s) => s.id !== selected.id))
      setSelected(null)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('409')) setBookingError('This slot was just booked by someone else.')
      else if (msg.includes('422')) setBookingError('Booking window has passed for this slot.')
      else setBookingError('Something went wrong. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Available Slots
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
          Pick a session and book it in one click.
        </p>
      </div>

      {confirmed && (
        <div className="mb-8">
          <ConfirmationBanner booking={confirmed} onDismiss={() => setConfirmed(null)} />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {fetchError && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-500/5 p-5 text-sm text-danger-600 font-medium">
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && slots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No slots available</p>
          <p className="mt-1 text-sm text-gray-500">Check back later — volunteers add new slots regularly.</p>
        </div>
      )}

      {!loading && slots.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onBook={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <BookingModal
          slot={selected}
          onConfirm={handleConfirmBooking}
          onCancel={() => { setSelected(null); setBookingError(null) }}
          loading={booking}
          error={bookingError}
        />
      )}

    </div>
  )
}
