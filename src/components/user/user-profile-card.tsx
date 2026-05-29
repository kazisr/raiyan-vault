'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

const ROLES = ['Dad', 'Mom', 'Guardian', 'Grandparent', 'Other'] as const

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  role: z.string().min(1, 'Role is required'),
})

type FormData = z.infer<typeof schema>

export function UserProfileCard() {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', username: '', role: '' },
  })

  const roleValue = watch('role')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata ?? {}
        reset({
          name: meta.name ?? '',
          username: meta.username ?? '',
          role: meta.role ?? '',
        })
        setEmail(user.email ?? '')
      }
      setLoading(false)
    })
  }, [reset])

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { name: data.name, username: data.username, role: data.role },
    })
    if (error) {
      toast.error('Failed to save profile')
      return
    }
    toast.success('Profile saved!')
    setEditing(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--on-surface-muted)]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />My Profile
            </CardTitle>
            <CardDescription className="mt-0.5">{email}</CardDescription>
          </div>
          {!editing && (
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input placeholder="Raiyan's Dad" {...register('name')} disabled={!editing} />
              {errors.name && (
                <p className="text-xs text-[var(--error)]">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input placeholder="raiyan_dad" {...register('username')} disabled={!editing} />
              {errors.username && (
                <p className="text-xs text-[var(--error)]">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={roleValue}
              onValueChange={(v) => setValue('role', v)}
              disabled={!editing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-[var(--error)]">{errors.role.message}</p>
            )}
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
