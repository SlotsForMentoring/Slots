import { cn } from '@/lib/cn'

/** Logo — the iMeet wordmark, served from /public/logo.png at a fixed height per `size`. */
export function Logo({ size = 'md', className }) {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  }[size]

  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/logo.png"
        alt="AgenGate"
        className={cn(heights, 'w-auto select-none')}
        draggable={false}
      />
    </div>
  )
}
