import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { formatDate, formatTime } from '@/lib/dateUtils'

function isPast(iso) {
  return new Date(iso) < new Date()
}

function BookingCard({ booking }) {
  const { slot, agenda, status } = booking
  const past = isPast(slot.end_time)

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-4 transition-all duration-200 ${past ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:shadow-md hover:border-brand-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(slot.start_time)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${past ? 'bg-gray-50 text-gray-500 ring-gray-500/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
          {past ? 'Past' : 'Upcoming'}
        </span>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-sm space-y-1">
        <p>
          <span className="text-gray-500">With </span>
          <span className="font-medium text-gray-900">{slot.volunteer_name}</span>
        </p>
        <p>
          <span className="text-gray-500">Status </span>
          <span className="font-medium text-gray-700 capitalize">{status}</span>
        </p>
        {agenda && (
          <p>
            <span className="text-gray-500">Agenda </span>
            <span className="text-gray-700">{agenda}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getMyBookings()
      .then(setBookings)
      .catch(() => setError('Could not load your bookings. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = bookings.filter((b) => !isPast(b.slot.end_time))
  const past     = bookings.filter((b) =>  isPast(b.slot.end_time))

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10 sm:py-14">

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Bookings</h1>
        <p className="mt-1.5 text-sm sm:text-base text-gray-500">
          Your scheduled 1-on-1 sessions with volunteer mentors.
        </p>
      </div>

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

      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900">No bookings yet</p>
          <p className="mt-1 text-sm text-gray-500">Browse available slots to book your first session.</p>
        </div>
      )}

      {!loading && upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Upcoming</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </div>
      )}

      {!loading && past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Past</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </div>
      )}

    </div>
  )
}
