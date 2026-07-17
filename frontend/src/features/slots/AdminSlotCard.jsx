import { motion } from 'framer-motion'
import { Avatar, Badge, Card } from '@/components/atoms'
import { formatDate, formatTime } from '@/lib/dateUtils'

const MotionCard = motion(Card)

/** AdminSlotCard — read-only summary of a mentor's slot, for the admin oversight page. No mutating actions. */
export function AdminSlotCard({ slot, index = 0 }) {
  const isBooked = slot.is_booked

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

      <div className="flex items-center gap-3">
        <Avatar name={slot.volunteer_name} src={slot.volunteer_profile_picture} size="sm" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-foreground truncate">{slot.volunteer_name}</p>
          <p className="text-muted-foreground text-xs truncate">Mentor</p>
        </div>
      </div>

      {isBooked && slot.booking && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-3.5">
          <Avatar name={slot.booking.trainee_name} src={slot.booking.trainee_profile_picture} size="sm" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-foreground truncate">{slot.booking.trainee_name}</p>
            <p className="text-muted-foreground text-xs truncate">{slot.booking.trainee_email}</p>
            {slot.booking.agenda && (
              <p className="text-foreground text-xs mt-1 line-clamp-2">{slot.booking.agenda}</p>
            )}
          </div>
        </div>
      )}
    </MotionCard>
  )
}
