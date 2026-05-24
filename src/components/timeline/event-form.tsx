'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENT_TYPES, EVENT_MOODS } from '@/constants/child'
import type { EventWithImages } from '@/types/events'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Date is required'),
  event_type: z.string().min(1),
  mood: z.string().optional(),
  location: z.string().optional(),
  tags: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export type EventFormSubmit = Omit<FormData, 'tags'> & { tags: string[] }

interface EventFormProps {
  event?: EventWithImages
  onSubmit: (data: EventFormSubmit) => Promise<void>
  onCancel: () => void
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      event_date: event?.event_date ?? new Date().toISOString().split('T')[0],
      event_type: event?.event_type ?? 'milestone',
      mood: event?.mood ?? '',
      location: event?.location ?? '',
      tags: event?.tags.join(', ') ?? '',
    },
  })

  async function handleFormSubmit(data: FormData) {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const { tags: _tagsStr, ...rest } = data
    await onSubmit({ ...rest, tags })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input placeholder="First smile, first steps..." {...register('title')} />
        {errors.title && <p className="text-xs text-[var(--error)]">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Controller
            control={control}
            name="event_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input type="date" {...register('event_date')} />
          {errors.event_date && <p className="text-xs text-[var(--error)]">{errors.event_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Mood</Label>
          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional..." />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_MOODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.emoji} {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input placeholder="City, Hospital..." {...register('location')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="Describe this memory..."
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <Input placeholder="family, milestone, first (comma separated)" {...register('tags')} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {event ? 'Update event' : 'Add event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
