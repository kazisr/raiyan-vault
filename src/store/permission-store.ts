import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { ALL_PERMISSIONS } from '@/types/permissions'
import type { UserProfile } from '@/types/permissions'

const ALL_TRUE = Object.fromEntries(ALL_PERMISSIONS.map((p) => [p, true]))

interface PermissionState {
  profile: UserProfile | null
  permissions: Record<string, boolean>
  loaded: boolean
  load: (userId: string) => Promise<void>
  reset: () => void
}

export const usePermissionStore = create<PermissionState>((set) => ({
  profile: null,
  permissions: {},
  loaded: false,

  load: async (userId: string) => {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      // No profile yet → treat as super admin (bootstrap / first setup)
      set({ loaded: true, profile: null, permissions: ALL_TRUE })
      return
    }

    // Dad always has every permission regardless of DB rows
    if (profile.role === 'Dad') {
      set({ loaded: true, profile: profile as UserProfile, permissions: ALL_TRUE })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabase as any)
      .from('role_permissions')
      .select('permission, granted')
      .eq('role', profile.role)

    const permissions = Object.fromEntries(
      (rows ?? []).map((r: { permission: string; granted: boolean }) => [r.permission, r.granted])
    )

    set({ loaded: true, profile: profile as UserProfile, permissions })
  },

  reset: () => set({ profile: null, permissions: {}, loaded: false }),
}))
