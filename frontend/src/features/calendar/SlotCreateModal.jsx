import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/services/api'
import { Button } from '@/components/atoms'
import { BottomSheet } from '@/components/molecules'
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

/**
 * SlotCreateModal — lets a volunteer mentor create a 1-hour slot on a given
 * day. Renders inside the shared BottomSheet (same modal shell used by
 * SlotFlowSheet) so every dialog in the app behaves the same way on mobile.
 */
export function SlotCreateModal({ date, onCreated, onClose }) {
  const minHour = getMinAllowedHour(date)
  const defaultHour = HOURS.find((_, i) => i >= minHour) ?? null

  const [hour, setHour] = useState(defaultHour ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    <BottomSheet open onClose={onClose} title="New slot">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-flame-600 dark:text-flame-400 uppercase tracking-wider mb-0.5">New Slot</p>
          <h2 className="text-base font-semibold text-foreground">
            {formatDate(date + 'T00:00:00')}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center -mr-1.5 rounded-lg text-muted-foreground hover:bg-muted transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Start time
          </label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          >
            <option value="" disabled>Select a time</option>
            {HOURS.map((h, i) => (
              <option key={h} value={h} disabled={i < minHour}>
                {h} – {String(i + 1).padStart(2, '0')}:00
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">Session is always 1 hour long.</p>
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
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
    </BottomSheet>
  )
}
