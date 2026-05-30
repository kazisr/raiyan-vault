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
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import { usePermissionStore } from '@/store/permission-store'
import { updateOwnProfileAction } from '@/app/actions/user-actions'
import { ROLES } from '@/types/permissions'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(32, 'Too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  role: z.string().min(1, 'Role is required'),
})

type FormData = z.infer<typeof schema>

const ROLE_COLORS: Record<string, string> = {
  Dad:         'bg-[var(--primary-container)] text-[var(--primary)]',
  Mom:         'bg-[var(--secondary-container)] text-[var(--secondary)]',
  Guardian:    'bg-[var(--tertiary-container)] text-[var(--tertiary)]',
  Grandparent: 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
  Other:       'bg-[var(--surface-container)] text-[var(--on-surface-muted)]',
}

export function UserProfileCard() {
  const [editing, setEditing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const { hasPermission, loaded: permLoaded } = usePermissions()
  const { load } = usePermissionStore()

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
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setPageLoading(false); return }
      setEmail(user.email ?? '')
      setUserId(user.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('user_profiles')
        .select('name, username, role')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        reset({ name: profile.name, username: profile.username, role: profile.role })
        // Open edit mode if profile is incomplete
        if (!profile.name || !profile.username) setEditing(true)
      } else {
        setEditing(true)
      }
      setPageLoading(false)
    })
  }, [reset])

  async function onSubmit(data: FormData) {
    try {
      await updateOwnProfileAction(data)
      await load(userId)
      toast.success('Profile saved!')
      setEditing(false)
    } catch (e: unknown) {
      const msg = (e as Error).message
      if (msg === 'USERNAME_TAKEN') toast.error('Username already taken')
      else if (msg === 'Not authenticated') toast.error('Please sign in again')
      else toast.error('Failed to save profile')
    }
  }

  if (pageLoading || !permLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--on-surface-muted)]" />
        </CardContent>
      </Card>
    )
  }

  const isAdmin = hasPermission('manage_users')

  // Read-only view for non-admin users
  if (!isAdmin && !editing) {
    const nameVal = watch('name')
    const usernameVal = watch('username')
    const roleVal = watch('role')
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />My Profile
          </CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--on-surface-muted)] mb-0.5">Name</p>
                <p className="text-sm font-medium text-[var(--on-surface)]">{nameVal || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--on-surface-muted)] mb-0.5">Username</p>
                <p className="text-sm font-medium text-[var(--on-surface)]">{usernameVal ? `@${usernameVal}` : '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-muted)] mb-1">Role</p>
              {roleVal ? (
                <Badge className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 ${ROLE_COLORS[roleVal] ?? ''}`}>
                  {roleVal}
                </Badge>
              ) : <p className="text-sm text-[var(--on-surface-muted)]">—</p>}
            </div>
          </div>
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
          {isAdmin && !editing && (
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
              <Input placeholder="Raiyan's Dad" {...register('name')} />
              {errors.name && <p className="text-xs text-[var(--error)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input placeholder="raiyan_dad" {...register('username')} />
              {errors.username && <p className="text-xs text-[var(--error)]">{errors.username.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(v) => setValue('role', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-[var(--error)]">{errors.role.message}</p>}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </Button>
            {isAdmin && (
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
