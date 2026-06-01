import { createClient } from '@/lib/supabase/client'

const BUCKET = 'photos'

export async function uploadFile(file: File, path: string): Promise<string | null> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) { console.error('Upload error:', error); return null }
  return path
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) { console.error('Signed URL error:', error); return null }
  return data.signedUrl
}

export async function deleteFile(path: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return !error
}

export function generatePhotoPath(_userId: string, filename: string): string {
  const ext = filename.split('.').pop()
  return `shared/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
}
