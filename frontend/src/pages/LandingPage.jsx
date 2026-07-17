import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Check, Clock, Share2 } from 'lucide-react'
import { useAuthStore, GREETED_KEY } from '@/stores/authStore'
import { Avatar, Button, Heading, Logo } from '@/components/atoms'
import { cn } from '@/lib/cn'

const DEMO_AVATAR_URL = 'https://i.pravatar.cc/150?img=47'

const MotionHeading = motion(Heading)

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

const SPLASH_DELAY = 3000

function WelcomeHero({ user, onNavigate }) {
  const firstName = user.name?.split(' ')[0] ?? user.name
  const copy = WELCOME_COPY[user.role] ?? WELCOME_COPY.trainee
  const dest = roleHome(user)

  useEffect(() => {
    const id = setTimeout(() => onNavigate(dest, { replace: true }), SPLASH_DELAY)
    return () => clearTimeout(id)
  }, [])

  const roleLabel =
    user.role === 'volunteer' ? 'Volunteer mentor'
    : user.role === 'admin' ? 'Admin'
    : 'Trainee'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-flame-400 opacity-20 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/4 h-64 w-64 rounded-full bg-flame-600 opacity-15 blur-3xl" />
      </div>

      <motion.div
        className="relative flex flex-col items-center text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-flame-500/30 shadow-lg mb-5"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-flame-500 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-flame-500/30 shadow-lg mb-5">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-flame-200 dark:border-flame-800 bg-flame-50 dark:bg-flame-500/10 px-3 py-1 text-xs font-medium text-flame-700 dark:text-flame-300">
          <span className="h-1.5 w-1.5 rounded-full bg-flame-500" />
          {roleLabel}
        </div>

        <Heading level="h1">Hello, {firstName}.</Heading>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-sm leading-relaxed">
          {copy.subtitle}
        </p>

        <button
          onClick={() => onNavigate(dest, { replace: true })}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {copy.cta} →
        </button>

        <div className="mt-6 w-48 h-0.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-flame-500 rounded-full"
            style={{ animation: `progress-fill ${SPLASH_DELAY}ms linear forwards` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Taking you there in 3 seconds…</p>
      </motion.div>
    </div>
  )
}

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
        <Avatar name="Sarah Kim" src={DEMO_AVATAR_URL} size="md" />
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
          <Avatar name="Sarah Kim" src={DEMO_AVATAR_URL} size="sm" />
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

function BookingScreenshot({ className }) {
  const [index, setIndex] = useState(0)
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
    <div className={cn('isolate relative mx-auto my-10 h-[360px] w-full max-w-[360px] sm:my-12 sm:h-[420px] sm:max-w-[420px]', className)}>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0, ease: 'easeOut' }}
        className="animate-orbit-1 absolute left-1/2 top-1/2 -z-10 h-0 w-0"
      >
        <div className="animate-blob-morph absolute h-56 w-56 -translate-x-1/2 -translate-y-[calc(50%+96px)] bg-flame-500 sm:h-72 sm:w-72 sm:-translate-y-[calc(50%+128px)]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
        className="animate-orbit-2 absolute left-1/2 top-1/2 -z-10 h-0 w-0"
      >
        <div className="absolute h-44 w-44 -translate-x-1/2 -translate-y-[calc(50%+80px)] rounded-full bg-ink-400 dark:bg-ink-300 sm:h-56 sm:w-56 sm:-translate-y-[calc(50%+104px)]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
        className="animate-orbit-3 absolute left-1/2 top-1/2 -z-10 h-0 w-0"
      >
        <div className="absolute h-28 w-28 -translate-x-1/2 -translate-y-[calc(50%+66px)] rounded-3xl bg-emerald-500 sm:h-36 sm:w-36 sm:-translate-y-[calc(50%+86px)]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.75, ease: 'easeOut' }}
        className="animate-orbit-4 absolute left-1/2 top-1/2 -z-10 h-0 w-0"
      >
        <div className="absolute h-16 w-16 -translate-x-1/2 -translate-y-[calc(50%+108px)] bg-emerald-300 [clip-path:polygon(50%_0%,0%_100%,100%_100%)] sm:h-20 sm:w-20 sm:-translate-y-[calc(50%+140px)]" />
      </motion.div>

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
            className="absolute inset-0 m-auto h-[360px] w-full max-w-[240px] overflow-hidden rounded-[32px] border border-border bg-card px-6 pb-6 pt-3 text-center shadow-[var(--shadow-soft-lg)] sm:h-[420px] sm:max-w-[300px]"
          >
            <Screen />
          </motion.div>
        )
      })}

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

        <motion.img
          src="/hand-left.png"
          alt=""
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute bottom-0 left-0 hidden w-[26vw] max-w-[420px] min-w-[260px] rotate-3 select-none lg:block"
          aria-hidden="true"
          draggable={false}
        />

        <motion.img
          src="/hand-right.png"
          alt=""
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute right-0 top-8 hidden w-[26vw] max-w-[420px] min-w-[260px] -rotate-3 select-none lg:block"
          aria-hidden="true"
          draggable={false}
        />

        <div className="relative mx-auto max-w-2xl px-5 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-24 lg:pt-6 lg:pb-20">
          <div className="flex flex-col text-center">
            <MotionHeading
              level="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="order-1"
            >
              Schedule smarter.{' '}
              <span className="bg-gradient-to-r from-flame-500 to-flame-700 bg-clip-text text-transparent">
                Meet easier.
              </span>
            </MotionHeading>

            <BookingScreenshot className="order-4 lg:order-2" />

            <div className="order-2 mt-8 flex flex-col sm:mt-10 sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:order-3">
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

            <div className="order-3 relative left-1/2 mt-10 w-screen -translate-x-1/2 lg:hidden">
              <motion.img
                src="/hand-right.png"
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="ml-auto block w-[68vw] max-w-[300px] min-w-[200px] -rotate-3 select-none"
                draggable={false}
              />
            </div>

            <div className="order-5 relative left-1/2 mt-10 w-screen -translate-x-1/2 lg:hidden">
              <motion.img
                src="/hand-left.png"
                alt="Illustration of a reaching hand, representing connection between mentors and trainees"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="block w-[68vw] max-w-[300px] min-w-[200px] rotate-3 select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <Reveal>
            <Heading level="h2" className="text-center">How it works</Heading>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-3 text-center text-sm sm:text-base text-muted-foreground">
              Three steps to your first session.
            </p>
          </Reveal>

          <div className="mt-10 sm:mt-12 grid gap-14 grid-cols-1 lg:grid-cols-3 lg:gap-20">
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
                      className="absolute inset-x-[-10%] top-[70%] h-[130%] transition-[top] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:top-0"
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
              <Heading level="h2" className="mt-3">Power Your Platform with iMeet</Heading>
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
