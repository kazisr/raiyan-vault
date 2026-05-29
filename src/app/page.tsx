#import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Heart, LogIn } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'
import AgeCounter from '@/components/baby/AgeCounter'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import { ThemeToggle } from '@/components/baby/ThemeToggle'
import { formatDate, calculateAge } from '@/utils/age'
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

export default async function HomePage() {
  const supabase = createPublicClient()

  const [{ data: photos }, { data: ledgerEntries }] = await Promise.all([
    supabase
      .from('photos')
      .select('id, storage_path, caption')
      .order('created_at', { ascending: false })
      .limit(12),
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

  const carouselPhotos = photosWithUrls
    .filter((p) => p.url !== null)
    .map((p) => ({ id: p.id, url: p.url!, caption: p.caption }))

  const age = calculateAge(CHILD_DOB)

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledgerEntries ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
      <main className="max-w-2xl mx-auto ">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {CHILD_NAME}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
        </header>

        {/* Age Counter */}
        <section className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 rounded-2xl p-8 border border-rose-100/60 dark:border-rose-900/30 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block mb-5">
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

        {/* Photo Carousel */}
        {carouselPhotos.length > 0 && (
          <section className="space-y-5">
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <PhotoCarousel photos={carouselPhotos} />
            </div>
          </section>
        )}

        {/* Balance & Ledger History */}
        <div className="space-y-10">
          <BalanceSection balances={balances} />
          <LedgerHistory entries={ledgerEntries ?? []} />
        </div>

        {/* Footer */}
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
