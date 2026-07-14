import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, Badge, Button, Card } from '@/components/atoms'
import { api } from '@/services/api'
import { formatDate, formatTime } from '@/lib/dateUtils'

const MotionCard = motion(Card)

/**
 * MySlotCard — a volunteer mentor's own slot. Offers a delete flow when
 * it isn't booked yet, or a cancel-booking flow (which frees the slot
 * back up and notifies the trainee via Google Calendar) when it is.
 */
export function MySlotCard({ slot, index = 0, onDelete, onCancelBooking }) {
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

  const handleCancelBooking = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteBooking(slot.booking.id)
      onCancelBooking(slot.id)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('403')) setDeleteError('You can only cancel bookings on your own slots.')
      else setDeleteError('Could not cancel booking. Please try again.')
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
      className="flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{formatDate(slot.start_time)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </p>
        </div>
        <Badge variant={isBooked ? 'warning' : 'success'} dot>
          {isBooked ? 'Booked' : 'Available'}
        </Badge>
      </div>

      {isBooked && slot.booking && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-3.5">
          <Avatar name={slot.booking.trainee_name} size="sm" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-foreground truncate">{slot.booking.trainee_name}</p>
            <p className="text-muted-foreground text-xs truncate">{slot.booking.trainee_email}</p>
            {slot.booking.agenda && (
              <p className="text-foreground text-xs mt-1 line-clamp-2">{slot.booking.agenda}</p>
            )}
          </div>
        </div>
      )}

      {isBooked && slot.booking && (
        <div className="mt-auto">
          {!confirm ? (
            <Button variant="destructive" size="sm" className="w-full" onClick={() => setConfirm(true)}>
              Cancel booking
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center">
                Cancel {slot.booking.trainee_name}'s booking?
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirm(false)} disabled={deleting}>
                  Keep it
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" loading={deleting} onClick={handleCancelBooking}>
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

      {!isBooked && (
        <div className="mt-auto">
          {!confirm ? (
            <Button variant="destructive" size="sm" className="w-full" onClick={() => setConfirm(true)}>
              Delete slot
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center">Are you sure?</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirm(false)} disabled={deleting}>
                  Cancel
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
