import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Check, Clock, Share2 } from 'lucide-react'
import { useAuthStore, GREETED_KEY } from '@/stores/authStore'
import { Button, Logo } from '@/components/atoms'

function roleHome(user) {
  if (user.role === 'admin') return '/admin/users'
  if (user.role === 'volunteer') return '/my-slots'
  return '/slots'
}

const STEPS = [
  { step: '01', title: 'Sign in with Google', description: 'One click — no passwords, no forms.' },
  { step: '02', title: 'Browse open slots',   description: 'Filter by date and find a mentor ready to help.' },
  { step: '03', title: 'Book your session',   description: 'Confirm the slot and show up ready to grow.' },
]

const WELCOME_COPY = {
  trainee: {
    subtitle: "You're all set to find a mentor. Browse open slots and book a session that fits your schedule.",
    cta: 'Browse available slots',
    to: '/slots',
  },
  volunteer: {
    subtitle: 'Thank you for sharing your experience with our trainees — your time makes a real difference. Manage your availability below.',
    cta: 'Manage your slots',
    to: '/my-slots',
  },
  admin: {
    subtitle: 'Manage roles and keep the community running smoothly.',
    cta: 'Go to admin dashboard',
    to: '/admin/users',
  },
}

function WelcomeHero({ user, onNavigate }) {
  const firstName = user.name?.split(' ')[0] ?? user.name
  const copy = WELCOME_COPY[user.role] ?? WELCOME_COPY.trainee

  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl">
        <div className="relative left-1/2 w-[36rem] sm:w-[72rem] -translate-x-1/2 rotate-[30deg] aspect-[1155/678] bg-gradient-to-tr from-flame-400 to-flame-200 opacity-20" />
      </div>

      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-6 sm:py-28 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-flame-200 dark:border-flame-800 bg-flame-50 dark:bg-flame-500/10 px-3 py-1 text-xs sm:text-sm text-flame-700 dark:text-flame-300">
          <span className="h-1.5 w-1.5 rounded-full bg-flame-500 shrink-0" />
          {user.role === 'volunteer' ? 'Volunteer mentor' : user.role === 'admin' ? 'Admin' : 'Trainee'}
        </div>

        <h1 className="[font-family:var(--font-family-display)] text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Hello, {firstName}.
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {copy.subtitle}
        </p>

        <div className="mt-8 sm:mt-10">
          <Button size="lg" onClick={() => onNavigate(copy.to)}>
            {copy.cta} →
          </Button>
        </div>
      </div>
    </section>
  )
}

// Static, non-interactive mockups of real screens from the app, cycled
// below as a little product-preview carousel.
function BookingConfirmedMockup() {
  return (
    <>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink-200 dark:bg-ink-600" />

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
      </div>

      <p className="text-lg font-semibold text-foreground">Booking confirmed</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your session with Sarah Kim is set. An invitation has been sent to your email.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Add to calendar
        </div>
        <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share event
        </div>
        <div className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          Done
        </div>
      </div>
    </>
  )
}

function SlotCardMockup() {
  return (
    <div className="pt-2 text-left">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-flame-500 text-sm font-semibold text-white">
          SK
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">Sarah Kim</p>
          <p className="text-xs text-muted-foreground">Thursday, Jul 16</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        2:00 PM – 3:00 PM
        <span className="ml-auto text-xs text-muted-foreground">1 hour</span>
      </div>

      <div className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        Reserve spot
      </div>
    </div>
  )
}

function UpcomingBookingMockup() {
  return (
    <div className="pt-2 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flame-500 text-xs font-semibold text-white">
            SK
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Thursday, Jul 16</p>
            <p className="text-xs text-muted-foreground">2:00 PM – 3:00 PM</p>
          </div>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-flame-600 dark:text-flame-400">
          Upcoming
        </span>
      </div>

      <div className="mt-4 space-y-1.5 rounded-xl border border-border bg-muted/50 p-3.5 text-sm">
        <p>
          <span className="text-muted-foreground">With </span>
          <span className="font-medium text-foreground">Sarah Kim</span>
        </p>
        <p>
          <span className="text-muted-foreground">Status </span>
          <span className="font-medium text-foreground">Confirmed</span>
        </p>
        <p>
          <span className="text-muted-foreground">Agenda </span>
          <span className="text-foreground">Resume review & mock interview</span>
        </p>
      </div>
    </div>
  )
}

// Fades + slides content in every time it scrolls into view (replays on
// scroll-back), and back out again as it leaves.
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const SCREENS = [BookingConfirmedMockup, SlotCardMockup, UpcomingBookingMockup]

function BookingScreenshot() {
  const [index, setIndex] = useState(0)
  // Peek amount for the side cards shrinks on narrow phones so they don't
  // clip against the screen edge (they're only fully visible ~375px+).
  const [peek, setPeek] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 380 ? 30 : 54))

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 3500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onResize = () => setPeek(window.innerWidth < 380 ? 30 : 54)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const total = SCREENS.length

  return (
    <div className="isolate relative mx-auto my-10 h-[420px] w-full max-w-[420px] sm:my-12">
      {/* Two soft color shapes drifting behind the screenshot — plain CSS
          keyframe animation (see index.css) so it always runs, and backs
          off automatically for prefers-reduced-motion. */}
      <div
        aria-hidden="true"
        className="animate-blob-1 absolute left-1/2 top-1/2 -z-10 h-80 w-80 rounded-full bg-flame-400 opacity-70 blur-2xl dark:opacity-40"
      />
      <div
        aria-hidden="true"
        className="animate-blob-2 absolute left-1/2 top-1/2 -z-10 h-72 w-72 rounded-full bg-ink-400 opacity-60 blur-2xl dark:opacity-35 dark:bg-ink-200"
      />

      {/* Semi-transparent product screenshots — the current one is centered
          and fully visible, with the previous/next ones peeking out from
          behind its left and right edges (coverflow style). */}
      {SCREENS.map((Screen, i) => {
        const diff = (i - index + total) % total
        const isCurrent = diff === 0
        const isNext = diff === 1
        const target = isCurrent
          ? { x: 0, scale: 1, opacity: 1, zIndex: 3 }
          : isNext
            ? { x: peek, scale: 0.9, opacity: 0.55, zIndex: 2 }
            : { x: -peek, scale: 0.9, opacity: 0.55, zIndex: 1 }

        return (
          <motion.div
            key={i}
            animate={target}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 m-auto h-[420px] w-full max-w-[300px] overflow-hidden rounded-[32px] border border-border bg-card/70 px-6 pb-6 pt-3 text-center shadow-[var(--shadow-soft-lg)] backdrop-blur-sm"
          >
            <Screen />
          </motion.div>
        )
      })}

      {/* Carousel dots */}
      <div className="absolute -bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {SCREENS.map((_, i) => (
          <span
            key={i}
            className={
              i === index
                ? 'h-1.5 w-4 rounded-full bg-flame-500 transition-all duration-300'
                : 'h-1.5 w-1.5 rounded-full bg-ink-300 transition-all duration-300 dark:bg-ink-600'
            }
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // Only the very first landing on "/" after a fresh sign-in shows the
  // greeting — checked once per mount, before paint, via sessionStorage.
  // Any later visit to "/" while already signed in skips straight to
  // the user's own page instead of re-showing it.
  const [showGreeting] = useState(() => {
    if (!user) return false
    const alreadyGreeted = sessionStorage.getItem(GREETED_KEY) === 'true'
    if (!alreadyGreeted) sessionStorage.setItem(GREETED_KEY, 'true')
    return !alreadyGreeted
  })

  const getStarted = () => {
    if (!user) return navigate('/login')
    navigate(roleHome(user))
  }

  const handleContact = () => {
    window.location.href = 'mailto:partners@imeet.app?subject=iMeet%20API%20partnership'
  }

  // First landing on "/" right after sign-in: show the personal greeting.
  // Any later visit (e.g. clicking the logo) always shows this same main
  // page — logged-in users just get a "Get started" that jumps into the app.
  if (user && showGreeting) {
    return (
      <div className="[font-family:var(--font-family-sans)] bg-background min-h-screen">
        <WelcomeHero user={user} onNavigate={navigate} />
      </div>
    )
  }

  return (
    <div className="font-sans bg-background">

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl">
          <div className="relative left-1/2 w-[36rem] sm:w-[72rem] -translate-x-1/2 rotate-[30deg] aspect-[1155/678] bg-gradient-to-tr from-flame-400 to-flame-200 opacity-20" />
        </div>

        {/* ── Left hand — flush with the screen edge, lower, reaching up-right ── */}
        <img
          src="/hand-left.png"
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 hidden w-[26vw] max-w-[420px] min-w-[260px] rotate-3 select-none lg:block"
          aria-hidden="true"
          draggable={false}
        />

        {/* ── Right hand — flush with the screen edge, higher, reaching down-left ── */}
        <img
          src="/hand-right.png"
          alt=""
          className="pointer-events-none absolute right-0 top-8 hidden w-[26vw] max-w-[420px] min-w-[260px] -rotate-3 select-none lg:block"
          aria-hidden="true"
          draggable={false}
        />

        <div className="relative mx-auto max-w-2xl px-5 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-24 lg:pt-6 lg:pb-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="[font-family:var(--font-family-display)] text-3xl sm:text-5xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight"
            >
              Schedule smarter.{' '}
              <span className="bg-gradient-to-r from-flame-500 to-flame-700 bg-clip-text text-transparent">
                Meet easier.
              </span>
            </motion.h1>

            <BookingScreenshot />

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button size="lg" fullWidth={false} className="w-full sm:w-auto" onClick={getStarted}>
                Get started — it's free
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works ↓
              </Button>
            </div>

            {/* Mobile-only: single hand below the copy */}
            <div className="mt-10 flex justify-center lg:hidden">
              <img
                src="/hand-left.png"
                alt="Illustration of a reaching hand, representing connection between mentors and trainees"
                className="w-full max-w-[260px] select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <Reveal>
            <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How it works
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-3 text-center text-sm sm:text-base text-muted-foreground">
              Three steps to your first session.
            </p>
          </Reveal>

          <div className="mt-10 sm:mt-12 grid gap-14 grid-cols-1 sm:grid-cols-3 sm:gap-14 lg:gap-20">
            {STEPS.map(({ step, title, description }, i) => (
              <Reveal key={step} delay={Math.min(i * 0.1, 0.3)} className="flex justify-center">
                <div className="relative h-40 w-40 sm:h-48 sm:w-48">
                  <img
                    src={`/number-${i + 1}.png`}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 z-0 h-40 w-auto -translate-y-1/2 select-none opacity-90 dark:invert dark:opacity-70 sm:h-48"
                    style={{ right: 'calc(100% - 14px)' }}
                    draggable={false}
                  />

                  <div className="group relative z-10 flex h-40 w-40 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-flame-400 bg-card p-5 text-center shadow-[var(--shadow-soft-md)] transition-all duration-300 hover:border-flame-600 hover:shadow-[var(--shadow-soft-lg)] sm:h-48 sm:w-48">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-[-10%] top-full h-[130%] transition-[top] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:top-0"
                    >
                      <svg
                        className="wave-scroll absolute inset-x-0 -top-3 h-6 w-[200%] text-flame-500"
                        viewBox="0 0 800 40"
                        preserveAspectRatio="none"
                      >
                        <path
                          fill="currentColor"
                          d="M0 20 C 50 4 150 36 200 20 C 250 4 350 36 400 20 C 450 4 550 36 600 20 C 650 4 750 36 800 20 L800 40 L0 40 Z"
                        />
                      </svg>
                      <div className="absolute inset-x-0 bottom-0 top-3 bg-flame-500" />
                    </div>
                    <h3 className="relative z-10 text-xs sm:text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-white">
                      {title}
                    </h3>
                    <p className="relative z-10 mt-1 text-[11px] sm:text-xs text-muted-foreground leading-snug transition-colors duration-300 group-hover:text-white/90">
                      {description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-flame-600 dark:text-flame-400">
                For developers
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Power Your Platform with iMeet
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                Looking to offer scheduling in your own product? Our API makes it easy to integrate iMeet into your platform.
              </p>
              <Button size="lg" className="mt-7" onClick={handleContact}>
                Contact us
              </Button>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft-lg)]">
                <video
                  src="/api-integration.mp4"
                  poster="/api-integration-poster.jpg"
                  className="aspect-square w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="bg-flame-600">
        <Reveal className="mx-auto max-w-5xl px-5 sm:px-6 pt-14 pb-8 sm:pt-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

            <div>
              <div className="inline-flex rounded-xl bg-white/95 px-4 py-2">
                <Logo size="md" />
              </div>
              <p className="mt-4 text-sm text-flame-100 leading-relaxed max-w-xs">
                A pair-scheduling platform connecting trainees with volunteer mentors — one click to book a real 1-on-1 session.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-flame-200">Product</p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button type="button" onClick={getStarted} className="text-white/90 hover:text-white transition-colors">
                    Browse available slots
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/login')} className="text-white/90 hover:text-white transition-colors">
                    Sign in with Google
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-flame-200">Ready to find your mentor?</p>
              <p className="mt-4 text-sm text-flame-100 leading-relaxed">
                Join trainees already learning with iMeet — it takes one click to get started.
              </p>
              <Button
                variant="secondary"
                size="md"
                className="mt-4 w-full sm:w-auto border-white/40 text-white hover:bg-white hover:text-flame-600"
                onClick={getStarted}
              >
                Sign in with Google
              </Button>
            </div>

          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 sm:flex-row">
            <p className="text-xs text-flame-100">
              © {new Date().getFullYear()} iMeet. Built for learners, by volunteers.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-xs text-flame-100 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-flame-100 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </Reveal>
      </footer>

    </div>
  )
}
