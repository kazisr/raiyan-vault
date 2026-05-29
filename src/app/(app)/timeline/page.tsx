import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TimelineClient } from './timeline-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'
import type { EventWithImages } from '@/types/events'

export const metadata: Metadata = { title: 'Timeline' }

async function TimelineData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*, event_images(*)')
    .eq('user_id', user.id)
    .order('event_date', { ascending: false })

  return <TimelineClient events={(events ?? []) as EventWithImages[]} userId={user.id} />
}

export default function TimelinePage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[var(--radius-lg)]" />
        ))}
      </div>
    }>
      <TimelineData />
    </Suspense>
  )
}
