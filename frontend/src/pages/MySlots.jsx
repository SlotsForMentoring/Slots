import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { StatusBadge } from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function minDateTime() {
  const d = new Date(Date.now() + 25 * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  return d.toISOString().slice(0, 16)
}

function SlotForm({ onCreated }) {
  const [startTime, setStartTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startTime) return
    setError(null)
    setLoading(true)

    const start = new Date(startTime)
    const end   = new Date(start.getTime() + 60 * 60 * 1000)

    try {
      const slot = await api.createSlot({
        start_time: start.toISOString(),
        end_time:   end.toISOString(),
      })
      onCreated(slot)
      setStartTime('')
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('409')) setError('You already have a slot at this time.')
      else if (msg.includes('422')) setError('Slot must be exactly 1 hour and in the future.')
      else setError('Could not create slot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm mb-10"
    >
      <h2 className="text-base font-semibold text-gray-900 mb-4">Add a new slot</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            min={minDateTime()}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <p className="mt-1.5 text-xs text-gray-400">Session is always 1 hour long.</p>
        </div>

        <div className="sm:self-end">
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Create slot
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-danger-600 font-medium">{error}</p>
      )}
    </form>
  )
}

function SlotCard({ slot }) {
  const isBooked = slot.is_booked

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
    </div>
  )
}

export default function MySlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getMySlots()
      .then(setSlots)
      .catch(() => setError('Could not load your slots. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreated = (newSlot) => {
    setSlots((prev) => [newSlot, ...prev])
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Slots</h1>
        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
          Manage your availability and see who booked your sessions.
        </p>
      </div>

      <SlotForm onCreated={handleCreated} />

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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No slots yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first slot to start accepting bookings.</p>
        </div>
      )}

      {!loading && slots.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      )}

    </div>
  )
}
