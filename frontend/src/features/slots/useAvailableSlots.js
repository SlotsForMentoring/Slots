import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'

/** useAvailableSlots — every bookable slot for the trainee "Browse Slots" page, with local optimistic removal once booked. */
export function useAvailableSlots() {
  const [slots, setSlots] = useState([])
  const [state, setState] = useState('loading')

  const fetchSlots = useCallback(() => {
    api
      .getAvailableSlots()
      .then((data) => {
        setSlots(data ?? [])
        setState('success')
      })
      .catch(() => setState('error'))
  }, [])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const reload = useCallback(() => {
    setState('loading')
    fetchSlots()
  }, [fetchSlots])

  const removeSlot = useCallback((id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { slots, state, reload, removeSlot }
}

/** useOnlineStatus — tracks navigator.onLine so pages can show an OfflineBanner. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
