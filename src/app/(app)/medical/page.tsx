import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MedicalClient } from './medical-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Medical' }

async function MedicalData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [vaccines, visits, growthLogs] = await Promise.all([
    supabase.from('vaccines').select('*').order('administered_date', { ascending: false }),
    supabase.from('doctor_visits').select('*').order('visit_date', { ascending: false }),
    supabase.from('growth_logs').select('*').order('log_date', { ascending: true }),
  ])

  return (
    <MedicalClient
      vaccines={vaccines.data ?? []}
      visits={visits.data ?? []}
      growthLogs={growthLogs.data ?? []}
      userId={user.id}
    />
  )
}

export default function MedicalPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
      <MedicalData />
    </Suspense>
  )
}
