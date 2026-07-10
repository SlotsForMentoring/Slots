import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import Button from '@/components/atoms/Button'
import { formatDate } from '@/lib/dateUtils'

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0') + ':00'
)

function getMinAllowedHour(dateStr) {
 
  const minTime = new Date(Date.now() + 25 * 60 * 60 * 1000)
  const [y, m, d] = dateStr.split('-').map(Number)
  const selectedDay = new Date(y, m - 1, d)
  const minDay = new Date(minTime.getFullYear(), minTime.getMonth(), minTime.getDate())

  if (selectedDay > minDay) return 0
  if (selectedDay < minDay) return 24
  return minTime.getHours() + 1
}

export default function SlotCreateModal({ date, onCreated, onClose }) {
  const minHour = getMinAllowedHour(date)
  const defaultHour = HOURS.find((_, i) => i >= minHour) ?? null

  const [hour, setHour] = useState(defaultHour ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hour) return
    setError(null)
    setLoading(true)

    const [h] = hour.split(':').map(Number)
    const [y, m, d] = date.split('-').map(Number)
    const start = new Date(y, m - 1, d, h, 0, 0)
    const end   = new Date(start.getTime() + 60 * 60 * 1000)

    try {
      const slot = await api.createSlot({
        start_time: start.toISOString(),
        end_time:   end.toISOString(),
      })
      onCreated(slot)
      onClose()
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('409')) setError('You already have a slot at this time.')
      else if (msg.includes('422')) setError('This time is too soon. Slots need 25 h notice.')
      else setError('Could not create slot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-0.5">New Slot</p>
            <h2 className="text-base font-semibold text-gray-900">
              {formatDate(date + 'T00:00:00')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start time
            </label>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="" disabled>Select a time</option>
              {HOURS.map((h, i) => (
                <option key={h} value={h} disabled={i < minHour}>
                  {h} – {String(i + 1).padStart(2, '0')}:00
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400">Session is always 1 hour long.</p>
          </div>

          {error && (
            <p className="text-sm text-danger-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={loading} disabled={!hour}>
              Create slot
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
