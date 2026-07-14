import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'

/**
 * useMyBookings — fetches the signed-in trainee's bookings.
 * Mirrors the useAvailableSlots/useMySlots/useAllSlots shape (`slots`-like
 * data + `state` + `reload`) so every list page in the app follows the same
 * loading/error pattern.
 */
export function useMyBookings() {
  const [bookings, setBookings] = useState([])
  const [state, setState] = useState('loading')

  const fetchBookings = useCallback(() => {
    api
      .getMyBookings()
      .then((data) => {
        setBookings(data ?? [])
        setState('success')
      })
      .catch(() => setState('error'))
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const reload = useCallback(() => {
    setState('loading')
    fetchBookings()
  }, [fetchBookings])

  return { bookings, state, reload }
}
