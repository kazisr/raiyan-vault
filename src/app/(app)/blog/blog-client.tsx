'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, Lock, Globe, Pencil, Trash2, Eye, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatRelative } from '@/utils/age'
import type { BlogPost } from '@/types/blog'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
})
type FormData = z.infer<typeof schema>

interface BlogClientProps {
  posts: BlogPost[]
  userId: string
}

export function BlogClient({ posts: initPosts, userId }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initPosts)
  const [editorOpen, setEditorOpen] = useState(false)
  const [viewPost, setViewPost] = useState<BlogPost | null>(null)
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { status: 'draft' },
  })
  const currentStatus = watch('status')
  const supabase = createClient()

  async function onSubmit(data: FormData) {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const payload = {
      title: data.title,
      content: data.content,
      tags,
      status: data.status,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      user_id: userId,
      child_id: userId,
    }

    if (editingPost) {
      await (supabase.from('blog_posts') as any).update(payload).eq('id', editingPost.id)
      const { data: updated } = await supabase
        .from('blog_posts').select('*').eq('id', editingPost.id).single() as { data: BlogPost | null }
      if (updated) setPosts((prev) => prev.map((p) => p.id === editingPost.id ? updated : p))
    } else {
      const { data: created } = await (supabase.from('blog_posts') as any)
        .insert(payload).select().single() as { data: BlogPost | null }
      if (created) setPosts((prev) => [created, ...prev])
    }

    reset(); setEditorOpen(false); setEditingPost(undefined)
  }

  async function deletePost(id: string) {
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    reset({
      title: post.title,
      content: post.content,
      tags: post.tags.join(', '),
      status: post.status,
    })
    setEditorOpen(true)
  }

  const published = posts.filter((p) => p.status === 'published')
  const drafts = posts.filter((p) => p.status === 'draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">Family Blog</h2>
          <p className="text-sm text-[var(--on-surface-muted)]">
            {published.length} published · {drafts.length} drafts
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditingPost(undefined); reset({ status: 'draft' }); setEditorOpen(true) }}>
          <Plus className="w-4 h-4" /> Write post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✍️</div>
          <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-1">No posts yet</h3>
          <p className="text-sm text-[var(--on-surface-variant)] mb-4">Start writing about Raiyan&apos;s life</p>
          <Button onClick={() => { reset({ status: 'draft' }); setEditorOpen(true) }}>
            <Plus className="w-4 h-4" /> Write first post
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="hover:shadow-[var(--shadow-2)] transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[var(--on-surface)] leading-tight">{post.title}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon-sm" onClick={() => setViewPost(post)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(post)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => deletePost(post.id)}
                            className="text-[var(--error)] hover:bg-[var(--error-container)]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--on-surface-variant)] mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={post.status === 'published' ? 'secondary' : 'outline'} className="text-xs">
                          {post.status === 'published' ? <Globe className="w-2.5 h-2.5 mr-1" /> : <Lock className="w-2.5 h-2.5 mr-1" />}
                          {post.status}
                        </Badge>
                        <span className="text-xs text-[var(--on-surface-muted)]">{formatRelative(post.created_at)}</span>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="surface" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit post' : 'Write new post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Raiyan's first smile..." {...register('title')} />
              {errors.title && <p className="text-xs text-[var(--error)]">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea
                rows={10}
                placeholder="Write your story here..."
                className="font-serif text-base leading-relaxed"
                {...register('content')}
              />
              {errors.content && <p className="text-xs text-[var(--error)]">{errors.content.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input placeholder="milestone, family, love (comma separated)" {...register('tags')} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--on-surface)]">Publish post</p>
                <p className="text-xs text-[var(--on-surface-muted)]">
                  {currentStatus === 'published' ? 'Will be published' : 'Save as draft'}
                </p>
              </div>
              <Switch
                checked={currentStatus === 'published'}
                onCheckedChange={(v) => setValue('status', v ? 'published' : 'draft')}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStatus === 'published' ? 'Publish' : 'Save draft'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewPost} onOpenChange={() => setViewPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewPost && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-2">
                  <DialogTitle className="flex-1 text-xl">{viewPost.title}</DialogTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={viewPost.status === 'published' ? 'secondary' : 'outline'}>
                    {viewPost.status}
                  </Badge>
                  <span className="text-xs text-[var(--on-surface-muted)]">{formatDate(viewPost.created_at)}</span>
                </div>
              </DialogHeader>
              <div className="prose max-w-none text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap font-serif">
                {viewPost.content}
              </div>
              {viewPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--outline-variant)]">
                  {viewPost.tags.map((tag) => (
                    <Badge key={tag} variant="surface">{tag}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
