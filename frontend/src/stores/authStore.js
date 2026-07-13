import { create } from "zustand"

// sessionStorage key used to show the post-login welcome greeting only once
// per session. Exported so LandingPage (the only other place that touches
// it) reads the same constant instead of redefining the string itself.
export const GREETED_KEY = "imeet_greeted"

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => {
    sessionStorage.removeItem(GREETED_KEY)
    set({ user: null })
  },
}))
