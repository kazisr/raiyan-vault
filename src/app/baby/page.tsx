import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Heart, Camera, Star, Calendar, LogIn, Wallet } from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME, EVENT_TYPES } from '@/constants/child'
import AgeCounter from './AgeCounter'
import { formatDate } from '@/utils/age'
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

  // Generate signed URLs server-side (1 hour expiry)
  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from('photos')
        .createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )

  const balances = (['JPY', 'BDT'] as const).map((currency) => {
    const rows = (ledgerEntries ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  return (
<div className="min-h-screen bg-gradient-to-br from-[#EEF4FB] via-[#F9F4EE] to-[#EEF4FB]">
  {/* Header */}
  <header className="flex flex-col items-center justify-center text-center py-12 px-6">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#5B7FA6] to-[#7B9EC0] mb-4 shadow-lg">
      <Heart className="w-9 h-9 text-white" />
    </div>

    <h1 className="text-3xl sm:text-4xl font-bold text-[#1A3A5C] mt-2">
      {CHILD_NAME}
    </h1>

    <p className="text-sm text-[#5B7FA6] mt-1 font-medium tracking-wide uppercase">
      Born {formatDate(CHILD_DOB, 'MMMM D, YYYY')}
    </p>
  </header>

  <main className="max-w-2xl mx-auto w-full px-4 pb-16 space-y-6">
    {/* Age card */}
    <div className="rounded-2xl bg-gradient-to-br from-[#5B7FA6] to-[#7B9EC0] p-6 text-white shadow-md">
      <AgeCounter dob={CHILD_DOB} nickname={CHILD_NICKNAME} />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm flex items-center justify-center gap-4 text-center">
        <div className="w-11 h-11 rounded-xl bg-[#D6E4F5] flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-[#5B7FA6]" />
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-[#1A3A5C]">
            {photosWithUrls.length}
          </p>

          <p className="text-xs text-[#5B7FA6] font-medium">
            Photos
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm flex items-center justify-center gap-4 text-center">
        <div className="w-11 h-11 rounded-xl bg-[#D6E4F5] flex items-center justify-center flex-shrink-0">
          <Star className="w-5 h-5 text-[#5B7FA6]" />
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-[#1A3A5C]">
            {events?.length ?? 0}
          </p>

          <p className="text-xs text-[#5B7FA6] font-medium">
            Milestones
          </p>
        </div>
      </div>
    </div>

    {/* Ledger balance */}
    <div className="rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-[#5B7FA6]" />

        <h2 className="text-sm font-semibold text-[#1A3A5C] uppercase tracking-wide">
          Balance
        </h2>
      </div>

      <div className="flex items-center justify-center gap-8 flex-wrap text-center">
        {balances.map(({ currency, balance }) => (
          <div key={currency}>
            <p className="text-xs text-[#5B7FA6] font-medium mb-1">
              {currency}
            </p>

            <p
              className={`text-2xl font-bold ${
                balance >= 0
                  ? 'text-[#3a7d44]'
                  : 'text-[#c0392b]'
              }`}
            >
              {formatCurrency(Math.abs(balance), currency)}
            </p>

            {balance < 0 && (
              <p className="text-xs text-[#c0392b] mt-0.5">
                deficit
              </p>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Photo grid */}
    {photosWithUrls.length > 0 && (
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-5 pt-5 pb-3">
          <Camera className="w-4 h-4 text-[#5B7FA6]" />

          <h2 className="text-sm font-semibold text-[#1A3A5C] uppercase tracking-wide">
            Photos
          </h2>
        </div>

        <div className="columns-2 sm:columns-3 gap-1 p-1">
          {photosWithUrls.map((photo) =>
            photo.url ? (
              <div
                key={photo.id}
                className="break-inside-avoid mb-1 overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? 'Photo'}
                  className="w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    )}

    {/* Recent events */}
    {events && events.length > 0 && (
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-5 pt-5 pb-3">
          <Calendar className="w-4 h-4 text-[#5B7FA6]" />

          <h2 className="text-sm font-semibold text-[#1A3A5C] uppercase tracking-wide">
            Recent Memories
          </h2>
        </div>

        <ul className="divide-y divide-[#EDE7E0]">
          {events.map((event) => {
            const typeInfo = EVENT_TYPES.find(
              (t) => t.value === event.event_type
            )

            return (
              <li
                key={event.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <span className="text-xl flex-shrink-0">
                  {typeInfo?.emoji ?? '📝'}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A3A5C] truncate">
                    {event.title}
                  </p>

                  <p className="text-xs text-[#5B7FA6] mt-0.5">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )}

    {/* Footer */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-center sm:text-left">
      <p className="text-xs text-[#5B7FA6]/60">
        Made with ♥ for {CHILD_NICKNAME}
      </p>

      <Link
        href="/login"
        className="flex items-center gap-1.5 text-xs text-[#5B7FA6]/60 hover:text-[#5B7FA6] transition-colors"
      >
        <LogIn className="w-3.5 h-3.5" />
        Family login
      </Link>
    </div>
  </main>
</div>
  )
}
