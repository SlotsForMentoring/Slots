/**
 * spinningFavicon — renders the brand's ring (the circle that dots the "i"
 * in the iMeet wordmark) as a continuously rotating browser-tab favicon.
 *
 * The rotation is a genuine 3D spin around the ring's vertical axis (like a
 * coin turning in place), not a loading-spinner brightness sweep: each
 * frame squashes the ring horizontally by cos(angle) and slightly dims it
 * while the "back" half is facing forward, which is what actually reads as
 * rotation rather than pulsing.
 *
 * Implemented with a single <canvas>, redrawn on an interval and pushed
 * into a dedicated <link rel="icon"> via data URL — this works reliably
 * across browsers, unlike animated .ico which has inconsistent support.
 * Pauses while the tab is hidden to avoid burning CPU in the background.
 */

const SIZE = 32
const RING_RGB = [221, 36, 41] // brand flame red, matches the logo's dot
const OUTER_R = 13
const INNER_R = 6
const DEGREES_PER_TICK = 9 // 360 / 9 = 40 ticks per revolution
const FPS = 20 // 40 ticks @ 20fps = 2s per revolution

export function startSpinningFavicon() {
  if (typeof document === 'undefined') return () => {}

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')

  const link = getOrCreateFaviconLink()
  const cx = SIZE / 2
  const cy = SIZE / 2
  let angle = 0

  function draw() {
    const scaleX = Math.cos(angle)
    const facingBack = scaleX < 0
    const shade = facingBack ? 0.5 : 1
    const [r, g, b] = RING_RGB

    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.save()
    ctx.translate(cx, cy)
    // Never fully collapse to a hairline at the edge-on frame — keeps the
    // ring faintly visible instead of flickering out for one tick.
    ctx.scale(Math.max(Math.abs(scaleX), 0.04), 1)
    ctx.translate(-cx, -cy)

    ctx.beginPath()
    ctx.arc(cx, cy, (OUTER_R + INNER_R) / 2, 0, Math.PI * 2)
    ctx.lineWidth = OUTER_R - INNER_R
    ctx.strokeStyle = `rgb(${Math.round(r * shade)}, ${Math.round(g * shade)}, ${Math.round(b * shade)})`
    ctx.stroke()
    ctx.restore()

    link.href = canvas.toDataURL('image/png')
    angle += (DEGREES_PER_TICK * Math.PI) / 180
  }

  draw()
  let timer = setInterval(draw, 1000 / FPS)

  const handleVisibility = () => {
    if (document.hidden) {
      clearInterval(timer)
    } else {
      timer = setInterval(draw, 1000 / FPS)
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

function getOrCreateFaviconLink() {
  let link = document.getElementById('dynamic-favicon')
  if (!link) {
    // Remove the static favicon links from index.html so this is the only
    // one the browser follows once the animation takes over.
    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove())
    link = document.createElement('link')
    link.id = 'dynamic-favicon'
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)
  }
  return link
}
