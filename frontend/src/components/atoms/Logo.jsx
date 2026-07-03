import { cn } from '@/lib/cn'

export default function Logo({ size = 'md', iconOnly = false, className }) {
  const s = {
    sm: { icon: 'w-6 h-6 rounded-lg text-sm',  text: 'text-base' },
    md: { icon: 'w-8 h-8 rounded-xl text-sm',  text: 'text-xl'  },
    lg: { icon: 'w-10 h-10 rounded-xl text-base', text: 'text-2xl' },
  }[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        aria-hidden="true"
        className={cn(
          s.icon,
          'flex items-center justify-center flex-shrink-0',
          'bg-gradient-to-br from-brand-500 to-brand-700',
        )}
      >
        <span className="text-white font-bold select-none">M</span>
      </div>
      {!iconOnly && (
        <span className={cn('font-semibold tracking-tight text-gray-900', s.text)}>
          Mentoria
        </span>
      )}
    </div>
  )
}
