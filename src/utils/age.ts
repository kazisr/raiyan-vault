import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

export interface AgeDetail {
  years: number
  months: number
  days: number
  totalDays: number
  label: string
  shortLabel: string
}

export function calculateAge(dob: string | Date): AgeDetail {
  const birth = dayjs(dob)
  const now = dayjs()

  const years = now.diff(birth, 'year')
  const months = now.diff(birth, 'month') % 12
  const days = now.diff(birth.add(now.diff(birth, 'month'), 'month'), 'day')
  const totalDays = now.diff(birth, 'day')

  let label = ''
  let shortLabel = ''

  if (years === 0 && months === 0) {
    label = `${days} day${days !== 1 ? 's' : ''} old`
    shortLabel = `${days}d`
  } else if (years === 0) {
    label = `${months} month${months !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''} old`
    shortLabel = `${months}mo ${days}d`
  } else {
    label = `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`
    shortLabel = `${years}y ${months}mo`
  }

  return { years, months, days, totalDays, label, shortLabel }
}

export function formatDate(date: string | Date, format = 'MMM D, YYYY') {
  return dayjs(date).format(format)
}

export function formatRelative(date: string | Date) {
  return dayjs(date).fromNow()
}

export function isUpcoming(date: string | Date, withinDays = 30) {
  const d = dayjs(date)
  const now = dayjs()
  return d.isAfter(now) && d.diff(now, 'day') <= withinDays
}

export function isPast(date: string | Date) {
  return dayjs(date).isBefore(dayjs())
}
