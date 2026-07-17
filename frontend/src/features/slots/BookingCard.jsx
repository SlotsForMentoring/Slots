import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, Badge, Button, Card } from '@/components/atoms'
import { api } from '@/services/api'
import { cn } from '@/lib/cn'
import { formatDate, formatTime } from '@/lib/dateUtils'
import { useToastStore } from '@/stores/toastStore'

const MotionCard = motion(Card)

function isPast(iso) {
  return new Date(iso) < new Date()
}

/** BookingCard — a trainee's own booking, shown on the My Bookings page (upcoming or past). A cancel/delete flow is only offered for upcoming bookings. */
export function BookingCard({ booking, index = 0, onDelete }) {
  const { slot, agenda, status } = booking
  const past = isPast(slot.end_time)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const addToast = useToastStore((s) => s.addToast)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteBooking(booking.id)
      onDelete(booking.id)
      addToast('Booking cancelled')
    } catch (e) {
      const msg = e?.message || ''
      let errorMsg
      if (msg.includes('403')) errorMsg = 'You can only cancel your own bookings.'
      else errorMsg = 'Could not cancel booking. Please try again.'
      setDeleteError(errorMsg)
      addToast(errorMsg, 'error')
      setConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <MotionCard
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col gap-4 p-5 transition-all duration-200',
        past
          ? 'opacity-60'
          : 'hover:shadow-[var(--shadow-soft-md)] hover:border-ink-300 dark:hover:border-ink-500',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={slot.volunteer_name} src={slot.volunteer_profile_picture} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{formatDate(slot.start_time)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </p>
          </div>
        </div>
        <Badge variant={past ? 'neutral' : 'accent'}>{past ? 'Past' : 'Upcoming'}</Badge>
      </div>

      <div className="rounded-xl bg-muted/50 border border-border p-3.5 text-sm space-y-1.5">
        <p>
          <span className="text-muted-foreground">With </span>
          <span className="font-medium text-foreground">{slot.volunteer_name}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Status </span>
          <span className="font-medium text-foreground capitalize">{status}</span>
        </p>
        {agenda && (
          <p>
            <span className="text-muted-foreground">Agenda </span>
            <span className="text-foreground">{agenda}</span>
          </p>
        )}
      </div>

      {!past && (
        <div className="mt-auto">
          {!confirm ? (
            <Button variant="destructive" size="sm" className="w-full" onClick={() => setConfirm(true)}>
              Cancel booking
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center">Cancel this booking?</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirm(false)} disabled={deleting}>
                  Keep it
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" loading={deleting} onClick={handleDelete}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
          {deleteError && (
            <p className="mt-2 text-xs text-destructive font-medium">{deleteError}</p>
          )}
        </div>
      )}
    </MotionCard>
  )
}
