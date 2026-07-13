// Helpers for the "Booking confirmed" screen: building a Google Calendar
// "quick add" link, and sharing a booking via the Web Share API (falling
// back to clipboard copy where Share isn't supported).

function toGCalDate(iso) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
}

export function googleCalendarUrl(slot, agenda) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Mentoring session with ${slot.volunteer_name}`,
    dates: `${toGCalDate(slot.start_time)}/${toGCalDate(slot.end_time)}`,
    details: agenda || 'Booked via iMeet',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export async function shareBooking(slot) {
  const text = `I booked a mentoring session with ${slot.volunteer_name} — see you there!`
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'iMeet booking', text, url })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  }
  return 'unsupported'
}
