import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LedgerClient } from './ledger-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ledger' }

async function LedgerData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  return <LedgerClient entries={entries ?? []} userId={user.id} />
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
      <LedgerData />
    </Suspense>
  )
}
