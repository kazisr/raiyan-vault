import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { Skeleton } from '@/components/ui/skeleton'
import { CHILD_NAME, CHILD_DOB } from '@/constants/child'
import { formatDate } from '@/utils/age'
import { Camera } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function DashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [photos, vaccines, visits, events, ledger, blog] = await Promise.all([
    supabase.from('photos').select('id, storage_path, caption').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12),
    supabase.from('vaccines').select('*').eq('user_id', user.id).order('administered_date', { ascending: false }),
    supabase.from('doctor_visits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false }).limit(5),
    supabase.from('ledger_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const photosWithUrls = await Promise.all(
    (photos.data ?? []).map(async (photo) => {
      const { data } = await supabase.storage.from('photos').createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )
  const carouselPhotos = photosWithUrls
    .filter((p) => p.url !== null)
    .map((p) => ({ id: p.id, url: p.url!, caption: p.caption }))

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledger.data ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

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

      {/* Age counter with live hrs:min:sec */}
      <AgeCounter />

      {/* Quick stats */}
      <QuickStats
        photoCount={carouselPhotos.length}
        vaccineCount={(vaccines.data ?? []).length}
        visitCount={visits.count ?? 0}
        blogCount={blog.count ?? 0}
      />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaccineReminder vaccines={vaccines.data ?? []} />
        <RecentEvents events={events.data ?? []} />
      </div>

      {/* Photo carousel */}
      {carouselPhotos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-muted)]">
            <Camera className="w-4 h-4" />
            <h2>Recent Photos</h2>
          </div>
          <div className="rounded-[var(--radius-lg)] overflow-hidden">
            <PhotoCarousel photos={carouselPhotos} />
          </div>
        </section>
      )}

      {/* Balance + full ledger history */}
      <BalanceSection balances={balances} />
      <LedgerHistory entries={ledger.data ?? []} />
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
      <Skeleton className="h-40 w-full rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[var(--radius-lg)]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
      </div>
      <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
      <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />
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
