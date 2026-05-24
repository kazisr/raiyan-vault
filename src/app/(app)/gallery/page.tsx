import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { GalleryClient } from './gallery-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gallery' }

async function GalleryData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <GalleryClient albums={albums ?? []} photos={photos ?? []} userId={user.id} />
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-[var(--radius-lg)]" />
        ))}
      </div>
    }>
      <GalleryData />
    </Suspense>
  )
}
