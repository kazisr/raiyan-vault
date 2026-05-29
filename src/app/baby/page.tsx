import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Heart, Camera, Star, Calendar, LogIn, Wallet, ArrowUpRight } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME, EVENT_TYPES } from '@/constants/child'
import AgeCounter from './AgeCounter'
import PhotoCarousel from './PhotoCarousel'
import { calculateAge, formatDate } from '@/utils/age'
import { formatCurrency } from '@/utils/currency'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `${CHILD_NICKNAME}'s Page`,
  description: `Follow ${CHILD_NAME}'s journey — milestones, memories and more.`,
}

export const revalidate = 300

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
      .select('amount, type, currency'),
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

  const balances = (['JPY', 'BDT'] as const).map((currency) => {
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
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {CHILD_NAME}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </header>

        {/* Age Counter Hero */}
        <section className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 rounded-2xl p-6 border border-rose-100/60 dark:border-rose-900/40">
          <span className="text-xs font-medium uppercase tracking-wider text-rose-400 dark:text-rose-400 block mb-4">
            Current Age
          </span>
          <div className="text-gray-900 dark:text-gray-100 font-medium">
            <AgeCounter dob={CHILD_DOB} />
          </div>
          <div className="mt-5 pt-4 border-t border-rose-100/80 dark:border-rose-900/50 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Days since birth</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{age.totalDays} days</span>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4 bg-white dark:bg-gray-900">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Photos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{carouselPhotos.length}</p>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4 bg-white dark:bg-gray-900">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Milestones</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{events?.length ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <Wallet className="w-3.5 h-3.5" />
            <h2>Trust Vault / Balances</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-gray-100 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
            {balances.map(({ currency, balance }) => (
              <div key={currency} className="first:border-r border-gray-100 dark:border-gray-800 first:pr-4 last:pl-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">{currency}</p>
                <p className={`text-xl font-semibold tracking-tight ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(Math.abs(balance), currency)}
                </p>
                {balance < 0 && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded mt-1">
                    Deficit
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Photo Carousel */}
        {carouselPhotos.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <Camera className="w-3.5 h-3.5" />
              <h2>Recent Captures</h2>
            </div>

            <PhotoCarousel photos={carouselPhotos} />
          </section>
        )}

        {/* Timeline */}
        {events && events.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <h2>Timeline Highlights</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
              {events.map((event) => {
                const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-sm border border-gray-100/80 dark:border-gray-700">
                        {typeInfo?.emoji ?? '📝'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          <p>For {CHILD_NICKNAME} with love</p>
          <Link
            href="/login"
            className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium"
          >
            <LogIn className="w-3.5 h-3.5" />
            Dashboard login
          </Link>
        </footer>
      </main>
    </div>
  )
}
