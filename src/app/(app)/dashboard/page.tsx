import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { Skeleton } from '@/components/ui/skeleton'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'
import { Camera } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function DashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const { data: userProfile } = await admin
    .from('user_profiles')
    .select('name, role')
    .eq('user_id', user.id)
    .single()

  const isDad = !userProfile || userProfile.role === 'Dad'

  // Resolve per-section permissions for non-Dad users
  let canViewLedger = isDad
  let canViewMedical = isDad

  if (!isDad) {
    const { data: perms } = await admin
      .from('role_permissions')
      .select('permission, granted')
      .eq('role', userProfile.role)
      .in('permission', ['view_ledger', 'view_medical'])

    const permMap: Record<string, boolean> = Object.fromEntries(
      (perms ?? []).map((p: { permission: string; granted: boolean }) => [p.permission, p.granted])
    )
    canViewLedger  = permMap['view_ledger']  === true
    canViewMedical = permMap['view_medical'] === true
  }

  // Fetch all shared vault data using admin client (bypasses RLS)
  const [photos, vaccines, visits, events, ledger, blog] = await Promise.all([
    admin.from('photos').select('id, storage_path, caption').eq('is_featured', true).order('created_at', { ascending: false }),
    canViewMedical
      ? admin.from('vaccines').select('*').order('administered_date', { ascending: false })
      : Promise.resolve({ data: [] }),
    canViewMedical
      ? admin.from('doctor_visits').select('id', { count: 'exact', head: true })
      : Promise.resolve({ count: 0 }),
    admin.from('events').select('*').order('event_date', { ascending: false }).limit(5),
    canViewLedger
      ? admin.from('ledger_entries').select('*').order('entry_date', { ascending: false })
      : Promise.resolve({ data: [] }),
    admin.from('blog_posts').select('id', { count: 'exact', head: true }),
  ])

  const photosWithUrls = await Promise.all(
    (photos.data ?? []).map(async (photo: { id: string; storage_path: string; caption: string | null }) => {
      const { data } = await admin.storage.from('photos').createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )
  const carouselPhotos = photosWithUrls
    .filter((p: { url: string | null }) => p.url !== null)
    .map((p: { id: string; url: string; caption: string | null }) => ({ id: p.id, url: p.url!, caption: p.caption }))

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledger.data ?? []).filter((e: { currency: string }) => e.currency === currency)
    const income  = rows.filter((e: { type: string }) => e.type === 'income').reduce((s: number, e: { amount: number }) => s + e.amount, 0)
    const expense = rows.filter((e: { type: string }) => e.type === 'expense').reduce((s: number, e: { amount: number }) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  return (
    <div className="space-y-6">
      {/* Header greeting */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-[var(--primary)]">
          {userProfile?.role ? `${userProfile.role} of ${CHILD_NICKNAME}` : CHILD_NICKNAME}
        </p>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          Hello, {userProfile?.name ?? 'Family'} 👋
        </h2>
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
        {canViewMedical && <VaccineReminder vaccines={vaccines.data ?? []} />}
        <RecentEvents events={events.data ?? []} />
      </div>

      {/* Photo carousel */}
      {carouselPhotos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-muted)]">
            <Camera className="w-4 h-4" />
            <h2>Featured Photos</h2>
          </div>
          <div className="rounded-[var(--radius-lg)] overflow-hidden">
            <PhotoCarousel photos={carouselPhotos} />
          </div>
        </section>
      )}

      {/* Balance + full ledger history */}
      {canViewLedger && (
        <>
          <BalanceSection balances={balances} />
          <LedgerHistory entries={ledger.data ?? []} />
        </>
      )}
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
