import { useEffect } from 'react'

const DEFAULT_INTERVAL = 10_000

export function usePolling(callback, interval = DEFAULT_INTERVAL) {
  useEffect(() => {
    const id = setInterval(callback, interval)
    return () => clearInterval(id)
  }, [callback, interval])
}
