import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LedgerClient } from './ledger-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ledger' }

async function LedgerData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isDad = !profile || profile.role === 'Dad'

  let canView = isDad
  let canAdd = isDad
  let canEdit = isDad
  let canDelete = isDad

  if (!isDad) {
    const { data: perms } = await admin
      .from('role_permissions')
      .select('permission, granted')
      .eq('role', profile.role)
      .in('permission', ['view_ledger', 'add_ledger', 'edit_ledger', 'delete_ledger'])

    const permMap: Record<string, boolean> = Object.fromEntries(
      (perms ?? []).map((p: { permission: string; granted: boolean }) => [p.permission, p.granted])
    )
    canView   = permMap['view_ledger']   === true
    canAdd    = permMap['add_ledger']    === true
    canEdit   = permMap['edit_ledger']   === true
    canDelete = permMap['delete_ledger'] === true
  }

  if (!canView) redirect('/dashboard')

  const { data: entries } = await admin
    .from('ledger_entries')
    .select('*')
    .order('entry_date', { ascending: false })

  return (
    <LedgerClient
      entries={entries ?? []}
      userId={user.id}
      canAdd={canAdd}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
      <LedgerData />
    </Suspense>
  )
}
