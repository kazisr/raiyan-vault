'use client'

import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'

function getDetailedAge(dob: string) {
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
  const totalDays = now.diff(birth, 'day')
  return { years, months, days, hours, minutes, seconds, totalDays }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function AgeCounter() {
  const [age, setAge] = useState(() => getDetailedAge(CHILD_DOB))

  useEffect(() => {
    const interval = setInterval(() => setAge(getDetailedAge(CHILD_DOB)), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--primary)] via-[var(--primary-container)] to-[var(--secondary-container)] p-6 sm:p-7">
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
      <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5" aria-hidden="true" />

      <div className="relative z-10">
        <p className="text-xs font-semibold text-[var(--on-primary-container)]/70 uppercase tracking-widest mb-3">
          {CHILD_NICKNAME} is
        </p>

        <div className="space-y-4">
          <div className="flex items-end gap-5 flex-wrap">
            {age.years > 0 && <AgeUnit value={age.years} label="years" />}
            <AgeUnit value={age.months} label="months" />
            <AgeUnit value={age.days} label="days" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <SmallUnit value={pad(age.hours)} label="hrs" />
            <Sep />
            <SmallUnit value={pad(age.minutes)} label="min" />
            <Sep />
            <SmallUnit value={pad(age.seconds)} label="sec" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--on-primary-container)]/20" />
            <p className="text-xs font-medium text-[var(--on-primary-container)]/60 px-1">
              {age.totalDays.toLocaleString()} days since birth
            </p>
            <div className="h-px flex-1 bg-[var(--on-primary-container)]/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AgeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-4xl sm:text-5xl font-bold text-[var(--on-primary-container)] tabular-nums leading-none">
        {value}
      </span>
      <span className="text-xs font-medium text-[var(--on-primary-container)]/65 tracking-wide uppercase">
        {label}
      </span>
    </div>
  )
}

function SmallUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold text-[var(--on-primary-container)] tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] font-medium text-[var(--on-primary-container)]/60 tracking-wide uppercase">
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return <span className="text-xl font-bold text-[var(--on-primary-container)]/40 self-start mt-1">:</span>
}
