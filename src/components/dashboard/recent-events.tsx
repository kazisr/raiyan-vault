import React from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/types/events'
import { formatDate } from '@/utils/age'
import { EVENT_TYPES } from '@/constants/child'

interface RecentEventsProps {
  events: Event[]
  readOnly?: boolean
}

export function RecentEvents({ events, readOnly }: RecentEventsProps) {
  const recent = events.slice(0, 4)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            Recent Events
          </CardTitle>
          {!readOnly && (
            <Link href="/timeline" className="text-xs text-[var(--primary)] hover:underline">View all</Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--on-surface-variant)]">No events yet</p>
            {!readOnly && (
              <Link href="/timeline" className="text-xs text-[var(--primary)] hover:underline mt-1 block">
                Add first memory
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((event) => {
              const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
              return (
                <Link key={event.id} href={`/timeline#${event.id}`} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-container)] flex items-center justify-center flex-shrink-0 text-base">
                    {typeInfo?.emoji ?? '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--on-surface)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-[var(--on-surface-muted)]">{formatDate(event.event_date)}</p>
                  </div>
                  {event.tags.length > 0 && (
                    <Badge variant="surface" className="flex-shrink-0 text-xs">{event.tags[0]}</Badge>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
