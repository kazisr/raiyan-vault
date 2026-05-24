'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { calculateAge } from '@/utils/age'
import { CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'
import { Card, CardContent } from '@/components/ui/card'

export function AgeCounter() {
  const [age, setAge] = useState(() => calculateAge(CHILD_DOB))

  useEffect(() => {
    const interval = setInterval(() => {
      setAge(calculateAge(CHILD_DOB))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-container)] to-[var(--secondary-container)] border-0">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -translate-x-6 translate-y-6" />
      </div>
      <CardContent className="pt-5 relative z-10">
        <p className="text-xs font-medium text-[var(--on-primary-container)]/70 uppercase tracking-wider mb-2">
          {CHILD_NICKNAME} is
        </p>
        <motion.div
          key={age.label}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-1"
        >
          <div className="flex items-end gap-4 flex-wrap">
            {age.years > 0 && (
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-bold text-[var(--on-primary-container)]">{age.years}</span>
                <span className="text-sm text-[var(--on-primary-container)]/70 block">years</span>
              </div>
            )}
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold text-[var(--on-primary-container)]">{age.months}</span>
              <span className="text-sm text-[var(--on-primary-container)]/70 block">months</span>
            </div>
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold text-[var(--on-primary-container)]">{age.days}</span>
              <span className="text-sm text-[var(--on-primary-container)]/70 block">days</span>
            </div>
          </div>
          <p className="text-xs text-[var(--on-primary-container)]/60">
            {age.totalDays} days since birth
          </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
