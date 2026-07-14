import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'

/** useMySlots — a volunteer mentor's own slots (available + booked), for the "My Slots" page. */
export function useMySlots() {
  const [slots, setSlots] = useState([])
  const [state, setState] = useState('loading')

  const fetchSlots = useCallback(() => {
    api
      .getMySlots()
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

  const addSlot = useCallback((slot) => {
    setSlots((prev) => [slot, ...prev])
  }, [])

  const removeSlot = useCallback((id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // Cancelling the booking on a slot doesn't remove the slot itself - it
  // just frees it back up, so flip it back to available in place rather
  // than filtering it out like removeSlot does.
  const cancelSlotBooking = useCallback((slotId) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_booked: false, booking: null } : s)),
    )
  }, [])

  return { slots, state, reload, addSlot, removeSlot, cancelSlotBooking }
}
