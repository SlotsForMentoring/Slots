import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

/**
 * Heading — the single title primitive for the app. Every page/section
 * title should render through this instead of a hand-typed className
 * string: several titles previously drifted out of sync (missing the
 * display typeface, inconsistent font-weight) simply because the same
 * long class string had been retyped slightly differently on each page.
 *
 * Framer Motion can wrap this directly (`motion(Heading)`) when a title
 * needs an entrance animation — see LandingPage's MotionHeading.
 */
const headingVariants = cva(
  '[font-family:var(--font-family-display)] font-semibold tracking-tight text-foreground',
  {
    variants: {
      level: {
        h1: 'text-4xl sm:text-6xl lg:text-7xl leading-[1.05]',
        h2: 'text-4xl sm:text-5xl leading-tight',
        h3: 'text-xl sm:text-2xl leading-snug',
      },
    },
    defaultVariants: { level: 'h2' },
  },
)

const TAGS = { h1: 'h1', h2: 'h2', h3: 'h3' }

export const Heading = forwardRef(function Heading(
  { level = 'h2', as, className, children, ...props },
  ref,
) {
  const Tag = as || TAGS[level]
  return (
    <Tag ref={ref} className={cn(headingVariants({ level }), className)} {...props}>
      {children}
    </Tag>
  )
})
