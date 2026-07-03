import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — safely merge Tailwind classes.
 * Prevents conflicts like "bg-red-500 bg-blue-500".
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
