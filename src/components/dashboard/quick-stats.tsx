import React from 'react'
import { Camera, Syringe, Stethoscope, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCard {
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

export function QuickStats({ photoCount = 0, vaccineCount = 0, visitCount = 0, blogCount = 0 }: QuickStatsProps) {
  const stats: StatCard[] = [
    { icon: Camera, label: 'Photos', value: photoCount, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-container)]' },
    { icon: Syringe, label: 'Vaccines', value: vaccineCount, color: 'text-[var(--secondary)]', bg: 'bg-[var(--secondary-container)]' },
    { icon: Stethoscope, label: 'Dr. Visits', value: visitCount, color: 'text-[var(--tertiary)]', bg: 'bg-[var(--tertiary-container)]' },
    { icon: BookOpen, label: 'Blog Posts', value: blogCount, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-container)]' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <Card key={label}>
          <CardContent className="pt-4">
            <div className={`w-9 h-9 rounded-[var(--radius-md)] ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{value}</p>
            <p className="text-xs text-[var(--on-surface-muted)] mt-0.5">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
