'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

interface Props {
  dob: string
  nickname: string
}

function getUnits(dob: string) {
  const birth = dayjs(dob)
  const now = dayjs()

  const years = now.diff(birth, 'year')
  const afterYears = birth.add(years, 'year')
  const months = now.diff(afterYears, 'month')
  const afterMonths = afterYears.add(months, 'month')
  const days = now.diff(afterMonths, 'day')
  const afterDays = afterMonths.add(days, 'day')
  const remainingSeconds = Math.floor((now.valueOf() - afterDays.valueOf()) / 1000)
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60
  const totalDays = now.diff(birth, 'day')

  return { years, months, days, hours, minutes, seconds, totalDays }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function AgeCounter({ dob, nickname }: Props) {
  const [u, setU] = useState(() => getUnits(dob))

  useEffect(() => {
    const id = setInterval(() => setU(getUnits(dob)), 1000)
    return () => clearInterval(id)
  }, [dob])

  const items = [
    ...(u.years > 0  ? [{ value: String(u.years),  label: 'years'   }] : []),
    ...(u.months > 0 ? [{ value: String(u.months), label: 'months'  }] : []),
    { value: String(u.days),    label: 'days'    },
    { value: pad(u.hours),      label: 'hours'   },
    { value: pad(u.minutes),    label: 'minutes' },
    { value: pad(u.seconds),    label: 'seconds' },
  ]

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-3 text-center">
        {nickname} is
      </p>

      <div className="flex items-center justify-center gap-2 flex-wrap text-center">
        {items.map(({ value, label }, i) => (
          <div key={label} className="flex items-start gap-2">
            {i > 0 && (
              <span className="text-3xl font-bold opacity-40 mt-1">:</span>
            )}
            <div className="text-center">
              <span className="text-5xl font-bold tabular-nums leading-none">{value}</span>
              <span className="block text-xs opacity-75 mt-1">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs opacity-60 mt-4 text-center">
        {u.totalDays} days since birth
      </p>
    </>
  )
}
