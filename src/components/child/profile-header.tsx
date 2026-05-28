'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Baby, CalendarDays, Droplets } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/age'
import type { AgeDetail } from '@/utils/age'

interface ProfileHeaderProps {
  name: string
  dob: string
  age: AgeDetail
  avatarUrl?: string
  bloodGroup?: string
}

export function ProfileHeader({ name, dob, age, avatarUrl, bloodGroup }: ProfileHeaderProps) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--primary-container)] via-[var(--surface-container-low)] to-[var(--secondary-container)] p-6 sm:p-7"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 -translate-x-10 translate-y-10" />

      <div className="relative z-10 flex items-start gap-5">
        <div className="relative">
          <Avatar className="w-20 h-20 ring-4 ring-white/30">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Baby className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--on-surface)] leading-tight">{name}</h1>

          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)]">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(dob, 'MMMM D, YYYY')}
            </div>
            {bloodGroup && (
              <div className="flex items-center gap-1 text-xs">
                <Droplets className="w-3 h-3 text-[var(--error)]" />
                <span className="text-[var(--on-surface-variant)]">{bloodGroup}</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Badge variant="default" className="text-xs px-3 py-1">
              {age.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Age breakdown pills */}
      <div className="relative z-10 flex gap-3 mt-5 pt-4 border-t border-white/20">
        {[
          { value: age.years, unit: 'years' },
          { value: age.months, unit: 'months' },
          { value: age.days, unit: 'days' },
          { value: age.totalDays, unit: 'total days' },
        ].map(({ value, unit }) => (
          <div key={unit} className="text-center">
            <p className="text-lg font-bold text-[var(--on-primary-container)]">{value}</p>
            <p className="text-xs text-[var(--on-primary-container)]/60">{unit}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
