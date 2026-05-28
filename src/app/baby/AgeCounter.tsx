'use client'

import { useEffect, useState } from 'react'

interface Props {
  dob: string
}

function getHMS(dob: string) {
  const totalSeconds = Math.floor((Date.now() - new Date(dob).getTime()) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { hours, minutes, seconds }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function AgeCounter({ dob }: Props) {
  const [hms, setHMS] = useState(() => getHMS(dob))

  useEffect(() => {
    const id = setInterval(() => setHMS(getHMS(dob)), 1000)
    return () => clearInterval(id)
  }, [dob])

  return (
    <div className="mt-5 border-t border-white/20 pt-4">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-3 text-center">
        and counting
      </p>
      <div className="flex items-center justify-center gap-4 text-center">
        <div>
          <span className="text-4xl font-bold tabular-nums">{pad(hms.hours)}</span>
          <span className="block text-xs opacity-75 mt-1">hours</span>
        </div>
        <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
        <div>
          <span className="text-4xl font-bold tabular-nums">{pad(hms.minutes)}</span>
          <span className="block text-xs opacity-75 mt-1">minutes</span>
        </div>
        <span className="text-3xl font-bold opacity-50 -mt-3">:</span>
        <div>
          <span className="text-4xl font-bold tabular-nums">{pad(hms.seconds)}</span>
          <span className="block text-xs opacity-75 mt-1">seconds</span>
        </div>
      </div>
    </div>
  )
}
