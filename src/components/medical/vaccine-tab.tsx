'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, isUpcoming, isPast } from '@/utils/age'
import type { Vaccine } from '@/types/medical'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  dose: z.string().optional(),
  administered_date: z.string().min(1, 'Required'),
  next_due_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface VaccineTabProps {
  vaccines: Vaccine[]
  onUpdate: (vaccines: Vaccine[]) => void
  userId: string
}

export function VaccineTab({ vaccines, onUpdate, userId }: VaccineTabProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { administered_date: new Date().toISOString().split('T')[0] },
  })

  const supabase = createClient()

  async function onSubmit(data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: v, error } = await supabase
      .from('vaccines')
      .insert({ ...data, user_id: userId, child_id: userId } as any)
      .select()
      .single()
    if (error) { toast.error('Failed to add vaccine'); return }
    onUpdate([v!, ...vaccines])
    toast.success('Vaccine added!')
    reset()
    setOpen(false)
  }

  const upcoming = vaccines.filter((v) => v.next_due_date && isUpcoming(v.next_due_date, 60))
  const overdue = vaccines.filter((v) => v.next_due_date && isPast(v.next_due_date))
  const completed = vaccines.filter((v) => !v.next_due_date || (!isUpcoming(v.next_due_date, 60) && !isPast(v.next_due_date)))

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Badge variant="secondary">{vaccines.length} recorded</Badge>
          {overdue.length > 0 && <Badge variant="error">{overdue.length} overdue</Badge>}
          {upcoming.length > 0 && <Badge variant="default">{upcoming.length} upcoming</Badge>}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add vaccine
        </Button>
      </div>

      {vaccines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💉</div>
          <p className="text-sm text-[var(--on-surface-variant)]">No vaccines recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vaccines.map((v) => {
            const isOverdue = v.next_due_date && isPast(v.next_due_date)
            const isNext = v.next_due_date && isUpcoming(v.next_due_date, 60)
            return (
              <Card key={v.id}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? 'bg-[var(--error-container)]' : isNext ? 'bg-[var(--primary-container)]' : 'bg-[var(--secondary-container)]'
                    }`}>
                      {isOverdue ? (
                        <AlertCircle className="w-4 h-4 text-[var(--error)]" />
                      ) : isNext ? (
                        <Clock className="w-4 h-4 text-[var(--primary)]" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[var(--secondary)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--on-surface)]">{v.name}</p>
                        {v.dose && <span className="text-xs text-[var(--on-surface-muted)]">{v.dose}</span>}
                      </div>
                      <p className="text-xs text-[var(--on-surface-muted)]">
                        Given: {formatDate(v.administered_date)}
                        {v.next_due_date && ` · Next: ${formatDate(v.next_due_date)}`}
                      </p>
                    </div>
                    {isOverdue && <Badge variant="error">Overdue</Badge>}
                    {isNext && !isOverdue && <Badge variant="default">Soon</Badge>}
                  </div>
                  {v.notes && <p className="text-xs text-[var(--on-surface-muted)] mt-1.5 pl-11">{v.notes}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add vaccine</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Vaccine name *</Label>
              <Input placeholder="BCG, MMR, OPV..." {...register('name')} />
              {errors.name && <p className="text-xs text-[var(--error)]">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dose</Label>
                <Input placeholder="1st, 2nd, Booster" {...register('dose')} />
              </div>
              <div className="space-y-1.5">
                <Label>Date given *</Label>
                <Input type="date" {...register('administered_date')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Next due date</Label>
              <Input type="date" {...register('next_due_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} placeholder="Reactions, clinic notes..." {...register('notes')} />
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
