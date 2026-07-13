import { motion, useReducedMotion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Avatar } from '@/components/atoms'
import { formatDate, formatTime } from '@/lib/dateUtils'

/**
 * SlotCard — a single bookable slot on the "Available Slots" page.
 *
 * Deliberately doesn't use the shared `Card` atom: it needs `<button>`
 * semantics (it's clickable) plus a continuous "dangle" animation and a
 * deeper resting shadow than Card provides, so its border/shadow classes are
 * defined locally instead.
 */
export function SlotCard({ slot, index = 0, onSelect }) {
  const reduceMotion = useReducedMotion()

  // Stagger the dangle so cards don't all bob/rotate in lockstep.
  const duration = 3.8 + (index % 4) * 0.5
  const delay = (index % 5) * 0.3

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={() => onSelect(slot)}
        animate={reduceMotion ? undefined : { y: [0, -5, 0, 4, 0], rotate: [0, -1.4, 0.7, 1.3, 0] }}
        transition={reduceMotion ? undefined : { duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ y: -6, rotate: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        whileTap={{ scale: 0.98, rotate: 0 }}
        style={{ transformOrigin: 'top center' }}
        className="group flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-[var(--shadow-soft-md)] transition-shadow duration-200 hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-center gap-3">
          <Avatar name={slot.volunteer_name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground">{slot.volunteer_name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(slot.start_time)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          <span className="ml-auto text-xs text-muted-foreground">1 hour</span>
        </div>

        <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-transform duration-150 group-active:scale-[0.97]">
          Reserve spot
        </span>
      </motion.button>
    </motion.div>
  )
}
