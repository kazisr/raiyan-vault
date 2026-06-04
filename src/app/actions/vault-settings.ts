'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function setVaultPhoto(
  type: 'profile' | 'cover',
  photoId: string,
  storagePath: string,
): Promise<{ error: string | null }> {
  const admin = createAdminClient()
  const update =
    type === 'profile'
      ? { profile_photo_id: photoId, profile_photo_path: storagePath }
      : { cover_photo_id: photoId, cover_photo_path: storagePath }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('vault_settings')
    .upsert({ id: 1, ...update, updated_at: new Date().toISOString() })

  return { error: error?.message ?? null }
}
