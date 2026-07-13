import { cn } from '@/lib/cn'

/** Logo — the iMeet wordmark, served from /public/logo.png at a fixed height per `size`. */
export function Logo({ size = 'md', className }) {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-7',
  }[size]

  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/logo.png"
        alt="iMeet"
        className={cn(heights, 'w-auto select-none')}
        draggable={false}
      />
    </div>
  )
}
