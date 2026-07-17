import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'
import { usePolling } from '@/hooks/usePolling'

/** useAllSlots — every mentor's slots, read-only, for the admin oversight page. */
export function useAllSlots() {
  const [slots, setSlots] = useState([])
  const [state, setState] = useState('loading')

  const fetchSlots = useCallback(() => {
    api
      .getAllSlots()
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

  usePolling(fetchSlots)

  return { slots, state, reload }
}
