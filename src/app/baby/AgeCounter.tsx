'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

interface Props {
  dob: string
}

function getAge(dob: string) {
  const birth = dayjs(dob)
  const now = dayjs()

  const years = now.diff(birth, 'year')
  const afterYears = birth.add(years, 'year')

  const months = now.diff(afterYears, 'month')
  const afterYearsMonths = afterYears.add(months, 'month')

  const remainingMs = now.valueOf() - afterYearsMonths.valueOf()
  const totalSeconds = Math.floor(remainingMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { years, months, days, hours, minutes, seconds }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface UnitProps {
  value: number
  label: string
  padded?: boolean
}

function Unit({ value, label, padded }: UnitProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl font-bold tabular-nums leading-none">
        {padded ? pad(value) : value}
      </span>
      <span className="text-xs opacity-75 mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function Sep() {
  return <span className="text-3xl font-bold opacity-40 self-start mt-1">:</span>
}

export default function AgeCounter({ dob }: Props) {
  const [age, setAge] = useState(() => getAge(dob))

  useEffect(() => {
    const id = setInterval(() => setAge(getAge(dob)), 1000)
    return () => clearInterval(id)
  }, [dob])

  const showYears = age.years > 0
  const showMonths = showYears || age.months > 0
  const showDays = showMonths || age.days > 0
  const showHours = showDays || age.hours > 0

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap text-center text-white">
      {showYears && <><Unit value={age.years} label="years" /><Sep /></>}
      {showMonths && <><Unit value={age.months} label="months" padded={showYears} /><Sep /></>}
      {showDays && <><Unit value={age.days} label="days" padded={showMonths} /><Sep /></>}
      {showHours && <><Unit value={age.hours} label="hours" padded={showDays} /><Sep /></>}
      <Unit value={age.minutes} label="minutes" padded={showHours} />
      <Sep />
      <Unit value={age.seconds} label="seconds" padded />
    </div>
  )
}
