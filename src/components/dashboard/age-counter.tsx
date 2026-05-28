'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { calculateAge } from '@/utils/age'
import { CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'

export function AgeCounter() {
  const [age, setAge] = useState(() => calculateAge(CHILD_DOB))

  useEffect(() => {
    const interval = setInterval(() => setAge(calculateAge(CHILD_DOB)), 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--primary)] via-[var(--primary-container)] to-[var(--secondary-container)] p-6 sm:p-7">
      {/* Decorative shapes */}
      <div
        className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-sm"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-white/10 blur-sm"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <p className="text-xs font-semibold text-[var(--on-primary-container)]/70 uppercase tracking-widest mb-3">
          {CHILD_NICKNAME} is
        </p>

        <motion.div
          key={age.label}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="space-y-3"
        >
          <div className="flex items-end gap-5 flex-wrap">
            {age.years > 0 && (
              <AgeUnit value={age.years} label="years" />
            )}
            <AgeUnit value={age.months} label="months" />
            <AgeUnit value={age.days} label="days" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--on-primary-container)]/20" />
            <p className="text-xs font-medium text-[var(--on-primary-container)]/60 px-1">
              {age.totalDays.toLocaleString()} days since birth
            </p>
            <div className="h-px flex-1 bg-[var(--on-primary-container)]/20" />
          </div>
        </motion.div>
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
