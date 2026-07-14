import confetti from 'canvas-confetti'

// Brand palette (flame red, dark ink, emerald — matches the hero shapes on
// the landing page) so the burst reads as "this app's confetti", not a
// generic rainbow one.
const COLORS = ['#E24B4A', '#1A1A1A', '#10B981', '#FFFFFF']

/**
 * celebrate — a short confetti burst for the moments that deserve one:
 * a trainee successfully books a session, or a mentor successfully opens
 * up a new slot. Two bursts from the lower corners, angled inward and
 * upward, so it doesn't just fire straight down over whatever dialog is
 * still open on screen. No-ops under prefers-reduced-motion.
 */
export function celebrate() {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const shared = { colors: COLORS, ticks: 200, gravity: 1, scalar: 0.9, zIndex: 9999 }

  confetti({ ...shared, particleCount: 60, angle: 60, spread: 65, origin: { x: 0.1, y: 0.9 } })
  confetti({ ...shared, particleCount: 60, angle: 120, spread: 65, origin: { x: 0.9, y: 0.9 } })
}
