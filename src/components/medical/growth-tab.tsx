'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Loader2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/utils/age'
import type { GrowthLog } from '@/types/medical'

const schema = z.object({
  log_date: z.string().min(1),
  weight_kg: z.string().optional(),
  height_cm: z.string().optional(),
  head_circumference_cm: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface GrowthTabProps {
  logs: GrowthLog[]
  onUpdate: (logs: GrowthLog[]) => void
  userId: string
}

export function GrowthTab({ logs, onUpdate, userId }: GrowthTabProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { log_date: new Date().toISOString().split('T')[0] },
  })
  const supabase = createClient()

  async function onSubmit(data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: log } = await supabase
      .from('growth_logs')
      .insert({
        log_date: data.log_date,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
        height_cm: data.height_cm ? Number(data.height_cm) : null,
        head_circumference_cm: data.head_circumference_cm ? Number(data.head_circumference_cm) : null,
        notes: data.notes || null,
        user_id: userId,
        child_id: userId,
      } as any)
      .select().single()
    if (log) onUpdate([...logs, log].sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()))
    reset(); setOpen(false)
  }

  const chartData = logs.map((l) => ({
    date: formatDate(l.log_date, 'MMM D'),
    weight: l.weight_kg,
    height: l.height_cm,
    head: l.head_circumference_cm,
  }))

  const latest = logs[logs.length - 1]

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--on-surface-muted)]">{logs.length} measurements</p>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Log growth</Button>
      </div>

      {latest && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Weight', value: latest.weight_kg, unit: 'kg', color: 'bg-[var(--primary-container)] text-[var(--primary)]' },
            { label: 'Height', value: latest.height_cm, unit: 'cm', color: 'bg-[var(--secondary-container)] text-[var(--secondary)]' },
            { label: 'Head', value: latest.head_circumference_cm, unit: 'cm', color: 'bg-[var(--tertiary-container)] text-[var(--tertiary)]' },
          ].map(({ label, value, unit, color }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-[var(--on-surface-muted)]">{label}</p>
                {value ? (
                  <>
                    <p className="text-xl font-bold text-[var(--on-surface)]">{value}</p>
                    <p className="text-xs text-[var(--on-surface-muted)]">{unit}</p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--on-surface-muted)]">—</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {logs.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Growth Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weight">
              <TabsList>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="height">Height</TabsTrigger>
              </TabsList>
              <TabsContent value="weight">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', fontSize: 12 }} />
                    <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="height">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', fontSize: 12 }} />
                    <Line type="monotone" dataKey="height" stroke="var(--secondary)" strokeWidth={2} dot={{ fill: 'var(--secondary)', r: 4 }} name="Height (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📏</div>
          <p className="text-sm text-[var(--on-surface-variant)]">No growth data yet</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log growth measurement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" {...register('log_date')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.01" placeholder="5.2" {...register('weight_kg')} />
              </div>
              <div className="space-y-1.5">
                <Label>Height (cm)</Label>
                <Input type="number" step="0.1" placeholder="60" {...register('height_cm')} />
              </div>
              <div className="space-y-1.5">
                <Label>Head (cm)</Label>
                <Input type="number" step="0.1" placeholder="38" {...register('head_circumference_cm')} />
              </div>
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
