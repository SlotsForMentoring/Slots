import { useState } from 'react'
import { cn } from '@/lib/cn'

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
 * CalendarGrid — a month-view calendar shared by every slots page (mentor's
 * own slots, trainee's browse view, admin's oversight view).
 *
 * `markedDates` is a `{ 'YYYY-MM-DD': { type: 'available' | 'booked' | 'mixed' } }`
 * map used to render the small dot(s) under a day. `onDayClick` fires for any
 * non-past day in the current month; callers decide what a click means
 * (open a create-slot modal, filter a list, etc).
 */
export function CalendarGrid({ markedDates = {}, selectedDate, onDayClick }) {
  const today = startOfDay(new Date())
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay   = new Date(year, month, 1)
  const lastDay    = new Date(year, month + 1, 0)
  const startPad   = firstDay.getDay()
  const endPad     = 6 - lastDay.getDay()

  const cells = []

  const prevLast = new Date(year, month, 0)
  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevLast.getDate() - i), current: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }

  for (let d = 1; d <= endPad; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false })
  }

  const todayStr = toDateString(today)

  return (
    <div
      className={cn(
        'relative w-full select-none overflow-hidden rounded-[28px] p-5 sm:p-6',
        'border border-white/60 dark:border-white/10',
        'bg-white/55 dark:bg-white/[0.06] backdrop-blur-2xl',
        'shadow-[0_8px_32px_rgba(20,20,20,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
      )}
    >
      {/* Soft glass highlight across the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 dark:from-white/10 to-transparent"
      />

      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted active:bg-ink-200 dark:active:bg-ink-700 transition"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <p className="text-base font-semibold text-foreground">
          {MONTHS[month]} {year}
        </p>

        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted active:bg-ink-200 dark:active:bg-ink-700 transition"
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
          <p key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
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
              className={cn(
                'relative flex flex-col items-center justify-start pt-1 pb-2 mx-0.5 min-h-[52px] rounded-xl transition-all duration-150',
                !current && 'opacity-20 cursor-default',
                isPast && current && 'opacity-35 cursor-default',
                isSelected && 'bg-flame-500',
                clickable && !isSelected && 'hover:bg-muted active:bg-ink-200 dark:active:bg-ink-700 cursor-pointer',
              )}
            >
              {/* Day number */}
              <span className={cn(
                'text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium',
                isSelected && 'text-white',
                isToday && !isSelected && 'bg-flame-500 text-white',
                !isToday && !isSelected && 'text-foreground',
              )}>
                {date.getDate()}
              </span>

              {/* Dot indicators */}
              {mark && current && (
                <div className="flex gap-0.5 mt-0.5">
                  {(mark.type === 'available' || mark.type === 'mixed') && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-flame-500')} />
                  )}
                  {(mark.type === 'booked' || mark.type === 'mixed') && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/70' : 'bg-amber-400')} />
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
          <span className="w-2 h-2 rounded-full bg-flame-500" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-muted-foreground">Booked</span>
        </div>
      </div>

    </div>
  )
}
