/**
 * dismissSplash — fades out and removes the static #app-splash element
 * (see index.html) once the React app has mounted. Enforces a small
 * minimum visible time so the splash doesn't just flash for a single
 * frame on a fast connection — it should read as an intentional branded
 * loading screen, not a flicker.
 */
const mountedAt = Date.now()
const MIN_VISIBLE_MS = 500

export function dismissSplash() {
  const el = document.getElementById('app-splash')
  if (!el) return

  const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAt))
  setTimeout(() => {
    el.classList.add('app-splash-hide')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
    // Fallback in case transitionend never fires (e.g. reduced-motion).
    setTimeout(() => el.remove(), 600)
  }, wait)
}
