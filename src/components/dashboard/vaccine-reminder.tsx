import React from 'react'
import Link from 'next/link'
import { Syringe, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Vaccine } from '@/types/medical'
import { formatDate, isUpcoming, isPast } from '@/utils/age'

interface VaccineReminderProps {
  vaccines: Vaccine[]
}

export function VaccineReminder({ vaccines }: VaccineReminderProps) {
  const upcoming = vaccines
    .filter((v) => v.next_due_date && isUpcoming(v.next_due_date, 60))
    .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
    .slice(0, 3)

  const overdue = vaccines.filter((v) => v.next_due_date && isPast(v.next_due_date))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Syringe className="w-4 h-4 text-[var(--secondary)]" />
            Vaccine Reminders
          </CardTitle>
          <Link href="/medical?tab=vaccines" className="text-xs text-[var(--primary)] hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {overdue.length > 0 && (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--error-container)] p-2.5 mb-3">
            <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" />
            <p className="text-xs text-[var(--on-error-container)] font-medium">
              {overdue.length} vaccine{overdue.length > 1 ? 's' : ''} overdue
            </p>
          </div>
        )}

        {upcoming.length === 0 && overdue.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-[var(--secondary)] mx-auto mb-2" />
            <p className="text-sm text-[var(--on-surface-variant)]">All up to date!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((v) => {
              const daysLeft = Math.ceil(
                (new Date(v.next_due_date!).getTime() - Date.now()) / 86400000
              )
              return (
                <div key={v.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--on-surface-muted)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--on-surface)]">{v.name}</p>
                      <p className="text-xs text-[var(--on-surface-muted)]">{v.dose}</p>
                    </div>
                  </div>
                  <Badge variant={daysLeft <= 7 ? 'error' : 'secondary'}>
                    {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
