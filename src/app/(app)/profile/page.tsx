import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProfileHeader } from '@/components/child/profile-header'
import { ProfileStats } from '@/components/child/profile-stats'
import { ProfileEditForm } from '@/components/child/profile-edit-form'
import { ProfilePhotoManager } from '@/components/baby/ProfilePhotoManager'
import { CHILD_DOB, CHILD_NAME } from '@/constants/child'
import { calculateAge } from '@/utils/age'
import type { Child } from '@/types/child'
import type { GrowthLog } from '@/types/medical'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, growthRes, vaultRes] = await Promise.all([
    supabase
      .from('child_profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),
    supabase
      .from('growth_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .limit(1),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('vault_settings')
      .select('profile_photo_path, cover_photo_path')
      .eq('id', 1)
      .maybeSingle(),
  ])

  const profile = profileRes.data as Child | null
  const growthLogs = growthRes.data as GrowthLog[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = vaultRes.data as any

  async function resolveUrl(path: string | null | undefined): Promise<string | null> {
    if (!path) return null
    const { data } = await admin.storage.from('photos').createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [initialProfileUrl, initialCoverUrl] = await Promise.all([
    resolveUrl(settings?.profile_photo_path),
    resolveUrl(settings?.cover_photo_path),
  ])

  const age = calculateAge(profile?.date_of_birth ?? CHILD_DOB)
  const latestGrowth = growthLogs?.[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile & Cover Photo manager */}
      <ProfilePhotoManager
        initialProfileUrl={initialProfileUrl}
        initialCoverUrl={initialCoverUrl}
        userId={user!.id}
      />

      <ProfileHeader
        name={profile?.name ?? CHILD_NAME}
        dob={profile?.date_of_birth ?? CHILD_DOB}
        age={age}
        avatarUrl={profile?.avatar_url ?? undefined}
        bloodGroup={profile?.blood_group ?? undefined}
      />

      <ProfileStats
        birthWeight={profile?.birth_weight_kg ?? undefined}
        birthHeight={profile?.birth_height_cm ?? undefined}
        currentWeight={latestGrowth?.weight_kg ?? undefined}
        currentHeight={latestGrowth?.height_cm ?? undefined}
        dob={profile?.date_of_birth ?? CHILD_DOB}
      />

      <ProfileEditForm profile={profile} userId={user!.id} />
    </div>
  )
}
