import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BlogClient } from './blog-client'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog' }

async function BlogData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <BlogClient posts={posts ?? []} userId={user.id} />
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}>
      <BlogData />
    </Suspense>
  )
}
