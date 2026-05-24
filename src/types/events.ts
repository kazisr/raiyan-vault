import type { Database } from './database'

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventImage = Database['public']['Tables']['event_images']['Row']

export type EventType =
  | 'milestone'
  | 'birthday'
  | 'travel'
  | 'family'
  | 'education'
  | 'health'
  | 'custom'

export type EventMood = 'happy' | 'excited' | 'calm' | 'sad' | 'sick' | 'surprised'

export interface EventWithImages extends Event {
  event_images: EventImage[]
}
