'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EventCard } from '@/components/timeline/event-card'
import { EventForm, type EventFormSubmit } from '@/components/timeline/event-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EVENT_TYPES } from '@/constants/child'
import type { EventWithImages } from '@/types/events'
import dayjs from 'dayjs'

interface TimelineClientProps {
  events: EventWithImages[]
  userId: string
}

export function TimelineClient({ events: initial, userId }: TimelineClientProps) {
  const [events, setEvents] = useState<EventWithImages[]>(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventWithImages | undefined>()
  const [filterType, setFilterType] = useState<string>('all')

  const supabase = createClient()

  async function handleCreate(data: EventFormSubmit) {
    const { data: created } = await (supabase
      .from('events') as any)
      .insert({ ...data, user_id: userId, child_id: userId })
      .select('*, event_images(*)')
      .single() as { data: EventWithImages | null }
    if (created) setEvents((prev) => [created, ...prev])
    setDialogOpen(false)
  }

  async function handleUpdate(data: EventFormSubmit) {
    if (!editingEvent) return
    await (supabase.from('events') as any).update(data).eq('id', editingEvent.id)
    const { data: updated } = await supabase
      .from('events')
      .select('*, event_images(*)')
      .eq('id', editingEvent.id)
      .single() as { data: EventWithImages | null }
    if (updated) {
      setEvents((prev) => prev.map((e) => e.id === editingEvent.id ? updated : e))
    }
    setEditingEvent(undefined)
    setDialogOpen(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleSave(data: EventFormSubmit) {
    if (editingEvent) await handleUpdate(data)
    else await handleCreate(data)
  }

  const filtered = filterType === 'all' ? events : events.filter((e) => e.event_type === filterType)

  const grouped = filtered.reduce<Record<string, EventWithImages[]>>((acc, event) => {
    const year = dayjs(event.event_date).format('YYYY')
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">Memory Timeline</h2>
          <p className="text-sm text-[var(--on-surface-muted)]">{events.length} memories recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingEvent(undefined); setDialogOpen(true) }} size="sm">
            <Plus className="w-4 h-4" /> Add event
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-1">No memories yet</h3>
          <p className="text-sm text-[var(--on-surface-variant)] mb-4">Start recording Raiyan&apos;s journey</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Add first memory
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, yearEvents]) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default" className="text-sm px-4 py-1 font-bold">{year}</Badge>
                  <div className="flex-1 h-px bg-[var(--outline-variant)]" />
                  <span className="text-xs text-[var(--on-surface-muted)]">{yearEvents.length} events</span>
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-[var(--outline-variant)] ml-4">
                  <AnimatePresence>
                    {yearEvents.map((event) => (
                      <div key={event.id} className="relative pl-5">
                        <div className="absolute left-[-1.15rem] top-3 w-3.5 h-3.5 rounded-full bg-[var(--primary)] border-2 border-[var(--surface-container-low)]" />
                        <EventCard
                          event={event}
                          onEdit={(e) => { setEditingEvent(e); setDialogOpen(true) }}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit event' : 'Add new event'}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            onSubmit={handleSave}
            onCancel={() => { setDialogOpen(false); setEditingEvent(undefined) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
