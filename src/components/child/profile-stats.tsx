import React from 'react'
import { Scale, Ruler } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/utils/age'

interface ProfileStatsProps {
  birthWeight?: number
  birthHeight?: number
  currentWeight?: number
  currentHeight?: number
  dob: string
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  birthValue?: string
  currentValue?: string
  unit: string
  color: string
}

function StatItem({ icon: Icon, label, birthValue, currentValue, unit, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-container)]">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--on-surface-muted)] mb-0.5">{label}</p>
        <div className="flex items-baseline gap-3">
          {birthValue && (
            <div>
              <span className="text-sm font-semibold text-[var(--on-surface)]">{birthValue}</span>
              <span className="text-xs text-[var(--on-surface-muted)] ml-1">{unit}</span>
              <span className="text-xs text-[var(--on-surface-muted)] block">at birth</span>
            </div>
          )}
          {currentValue && birthValue && <div className="w-px h-6 bg-[var(--outline-variant)]" />}
          {currentValue && (
            <div>
              <span className="text-sm font-semibold text-[var(--primary)]">{currentValue}</span>
              <span className="text-xs text-[var(--on-surface-muted)] ml-1">{unit}</span>
              <span className="text-xs text-[var(--on-surface-muted)] block">current</span>
            </div>
          )}
          {!birthValue && !currentValue && (
            <span className="text-sm text-[var(--on-surface-muted)]">Not recorded</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProfileStats({ birthWeight, birthHeight, currentWeight, currentHeight, dob }: ProfileStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Growth Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <StatItem
          icon={Scale}
          label="Weight"
          birthValue={birthWeight?.toString()}
          currentValue={currentWeight?.toString()}
          unit="kg"
          color="bg-[var(--primary-container)] text-[var(--primary)]"
        />
        <StatItem
          icon={Ruler}
          label="Height"
          birthValue={birthHeight?.toString()}
          currentValue={currentHeight?.toString()}
          unit="cm"
          color="bg-[var(--secondary-container)] text-[var(--secondary)]"
        />
      </CardContent>
    </Card>
  )
}
