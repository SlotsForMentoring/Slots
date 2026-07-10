import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * CalendarGrid — reusable month-view calendar.
 *
 * Props:
 *   markedDates  { [dateStr]: { type: 'available' | 'booked' | 'mixed' } }
 *   selectedDate  string | null  — highlighted day (YYYY-MM-DD)
 *   onDayClick   (dateStr) => void
 */
export default function CalendarGrid({ markedDates = {}, selectedDate, onDayClick }) {
  const today = startOfDay(new Date())
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay   = new Date(year, month, 1)
  const lastDay    = new Date(year, month + 1, 0)
  const startPad   = firstDay.getDay()           // 0 = Sun
  const endPad     = 6 - lastDay.getDay()

  const cells = []

  // Trailing days from previous month
  const prevLast = new Date(year, month, 0)
  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevLast.getDate() - i), current: false })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }

  // Leading days from next month
  for (let d = 1; d <= endPad; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false })
  }

  const todayStr = toDateString(today)

  return (
    <div className="w-full select-none">

      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <p className="text-base font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </p>

        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((day) => (
          <p key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </p>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map(({ date, current }, i) => {
          const dateStr    = toDateString(date)
          const isToday    = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isPast     = date < today
          const mark       = markedDates[dateStr]
          const clickable  = current && !isPast

          return (
            <button
              key={i}
              disabled={!clickable}
              onClick={() => clickable && onDayClick?.(dateStr)}
              className={[
                'relative flex flex-col items-center justify-start pt-1 pb-2 mx-0.5 min-h-[52px] rounded-xl transition-all duration-150',
                !current                  ? 'opacity-20 cursor-default'              : '',
                isPast && current         ? 'opacity-35 cursor-default'              : '',
                isSelected                ? 'bg-brand-500'                           : '',
                clickable && !isSelected  ? 'hover:bg-gray-100 active:bg-gray-200 cursor-pointer' : '',
              ].join(' ')}
            >
              {/* Day number */}
              <span className={[
                'text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium',
                isSelected              ? 'text-white'                         : '',
                isToday && !isSelected  ? 'bg-brand-500 text-white'            : '',
                !isToday && !isSelected ? 'text-gray-900'                      : '',
              ].join(' ')}>
                {date.getDate()}
              </span>

              {/* Dot indicators */}
              {mark && current && (
                <div className="flex gap-0.5 mt-0.5">
                  {(mark.type === 'available' || mark.type === 'mixed') && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`} />
                  )}
                  {(mark.type === 'booked' || mark.type === 'mixed') && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-orange-400'}`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 mt-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-xs text-gray-500">Booked</span>
        </div>
      </div>

    </div>
  )
}
