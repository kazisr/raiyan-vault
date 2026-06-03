import type { ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import {
  Heart,
  Camera,
  Syringe,
  Stethoscope,
  BookOpen,
  Calendar,
  MapPin,
} from 'lucide-react'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME, EVENT_TYPES } from '@/constants/child'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import { ThemeToggle } from '@/components/baby/ThemeToggle'
import { ProfileHeaderSection } from '@/components/baby/ProfileHeaderSection'
import { ShareButton } from '@/components/baby/ShareButton'
import { formatDate } from '@/utils/age'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
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

  // Check if the current visitor is logged in and has upload_pictures permission
  let canEditPhotos = false
  try {
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (profile?.role === 'Dad') {
        canEditPhotos = true
      } else if (profile) {
        const { data: perm } = await supabase
          .from('role_permissions')
          .select('granted')
          .eq('role', profile.role)
          .eq('permission', 'upload_pictures')
          .single()
        canEditPhotos = perm?.granted === true
      }
    }
  } catch {}

  const [
    { data: photos },
    { data: ledgerEntries },
    { data: vaccines },
    { data: events },
    { count: visitCount },
    { count: blogCount },
  ] = await Promise.all([
    supabase
      .from('photos')
      .select('id, storage_path, caption')
      .eq('is_featured', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('ledger_entries')
      .select('id, amount, type, currency, category, description, entry_date, source_person')
      .order('entry_date', { ascending: false }),
    supabase.from('vaccines').select('*').order('administered_date', { ascending: false }),
    supabase.from('events').select('*').order('event_date', { ascending: false }).limit(5),
    supabase.from('doctor_visits').select('id', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
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

  const balances = (['BDT', 'JPY'] as const).map((currency) => {
    const rows = (ledgerEntries ?? []).filter((e) => e.currency === currency)
    const income = rows.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { currency, balance: income - expense }
  })

  const photoCount = carouselPhotos.length
  const vaccineCount = (vaccines ?? []).length
  const totalVisits = visitCount ?? 0
  const totalPosts = blogCount ?? 0

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#1877F2] h-14 shadow-md">
        <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block tracking-tight">
              {CHILD_NICKNAME}&apos;s Vault
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" />
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-md bg-white text-[#1877F2] hover:bg-blue-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto">

        {/* ── Cover + Profile Info (client component handles lightbox & selector) ── */}
        <ProfileHeaderSection
          initialCoverUrl={carouselPhotos[0]?.url ?? null}
          initialProfileUrl={carouselPhotos[0]?.url ?? null}
          allPhotos={carouselPhotos}
          canEdit={canEditPhotos}
          childName={CHILD_NAME}
          childDob={CHILD_DOB}
          childNickname={CHILD_NICKNAME}
          photoCount={photoCount}
          vaccineCount={vaccineCount}
          visitCount={totalVisits}
          postCount={totalPosts}
        />

        {/* ── Tab Navigation — All · Photos · Reels ── */}
        <div className="bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#3A3B3C] sticky top-14 z-40 shadow-sm">
          <div className="max-w-[940px] mx-auto px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex">
              {(['All', 'Photos', 'Reels'] as const).map((tab) => (
                <button
                  key={tab}
                  className={[
                    'px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] transition-colors mr-1',
                    tab === 'All'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-t-md',
                  ].join(' ')}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="max-w-[940px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <div className="space-y-3">

              {/* Intro Card */}
              <div className="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C]">
                <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB] mb-4">Intro</h2>
                <div className="space-y-3">
                  {[
                    { Icon: Calendar, text: `Born on ${formatDate(CHILD_DOB, 'MMMM D, YYYY')}` },
                    { Icon: MapPin, text: 'Dhaka, Bangladesh' },
                    { Icon: Heart, text: 'Cherished by family', iconClass: 'text-rose-500' },
                    { Icon: Camera, text: `${photoCount} featured photo${photoCount !== 1 ? 's' : ''}` },
                    { Icon: Syringe, text: `${vaccineCount} vaccine${vaccineCount !== 1 ? 's' : ''} administered` },
                    { Icon: Stethoscope, text: `${totalVisits} doctor visit${totalVisits !== 1 ? 's' : ''}` },
                    { Icon: BookOpen, text: `${totalPosts} blog post${totalPosts !== 1 ? 's' : ''}` },
                  ].map(({ Icon, text, iconClass }) => (
                    <div key={text} className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 text-[#65676B] dark:text-[#B0B3B8] ${iconClass ?? ''}`}
                      />
                      <span className="text-sm text-[#050505] dark:text-[#E4E6EB]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Grid Card */}
              {carouselPhotos.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">Photos</h2>
                    <span className="text-sm font-semibold text-[#1877F2]">{photoCount} total</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                    {carouselPhotos.slice(0, 9).map((p, i) => (
                      <div
                        key={p.id}
                        className="aspect-square overflow-hidden bg-[#F0F2F5] dark:bg-[#3A3B3C]"
                      >
                        <img
                          src={p.url}
                          alt={p.caption ?? `Photo ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaccine Reminders */}
              <VaccineReminder vaccines={vaccines ?? []} readOnly />
            </div>

            {/* ── RIGHT FEED ── */}
            <div className="space-y-3">

              {/* Age Counter — standalone, no FeedCard wrapper */}
              <AgeCounter />

              {/* Featured Photos */}
              {carouselPhotos.length > 0 && (
                <FeedCard
                  profilePhotoUrl={carouselPhotos[0]?.url ?? null}
                  title={CHILD_NICKNAME}
                  subtitle="added new photos"
                >
                  <PhotoCarousel photos={carouselPhotos} />
                </FeedCard>
              )}

              {/* Recent Memories */}
              {(events ?? []).length > 0 && (
                <FeedCard
                  profilePhotoUrl={carouselPhotos[0]?.url ?? null}
                  title={CHILD_NICKNAME}
                  subtitle="Recent Memories"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {(events ?? []).slice(0, 4).map((event) => {
                      const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
                      return (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F0F2F5] dark:bg-[#3A3B3C] flex items-center justify-center flex-shrink-0 text-lg select-none">
                            {typeInfo?.emoji ?? '📝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#050505] dark:text-[#E4E6EB] truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
                              {formatDate(event.event_date)}
                            </p>
                          </div>
                          {event.tags.length > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E7F3FF] dark:bg-[#263951] text-[#1877F2] flex-shrink-0">
                              {event.tags[0]}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </FeedCard>
              )}

              {/* Family Fund */}
              <FeedCard
                profilePhotoUrl={carouselPhotos[0]?.url ?? null}
                title={CHILD_NICKNAME}
                subtitle="Family Fund"
              >
                <div className="px-4 pb-4">
                  <BalanceSection balances={balances} />
                </div>
              </FeedCard>

              {/* Ledger History */}
              {(ledgerEntries ?? []).length > 0 && (
                <FeedCard
                  profilePhotoUrl={carouselPhotos[0]?.url ?? null}
                  title={CHILD_NICKNAME}
                  subtitle="Ledger History"
                >
                  <div className="px-4 pb-4">
                    <LedgerHistory entries={ledgerEntries ?? []} />
                  </div>
                </FeedCard>
              )}
            </div>
          </div>
        </div>

        <footer className="max-w-[940px] mx-auto px-4 pb-8 mt-2 text-center">
          <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
            For {CHILD_NICKNAME} with love ❤️
          </p>
        </footer>
      </div>
    </div>
  )
}

// ── FeedCard — post wrapper with Share-only reactions ─────────────────

function FeedCard({
  profilePhotoUrl,
  title,
  subtitle,
  children,
}: {
  profilePhotoUrl: string | null
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C] overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1877F2] overflow-hidden flex-shrink-0">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg select-none">
              👶
            </div>
          )}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#050505] dark:text-[#E4E6EB] leading-tight">
            {title}
          </p>
          <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">{subtitle}</p>
        </div>
      </div>

      {/* Post body */}
      {children}

      {/* Share-only reactions bar */}
      <div className="px-4 py-2 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center">
        <ShareButton />
      </div>
    </div>
  )
}
