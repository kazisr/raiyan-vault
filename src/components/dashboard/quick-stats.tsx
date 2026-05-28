import React from 'react'
import { Camera, Syringe, Stethoscope, BookOpen } from 'lucide-react'

interface StatItem {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  bg: string
}

interface QuickStatsProps {
  photoCount?: number
  vaccineCount?: number
  visitCount?: number
  blogCount?: number
}

export function QuickStats({
  photoCount = 0,
  vaccineCount = 0,
  visitCount = 0,
  blogCount = 0,
}: QuickStatsProps) {
  const stats: StatItem[] = [
    {
      icon: Camera,
      label: 'Photos',
      value: photoCount,
      color: 'text-[var(--primary)]',
      bg: 'bg-[var(--primary-container)]',
    },
    {
      icon: Syringe,
      label: 'Vaccines',
      value: vaccineCount,
      color: 'text-[var(--secondary)]',
      bg: 'bg-[var(--secondary-container)]',
    },
    {
      icon: Stethoscope,
      label: 'Dr. Visits',
      value: visitCount,
      color: 'text-[var(--tertiary)]',
      bg: 'bg-[var(--tertiary-container)]',
    },
    {
      icon: BookOpen,
      label: 'Blog Posts',
      value: blogCount,
      color: 'text-[var(--primary)]',
      bg: 'bg-[var(--primary-container)]',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className={[
            'rounded-[var(--radius-xl)] bg-[var(--surface-container-low)]',
            'shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)]',
            'transition-shadow duration-200 p-4 sm:p-5',
          ].join(' ')}
        >
          <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-[var(--on-surface)] tabular-nums leading-none mb-1">
            {value}
          </p>
          <p className="text-xs font-medium text-[var(--on-surface-muted)] tracking-[0.3px]">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}
