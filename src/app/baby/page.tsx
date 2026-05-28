import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Heart, Camera, Star, Calendar, LogIn, Wallet, ArrowUpRight } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME, EVENT_TYPES } from '@/constants/child'
import AgeCounter from './AgeCounter'
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] antialiased selection:bg-slate-100">
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        
        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {CHILD_NAME}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </header>

        {/* Age Counter Hero */}
        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 block mb-2">
            Current Age
          </span>
          <div className="text-gray-900 font-medium">
            <AgeCounter dob={CHILD_DOB} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200/60 flex justify-between items-center text-xs text-gray-500">
            <span>Days since birth</span>
            <span className="font-semibold text-gray-700">{age.totalDays} days</span>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Photos</p>
              <p className="text-lg font-semibold text-gray-900">{photosWithUrls.length}</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Milestones</p>
              <p className="text-lg font-semibold text-gray-900">{events?.length ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Wallet className="w-3.5 h-3.5" />
            <h2>Trust Vault / Balances</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border border-gray-100 rounded-xl p-5 bg-white">
            {balances.map(({ currency, balance }) => (
              <div key={currency} className="first:border-r border-gray-100 first:pr-4 last:pl-4">
                <p className="text-xs text-gray-400 font-medium mb-1">{currency}</p>
                <p className={`text-xl font-semibold tracking-tight ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(Math.abs(balance), currency)}
                </p>
                {balance < 0 && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-600 rounded mt-1">
                    Deficit
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Photo Gallery Grid */}
        {photosWithUrls.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Camera className="w-3.5 h-3.5" />
              <h2>Recent Captures</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photosWithUrls.map((photo) =>
                photo.url ? (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-100"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption ?? 'Photo'}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Timeline / Recent Memories */}
        {events && events.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <h2>Timeline Highlights</h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
              {events.map((event) => {
                const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm border border-gray-100/80">
                        {typeInfo?.emoji ?? '📝'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Minimal Footer */}
        <footer className="flex items-center justify-between pt-6 border-t border-gray-100 text-xs text-gray-400">
          <p>For {CHILD_NICKNAME} with love</p>
          <Link
            href="/login"
            className="flex items-center gap-1 hover:text-gray-600 transition-colors font-medium"
          >
            <LogIn className="w-3.5 h-3.5" />
            Dashboard login
          </Link>
        </footer>
      </main>
    </div>
  )
}
