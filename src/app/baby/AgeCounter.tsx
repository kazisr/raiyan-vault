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
  const months = now.diff(birth.add(years, 'year'), 'month')
  const afterYearsMonths = birth.add(years, 'year').add(months, 'month')

  const remainingMs = now.valueOf() - afterYearsMonths.valueOf()
  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { years, months, hours, minutes, seconds }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function AgeCounter({ dob }: Props) {
  const [age, setAge] = useState(() => getAge(dob))

  useEffect(() => {
    const id = setInterval(() => setAge(getAge(dob)), 1000)
    return () => clearInterval(id)
  }, [dob])

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-center">
      {age.years > 0 && (
        <>
          <div>
            <span className="text-5xl font-bold tabular-nums">{age.years}</span>
            <span className="block text-sm opacity-75 mt-1">years</span>
          </div>
          <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
        </>
      )}
      {age.months > 0 && (
        <>
          <div>
            <span className="text-5xl font-bold tabular-nums">{age.months}</span>
            <span className="block text-sm opacity-75 mt-1">months</span>
          </div>
          <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
        </>
      )}
      <div>
        <span className="text-5xl font-bold tabular-nums">{pad(age.hours)}</span>
        <span className="block text-sm opacity-75 mt-1">hours</span>
      </div>
      <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
      <div>
        <span className="text-5xl font-bold tabular-nums">{pad(age.minutes)}</span>
        <span className="block text-sm opacity-75 mt-1">minutes</span>
      </div>
      <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
      <div>
        <span className="text-5xl font-bold tabular-nums">{pad(age.seconds)}</span>
        <span className="block text-sm opacity-75 mt-1">seconds</span>
      </div>
    </div>
  )
}
