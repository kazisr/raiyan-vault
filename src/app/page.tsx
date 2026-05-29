import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Heart, Camera, Star, Calendar, LogIn, ArrowUpRight } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME, EVENT_TYPES } from '@/constants/child'
import AgeCounter from '@/components/baby/AgeCounter'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { BabyTopbar } from '@/components/baby/BabyTopbar'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import { calculateAge, formatDate } from '@/utils/age'
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

export default async function BabyPage() {
  const supabase = createPublicClient()

  const [{ data: photos }, { data: events }, { data: ledgerEntries }] = await Promise.all([
    supabase
      .from('photos')
      .select('id, storage_path, caption')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('events')
      .select('id, title, event_date, event_type')
      .order('event_date', { ascending: false })
      .limit(6),
    supabase
      .from('ledger_entries')
      .select('id, amount, type, currency, category, description, entry_date, source_person')
      .order('entry_date', { ascending: false }),
  ])

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from('photos')
        .createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )

  const age = calculateAge(CHILD_DOB)

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledgerEntries ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  const carouselPhotos = photosWithUrls
    .filter((p) => p.url !== null)
    .map((p) => ({ id: p.id, url: p.url!, caption: p.caption }))

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
      <BabyTopbar />

      {/* Main container with standard generous outer spacing */}
      <main className="max-w-2xl mx-auto px-6 py-20 space-y-16">

        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {CHILD_NAME}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 transition-transform hover:scale-105">
            <Heart className="w-6 h-6 fill-current" />
          </div>
        </header>

        {/* Age Counter Hero */}
        <section className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 rounded-2xl p-8 border border-rose-100/60 dark:border-rose-900/30 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 dark:text-rose-400 block mb-5">
            Current Age
          </span>
          <div className="text-gray-900 dark:text-gray-100 font-medium">
            <AgeCounter dob={CHILD_DOB} />
          </div>
          <div className="mt-6 pt-5 border-t border-rose-100/80 dark:border-rose-900/40 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Days since birth</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{age.totalDays} days</span>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-6">
          <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Photos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{carouselPhotos.length}</p>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Milestones</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{events?.length ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Financial Summary & Ledger sections contain internal padding/margins natively */}
        <div className="space-y-16 p-10">
          <BalanceSection balances={balances} />
          <LedgerHistory entries={ledgerEntries ?? []} />
        </div>

        {/* Photo Carousel Section */}
        {carouselPhotos.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              <Camera className="w-4 h-4" />
              <h2>Recent Captures</h2>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <PhotoCarousel photos={carouselPhotos} />
            </div>
          </section>
        )}

        {/* Timeline Section */}
        {events && events.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              <h2>Timeline Highlights</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
              {events.map((event) => {
                const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-base border border-gray-100/80 dark:border-gray-700 shrink-0">
                        {typeInfo?.emoji ?? '📝'}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer Section */}
        <footer className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          <p>For {CHILD_NICKNAME} with love</p>
          <Link
            href="/login"
            className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <LogIn className="w-4 h-4" />
            Dashboard login
          </Link>
        </footer>
      </main>
    </div>
  )
}
