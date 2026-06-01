import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/child/profile-header'
import { ProfileStats } from '@/components/child/profile-stats'
import { ProfileEditForm } from '@/components/child/profile-edit-form'
import { CHILD_DOB, CHILD_NAME } from '@/constants/child'
import { calculateAge } from '@/utils/age'
import type { Child } from '@/types/child'
import type { GrowthLog } from '@/types/medical'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('child_profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single() as { data: Child | null }

  const { data: growthLogs } = await supabase
    .from('growth_logs')
    .select('*')
    .order('log_date', { ascending: false })
    .limit(1) as { data: GrowthLog[] | null }

  const age = calculateAge(profile?.date_of_birth ?? CHILD_DOB)
  const latestGrowth = growthLogs?.[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
