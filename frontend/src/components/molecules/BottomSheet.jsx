import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

const DRAG_CLOSE_OFFSET = 120
const DRAG_CLOSE_VELOCITY = 500

/**
 * BottomSheet — a portal-rendered modal that slides up from the bottom on
 * mobile and centers itself on larger screens. Handles body-scroll locking,
 * Escape-to-close, and drag-down-to-dismiss. Used by SlotFlowSheet and
 * SlotCreateModal so every modal in the app shares one implementation.
 */
export function BottomSheet({ open, onClose, children, title, className }) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const handleDragEnd = (_, info) => {
    if (info.offset.y > DRAG_CLOSE_OFFSET || info.velocity.y > DRAG_CLOSE_VELOCITY) {
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl',
              'shadow-[var(--shadow-soft-lg)] max-h-[88vh] flex flex-col touch-none',
              className,
            )}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true">
              <div className="h-1.5 w-10 rounded-full bg-border" />
            </div>
            <div className="overflow-y-auto touch-pan-y px-6 pb-6 pt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
