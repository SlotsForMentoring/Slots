import { create } from 'zustand'

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, variant = 'success') => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
