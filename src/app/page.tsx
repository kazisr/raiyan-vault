import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import { RecentEvents } from '@/components/dashboard/recent-events'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import { ThemeToggle } from '@/components/baby/ThemeToggle'
import { formatDate } from '@/utils/age'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `${CHILD_NICKNAME}'s Page`,
  description: `Follow ${CHILD_NAME}'s journey — milestones, memories and more.`,
}

export const dynamic = 'force-dynamic'

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function PublicDashboardPage() {
  const supabase = createPublicClient()

  const [
    { data: photos },
    { data: ledgerEntries },
    { data: vaccines },
    { data: events },
    { count: visitCount },
    { count: blogCount },
  ] = await Promise.all([
    supabase.from('photos').select('id, storage_path, caption').order('created_at', { ascending: false }).limit(12),
    supabase.from('ledger_entries').select('id, amount, type, currency, category, description, entry_date, source_person').order('entry_date', { ascending: false }),
    supabase.from('vaccines').select('*').order('administered_date', { ascending: false }),
    supabase.from('events').select('*').order('event_date', { ascending: false }).limit(5),
    supabase.from('doctor_visits').select('id', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
  ])

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage.from('photos').createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )

  const carouselPhotos = photosWithUrls
    .filter((p) => p.url !== null)
    .map((p) => ({ id: p.id, url: p.url!, caption: p.caption }))

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledgerEntries ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">{CHILD_NAME}</h1>
          <p className="text-sm text-[var(--on-surface-muted)]">
            Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        </div>
      </header>

      <AgeCounter />

      <QuickStats
        photoCount={carouselPhotos.length}
        vaccineCount={(vaccines ?? []).length}
        visitCount={visitCount ?? 0}
        blogCount={blogCount ?? 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaccineReminder vaccines={vaccines ?? []} readOnly />
        <RecentEvents events={events ?? []} readOnly />
      </div>

      {carouselPhotos.length > 0 && (
        <div className="rounded-[var(--radius-lg)] overflow-hidden">
          <PhotoCarousel photos={carouselPhotos} />
        </div>
      )}

      <BalanceSection balances={balances} />
      <LedgerHistory entries={ledgerEntries ?? []} />

      <footer className="pt-4 border-t border-[var(--outline-variant)] text-center text-xs text-[var(--on-surface-muted)]">
        For {CHILD_NICKNAME} with love
      </footer>

    </div>
  )
}
