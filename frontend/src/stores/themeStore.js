import { create } from 'zustand'

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('imeet_theme', dark ? 'dark' : 'light')
}

const stored = localStorage.getItem('imeet_theme')
const initialDark = stored
  ? stored === 'dark'
  : window.matchMedia('(prefers-color-scheme: dark)').matches

applyTheme(initialDark)

export const useThemeStore = create((set) => ({
  dark: initialDark,
  toggle: () =>
    set((s) => {
      const next = !s.dark
      applyTheme(next)
      return { dark: next }
    }),
}))
