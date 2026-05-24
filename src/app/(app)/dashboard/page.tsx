import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { LedgerSummary } from '@/components/dashboard/ledger-summary'
import { Skeleton } from '@/components/ui/skeleton'
import { CHILD_NAME, CHILD_DOB } from '@/constants/child'
import { formatDate } from '@/utils/age'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function DashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [photos, vaccines, visits, events, ledger] = await Promise.all([
    supabase.from('photos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('vaccines').select('*').eq('user_id', user.id).order('administered_date', { ascending: false }),
    supabase.from('doctor_visits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false }).limit(5),
    supabase.from('ledger_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const [blog] = await Promise.all([
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return (
    <div className="space-y-6">
      {/* Header greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          Hello, Family 👋
        </h2>
        <p className="text-sm text-[var(--on-surface-variant)]">
          {CHILD_NAME} · Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
        </p>
      </div>

      {/* Age counter — hero widget */}
      <AgeCounter />

      {/* Quick stats */}
      <QuickStats
        photoCount={photos.count ?? 0}
        vaccineCount={(vaccines.data ?? []).length}
        visitCount={visits.count ?? 0}
        blogCount={blog.count ?? 0}
      />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaccineReminder vaccines={vaccines.data ?? []} />
        <RecentEvents events={events.data ?? []} />
      </div>

      <LedgerSummary entries={ledger.data ?? []} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-32 w-full rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[var(--radius-lg)]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  )
}
