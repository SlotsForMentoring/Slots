import { create } from "zustand"

export const GREETED_KEY = "imeet_greeted"

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => {
    sessionStorage.removeItem(GREETED_KEY)
    set({ user: null })
  },
}))
