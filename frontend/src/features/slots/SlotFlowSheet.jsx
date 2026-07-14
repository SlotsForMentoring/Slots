import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, Clock, ExternalLink, Share2, Video } from 'lucide-react'
import { Avatar, Button, TextAreaField } from '@/components/atoms'
import { BottomSheet } from '@/components/molecules'
import { formatDate, formatTime } from '@/lib/dateUtils'
import { googleCalendarUrl, shareBooking } from '@/lib/calendar'
import { celebrate } from '@/lib/confetti'
import { api } from '@/services/api'

const stepVariants = {
  enter: { opacity: 0, x: 16 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
}

export function SlotFlowSheet({ slot, onClose, onBooked }) {
  const [step, setStep] = useState('detail')
  const [agenda, setAgenda] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [booking, setBooking] = useState(null)
  const [shareStatus, setShareStatus] = useState(null)

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('detail')
      setAgenda('')
      setError(null)
      setBooking(null)
      setShareStatus(null)
    }, 250)
  }

  const handleConfirm = async () => {
    if (!slot) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await api.createBooking({
        slot_id: slot.id,
        ...(agenda ? { agenda } : {}),
      })
      setBooking(result)
      setStep('success')
      onBooked(slot.id)
      celebrate()
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('409')) setError('This slot was just booked by someone else.')
      else if (msg.includes('422')) setError('The booking window for this slot has passed.')
      else setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    if (!slot) return
    const result = await shareBooking(slot)
    setShareStatus(result === 'copied' ? 'Link copied' : result === 'shared' ? 'Shared' : null)
  }

  if (!slot) return null

  return (
    <BottomSheet open={!!slot} onClose={handleClose} title="Book a session">
      <AnimatePresence mode="wait">
        {step === 'detail' && (
          <motion.div key="detail" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Avatar name={slot.volunteer_name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-foreground">{slot.volunteer_name}</p>
                <p className="text-sm text-muted-foreground">Volunteer mentor</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                {formatDate(slot.start_time)}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                {formatTime(slot.start_time)} – {formatTime(slot.end_time)} (1 hour)
              </div>
            </div>

            <Button size="lg" onClick={() => setStep('booking')} className="w-full">
              Reserve spot
            </Button>
          </motion.div>
        )}

        {step === 'booking' && (
          <motion.div key="booking" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-5">
            <div>
              <p className="text-lg font-semibold text-foreground">Confirm booking</p>
              <p className="text-sm text-muted-foreground mt-0.5">Double-check the details before you reserve.</p>
            </div>

            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">With</span>
                <span className="font-medium text-foreground">{slot.volunteer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{formatDate(slot.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
              </div>
              <div className="flex justify-between border-t border-border mt-1 pt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">Free</span>
              </div>
            </div>

            <TextAreaField
              label="Message (optional)"
              placeholder="What do you want to discuss?"
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('detail')} disabled={submitting}>
                Back
              </Button>
              <Button size="lg" className="flex-1" loading={submitting} onClick={handleConfirm}>
                Confirm booking
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && booking && (
          <motion.div key="success" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col items-center gap-5 py-2 text-center">
            <SuccessBurst />

            <div>
              <p className="text-lg font-semibold text-foreground">Booking confirmed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your session with {slot.volunteer_name} is set. An invitation has been sent to your email.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <SecondaryAction href={googleCalendarUrl(slot, agenda)} icon={<Calendar className="h-4 w-4" aria-hidden="true" />}>
                Add to calendar
              </SecondaryAction>

              {booking.meet_link && (
                <SecondaryAction href={booking.meet_link} icon={<Video className="h-4 w-4" aria-hidden="true" />}>
                  Open Google Meet
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </SecondaryAction>
              )}

              <SecondaryAction onClick={handleShare} icon={<Share2 className="h-4 w-4" aria-hidden="true" />}>
                {shareStatus ?? 'Share event'}
              </SecondaryAction>

              <Button size="lg" className="w-full mt-1" onClick={handleClose}>
                Done
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}

const SECONDARY_ACTION_CLASSES =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors'

/** One of the pill-shaped links/buttons on the "booking confirmed" screen (add to calendar, open Meet, share). */
function SecondaryAction({ href, onClick, icon, children }) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={SECONDARY_ACTION_CLASSES}>
        {icon}
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={SECONDARY_ACTION_CLASSES}>
      {icon}
      {children}
    </button>
  )
}

function SuccessBurst() {
  const dots = Array.from({ length: 8 })
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-flame-500"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(angle) * 44, y: Math.sin(angle) * 44, scale: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          />
        )
      })}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white"
      >
        <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
      </motion.div>
    </div>
  )
}
