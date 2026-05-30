'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireDad() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile && profile.role !== 'Dad') throw new Error('Only Dad can perform this action')

  return user
}

export async function updateOwnProfileAction(data: {
  name: string
  username: string
  role: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Read existing profile to determine current role (non-Dad cannot self-elevate)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isDad = !existing || existing.role === 'Dad'
  // Non-Dad users keep their current role; only Dad can set/change role
  const safeRole = isDad ? data.role : (existing?.role ?? 'Other')

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('user_profiles').upsert(
    {
      user_id: user.id,
      name: data.name,
      username: data.username.toLowerCase(),
      email: user.email!,
      role: safeRole,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    if (error.code === '23505') throw new Error('USERNAME_TAKEN')
    throw new Error(error.message)
  }

  return { success: true, role: safeRole }
}

export async function createUserAction(data: {
  email: string
  password: string
  name: string
  username: string
  role: string
}) {
  const caller = await requireDad()
  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })
  if (authError || !authData.user) throw new Error(authError?.message ?? 'Failed to create user')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (admin as any).from('user_profiles').insert({
    user_id: authData.user.id,
    name: data.name,
    username: data.username,
    email: data.email,
    role: data.role,
    created_by: caller.id,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    throw new Error('Failed to create user profile: ' + profileError.message)
  }

  return { success: true }
}

export async function deleteUserAction(userId: string) {
  const caller = await requireDad()
  if (userId === caller.id) throw new Error('Cannot delete your own account')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  return { success: true }
}

export async function updateUserRoleAction(userId: string, role: string) {
  await requireDad()
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function updateRolePermissionsAction(
  role: string,
  permissions: Record<string, boolean>,
) {
  const caller = await requireDad()
  if (role === 'Dad') throw new Error('Cannot modify Dad permissions')

  const admin = createAdminClient()
  const upserts = Object.entries(permissions).map(([permission, granted]) => ({
    role,
    permission,
    granted,
    updated_by: caller.id,
    updated_at: new Date().toISOString(),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('role_permissions')
    .upsert(upserts, { onConflict: 'role,permission' })

  if (error) throw new Error(error.message)
  return { success: true }
}
