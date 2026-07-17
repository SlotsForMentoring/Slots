import { Button, Logo } from '@/components/atoms'

const API_URL = import.meta.env.VITE_API_URL || ''

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.83Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.87 8.87 4.77 12 4.77Z" />
    </svg>
  )
}

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl">
        <div className="relative left-1/2 aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-flame-400 to-flame-200 opacity-20 sm:w-[60rem]" />
      </div>

      <div className="mx-auto w-full max-w-md px-5 py-16 sm:py-24">
        <div className="rounded-[28px] border border-border bg-card p-8 text-center shadow-[var(--shadow-soft-lg)] sm:p-10">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" />
          </div>

          <h1 className="[font-family:var(--font-family-display)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Book 1-on-1 sessions with volunteer mentors — sign in to get started.
          </p>

          <Button size="lg" fullWidth onClick={handleLogin} className="mt-8 gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white p-[3px]">
              <GoogleIcon />
            </span>
            Sign in with Google
          </Button>

        </div>
      </div>
    </div>
  )
}
