import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const icons = {
  success: <Check className="h-4 w-4 text-emerald-500" />,
  error: <X className="h-4 w-4 text-destructive" />,
}

const borders = {
  success: 'border-l-emerald-500',
  error: 'border-l-destructive',
}

export function Toast({ message, variant = 'success', onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3',
        'shadow-[var(--shadow-soft-md)] border-l-[3px]',
        borders[variant],
      )}
    >
      {icons[variant]}
      <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
