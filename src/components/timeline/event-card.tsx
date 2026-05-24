'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, MapPin, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/utils/age'
import { EVENT_TYPES, EVENT_MOODS } from '@/constants/child'
import type { EventWithImages } from '@/types/events'
import { createClient } from '@/lib/supabase/client'

function useSignedUrl(storagePath: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!storagePath) return
    const supabase = createClient()
    supabase.storage.from('photos').createSignedUrl(storagePath, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl)
    })
  }, [storagePath])
  return url
}

function EventImage({ path, alt }: { path: string; alt: string }) {
  const url = useSignedUrl(path)
  if (!url) return <div className="w-full h-full bg-[var(--surface-container-high)]" />
  return <img src={url} alt={alt} className="w-full h-full object-cover" />
}

interface EventCardProps {
  event: EventWithImages
  onEdit: (event: EventWithImages) => void
  onDelete: (id: string) => void
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
  const moodInfo = EVENT_MOODS.find((m) => m.value === event.mood)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <Card className="overflow-hidden hover:shadow-[var(--shadow-2)] transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            {/* Type emoji */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center text-lg">
              {typeInfo?.emoji ?? '📝'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[var(--on-surface)] leading-tight">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--on-surface-muted)]">
                      {formatDate(event.event_date, 'MMM D, YYYY')}
                    </span>
                    {moodInfo && (
                      <span className="text-xs">{moodInfo.emoji}</span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="flex-shrink-0 -mt-1 -mr-1">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(event)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-[var(--error)] focus:text-[var(--error)] focus:bg-[var(--error-container)]"
                      onClick={() => onDelete(event.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {event.description && (
                <p className="text-sm text-[var(--on-surface-variant)] mt-1.5 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-[var(--on-surface-muted)]">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </div>
                )}
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="surface" className="text-xs">
                    <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Images preview */}
          {event.event_images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {event.event_images.slice(0, 4).map((img, i) => (
                <div key={img.id} className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-[var(--radius-md)] overflow-hidden">
                    <EventImage path={img.storage_path} alt={img.caption ?? `Image ${i + 1}`} />
                  </div>
                  {i === 3 && event.event_images.length > 4 && (
                    <div className="absolute inset-0 rounded-[var(--radius-md)] bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{event.event_images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
