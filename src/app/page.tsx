import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { Heart, LogIn } from 'lucide-react'
import Link from 'next/link'
import { CHILD_NAME, CHILD_DOB, CHILD_NICKNAME } from '@/constants/child'
import { ThemeToggle } from '@/components/baby/ThemeToggle'
import { ProfileHeaderSection } from '@/components/baby/ProfileHeaderSection'
import { ProfileContent } from '@/components/baby/ProfileContent'
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
  const admin = createAdminClient()

  const [
    { data: photos },
    { data: ledgerEntries },
    { data: vaccines },
    { data: events },
    { count: visitCount },
    { count: blogCount },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { data: vaultSettings },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('vault_settings')
      .select('profile_photo_path, cover_photo_path')
      .eq('id', 1)
      .maybeSingle(),
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
    .map((p) => ({ id: p.id, url: p.url!, caption: p.caption, storage_path: p.storage_path }))

  // Resolve profile/cover from vault_settings, falling back to first carousel photo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = vaultSettings as any

  async function resolveUrl(path: string | null | undefined): Promise<string | null> {
    if (!path) return null
    // Try from carousel first (already signed)
    const cached = carouselPhotos.find((p) => p.storage_path === path)
    if (cached) return cached.url
    // Generate a new signed URL for this path
    const { data } = await admin.storage.from('photos').createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [initialProfileUrl, initialCoverUrl] = await Promise.all([
    resolveUrl(settings?.profile_photo_path),
    resolveUrl(settings?.cover_photo_path),
  ])

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
        <ProfileHeaderSection
          initialCoverUrl={initialCoverUrl ?? carouselPhotos[0]?.url ?? null}
          initialProfileUrl={initialProfileUrl ?? carouselPhotos[0]?.url ?? null}
          allPhotos={carouselPhotos}
          childName={CHILD_NAME}
          childDob={CHILD_DOB}
          childNickname={CHILD_NICKNAME}
          photoCount={photoCount}
          vaccineCount={vaccineCount}
          visitCount={totalVisits}
          postCount={totalPosts}
        />

        <ProfileContent
          carouselPhotos={carouselPhotos}
          vaccines={vaccines ?? []}
          events={events ?? []}
          balances={balances}
          ledgerEntries={ledgerEntries ?? []}
          childName={CHILD_NAME}
          childNickname={CHILD_NICKNAME}
          photoCount={photoCount}
          vaccineCount={vaccineCount}
          visitCount={totalVisits}
          postCount={totalPosts}
        />
      </div>
    </div>
  )
}
