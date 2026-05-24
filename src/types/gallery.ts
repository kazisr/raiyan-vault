import type { Database } from './database'

export type Album = Database['public']['Tables']['albums']['Row']
export type AlbumInsert = Database['public']['Tables']['albums']['Insert']

export type Photo = Database['public']['Tables']['photos']['Row']
export type PhotoInsert = Database['public']['Tables']['photos']['Insert']

export interface AlbumWithPhotos extends Album {
  photos: Photo[]
  photo_count: number
}
