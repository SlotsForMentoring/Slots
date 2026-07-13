import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button, Logo } from '@/components/atoms'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: 'Browse available slots',
    description: 'See when volunteer mentors are free and pick a time that works for you.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: 'Book in seconds',
    description: 'One click to reserve a 1-on-1 session. No back-and-forth emails needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: 'Learn from volunteers',
    description: 'Our mentors give their time freely. Real experience, real guidance.',
  },
]

const STEPS = [
  { step: '01', title: 'Sign in with Google', description: 'One click — no passwords, no forms.' },
  { step: '02', title: 'Browse open slots',   description: 'Filter by date and find a mentor ready to help.' },
  { step: '03', title: 'Book your session',   description: 'Confirm the slot and show up ready to grow.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const getStarted = () => {
    if (!user) return navigate('/login')
    if (user.role === 'admin') return navigate('/admin/users')
    if (user.role === 'volunteer') return navigate('/my-slots')
    navigate('/slots')
  }

  return (
    <div className="font-sans">

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl">
          <div className="relative left-1/2 w-[36rem] sm:w-[72rem] -translate-x-1/2 rotate-[30deg] aspect-[1155/678] bg-gradient-to-tr from-brand-400 to-brand-200 opacity-20" />
        </div>

        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-28 lg:py-36 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs sm:text-sm text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
            1-on-1 mentoring — free, no sign-up fees
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Schedule smarter.{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              Meet easier.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AgenGate is a pair scheduling platform — connect with the right person at the right time.
            Whether it's a mentor, a peer, or a volunteer expert, book a 1-on-1 session in one click.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" fullWidth={false} className="w-full sm:w-auto" onClick={getStarted}>
              {user ? 'Go to dashboard →' : "Get started — it's free"}
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

          <p className="mt-6 text-xs sm:text-sm text-gray-400">
            No credit card required · Powered by volunteer mentors
          </p>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Everything you need to learn faster
          </h2>
          <p className="mt-3 text-center text-sm sm:text-base text-gray-500">
            Simple, focused, and built around your growth.
          </p>

          <div className="mt-10 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200"
              >
                <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">{icon}</div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            How it works
          </h2>
          <p className="mt-3 text-center text-sm sm:text-base text-gray-500">
            Three steps to your first session.
          </p>

          <div className="mt-10 sm:mt-12 grid gap-8 grid-cols-1 sm:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 sm:text-center">
                <div className="shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 sm:mb-4 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25">
                  {step}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 sm:mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gradient-to-r from-brand-600 to-brand-800 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-6 text-center">
          <Logo size="md" className="justify-center mb-5 sm:mb-6 [&_span:last-child]:text-white" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to find your mentor?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-brand-200">
            Join trainees already learning with AgenGate.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="mt-7 sm:mt-8 w-full sm:w-auto border-white/40 text-white hover:bg-white hover:text-brand-600"
            onClick={getStarted}
          >
            {user ? 'Go to dashboard' : 'Sign in with Google'}
          </Button>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <Logo size="sm" />
          <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} AgenGate. Built for learners, by volunteers.
          </p>
        </div>
      </footer>

    </div>
  )
}
