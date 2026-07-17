import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { Toast } from '@/components/atoms/Toast'
import { useToastStore } from '@/stores/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col-reverse gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            variant={t.variant}
            onDismiss={() => dismissToast(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
