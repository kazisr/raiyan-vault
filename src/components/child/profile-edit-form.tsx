'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BLOOD_GROUPS } from '@/constants/child'
import type { Child } from '@/types/child'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  date_of_birth: z.string(),
  blood_group: z.string().optional(),
  birth_weight_kg: z.string().optional(),
  birth_height_cm: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProfileEditFormProps {
  profile: Child | null
  userId: string
}

export function ProfileEditForm({ profile, userId }: ProfileEditFormProps) {
  const [editing, setEditing] = useState(!profile)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: profile?.name ?? '',
      date_of_birth: profile?.date_of_birth ?? '2026-05-17',
      blood_group: profile?.blood_group ?? '',
      birth_weight_kg: profile?.birth_weight_kg != null ? String(profile.birth_weight_kg) : '',
      birth_height_cm: profile?.birth_height_cm != null ? String(profile.birth_height_cm) : '',
      notes: profile?.notes ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    const payload = {
      name: data.name,
      date_of_birth: data.date_of_birth,
      blood_group: data.blood_group || null,
      birth_weight_kg: data.birth_weight_kg ? Number(data.birth_weight_kg) : null,
      birth_height_cm: data.birth_height_cm ? Number(data.birth_height_cm) : null,
      notes: data.notes || null,
      user_id: userId,
    }

    let error
    if (profile) {
      ({ error } = await (supabase.from('child_profiles') as any).update(payload).eq('id', profile.id))
    } else {
      ({ error } = await (supabase.from('child_profiles') as any).insert(payload))
    }
    if (error) { toast.error('Failed to save profile'); return }
    toast.success('Profile saved!')
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
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
              <Label>Full name</Label>
              <Input {...register('name')} disabled={!editing} />
              {errors.name && <p className="text-xs text-[var(--error)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Date of birth</Label>
              <Input type="date" {...register('date_of_birth')} disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Blood group</Label>
              <Select
                defaultValue={profile?.blood_group ?? ''}
                onValueChange={(v) => setValue('blood_group', v)}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Birth weight (kg)</Label>
              <Input type="number" step="0.01" placeholder="3.2" {...register('birth_weight_kg')} disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Birth height (cm)</Label>
              <Input type="number" step="0.1" placeholder="50" {...register('birth_height_cm')} disabled={!editing} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Any notes about the child..." {...register('notes')} disabled={!editing} />
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save profile
              </Button>
              {profile && (
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
