import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/atoms'

const CONSENT_KEY = 'imeet_consent'

function hasConsented() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(CONSENT_KEY) === 'true'
}

/**
 * ConsentBanner — a dismissible bottom banner linking to /privacy and /terms,
 * shown on first visit (persisted in localStorage, so it stays dismissed
 * across sessions once accepted). Rendered once in RootLayout so it's
 * available on every page.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => !hasConsented())

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie and privacy notice"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[var(--shadow-soft-lg)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted-foreground">
          We use cookies to keep you signed in and improve iMeet. By using this site, you agree to our{' '}
          <Link to="/privacy" className="font-medium text-flame-600 underline underline-offset-2 dark:text-flame-400">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="font-medium text-flame-600 underline underline-offset-2 dark:text-flame-400">
            Terms of Service
          </Link>.
        </p>
        <Button size="sm" onClick={accept} className="w-full shrink-0 sm:w-auto">
          Got it
        </Button>
      </div>
    </div>
  )
}
