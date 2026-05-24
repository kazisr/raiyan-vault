'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Stethoscope, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/utils/age'
import type { DoctorVisit } from '@/types/medical'

const schema = z.object({
  doctor_name: z.string().min(1, 'Required'),
  hospital: z.string().optional(),
  visit_date: z.string().min(1, 'Required'),
  diagnosis: z.string().optional(),
  cost: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface DoctorVisitTabProps {
  visits: DoctorVisit[]
  onUpdate: (visits: DoctorVisit[]) => void
  userId: string
}

export function DoctorVisitTab({ visits, onUpdate, userId }: DoctorVisitTabProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { visit_date: new Date().toISOString().split('T')[0] },
  })
  const supabase = createClient()

  async function onSubmit(data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: v } = await supabase
      .from('doctor_visits')
      .insert({ ...data, cost: data.cost ? Number(data.cost) : null, user_id: userId, child_id: userId } as any)
      .select().single()
    if (v) onUpdate([v, ...visits])
    reset(); setOpen(false)
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--on-surface-muted)]">{visits.length} visits recorded</p>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add visit</Button>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏥</div>
          <p className="text-sm text-[var(--on-surface-variant)]">No doctor visits recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--tertiary-container)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4 text-[var(--tertiary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{v.doctor_name}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--on-surface-muted)] mt-0.5">
                      <span>{formatDate(v.visit_date)}</span>
                      {v.hospital && <span>· {v.hospital}</span>}
                      {v.cost && <span>· ¥{v.cost.toLocaleString()}</span>}
                    </div>
                    {v.diagnosis && <p className="text-xs text-[var(--on-surface-variant)] mt-1.5 italic">{v.diagnosis}</p>}
                    {v.notes && <p className="text-xs text-[var(--on-surface-muted)] mt-1">{v.notes}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add doctor visit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Doctor name *</Label>
              <Input placeholder="Dr. Yamamoto" {...register('doctor_name')} />
              {errors.doctor_name && <p className="text-xs text-[var(--error)]">{errors.doctor_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hospital</Label>
                <Input placeholder="Tokyo Hospital" {...register('hospital')} />
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" {...register('visit_date')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Diagnosis</Label>
              <Input placeholder="Routine checkup, Fever..." {...register('diagnosis')} />
            </div>
            <div className="space-y-1.5">
              <Label>Cost (¥)</Label>
              <Input type="number" placeholder="3000" {...register('cost')} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} {...register('notes')} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
