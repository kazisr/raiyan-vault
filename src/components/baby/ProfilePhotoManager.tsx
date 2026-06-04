'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, ZoomIn, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { setVaultPhoto } from '@/app/actions/vault-settings'
import { toast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'

const BUCKET = 'photos'
const PREFS_KEY = 'raiyan-photo-prefs'

interface ProfilePhotoManagerProps {
  initialProfileUrl: string | null
  initialCoverUrl: string | null
  userId: string
}

export function ProfilePhotoManager({
  initialProfileUrl,
  initialCoverUrl,
  userId,
}: ProfilePhotoManagerProps) {
  const [profileUrl, setProfileUrl] = useState(initialProfileUrl)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [lightbox, setLightbox] = useState<'profile' | 'cover' | null>(null)
  const profileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('upload_pictures')

  const supabase = createClient()

  async function getOrCreateAlbum(name: string): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('albums')
      .select('id')
      .eq('name', name)
      .limit(1)
      .maybeSingle()

    if (existing?.id) return existing.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error } = await (supabase as any)
      .from('albums')
      .insert({ name, user_id: userId, child_id: userId })
      .select('id')
      .single()

    if (error) return null
    return created?.id ?? null
  }

  async function handleUpload(type: 'profile' | 'cover', file: File) {
    const setLoading = type === 'profile' ? setUploadingProfile : setUploadingCover
    const albumName = type === 'profile' ? 'Profile Pictures' : 'Cover Photos'
    setLoading(true)

    try {
      const albumId = await getOrCreateAlbum(albumName)
      if (!albumId) { toast.error('Could not access album'); return }

      const path = `shared/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)
      if (uploadError) { toast.error('Upload failed'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: photo, error: dbError } = await (supabase as any)
        .from('photos')
        .insert({
          storage_path: path,
          user_id: userId,
          child_id: userId,
          album_id: albumId,
          taken_at: new Date().toISOString(),
          is_featured: true,
        })
        .select('id')
        .single()

      if (dbError || !photo) { toast.error('Failed to save photo'); return }

      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
      const url = signed?.signedUrl ?? null

      if (url) {
        if (type === 'profile') setProfileUrl(url)
        else setCoverUrl(url)
      }

      await setVaultPhoto(type, photo.id, path)

      // Sync localStorage
      try {
        const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
        const patch =
          type === 'profile'
            ? { profileId: photo.id, profilePath: path }
            : { coverId: photo.id, coverPath: path }
        localStorage.setItem(PREFS_KEY, JSON.stringify({ ...saved, ...patch }))
      } catch {}

      toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} photo updated!`)
    } finally {
      setLoading(false)
    }
  }

  const lightboxUrl = lightbox === 'profile' ? profileUrl : coverUrl

  return (
    <>
      <div className="rounded-xl overflow-hidden bg-[var(--surface-container)] border border-[var(--outline-variant)] shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-[160px] sm:h-[240px] bg-gradient-to-br from-[#1877F2] via-[#4facfe] to-[#00c6fb] group/cover overflow-hidden">
          {coverUrl && (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          )}

          {/* View cover */}
          <button
            onClick={() => setLightbox('cover')}
            className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors opacity-0 group-hover/cover:opacity-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            View
          </button>

          {canEdit && (
            <>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload('cover', f)
                  e.target.value = ''
                }}
              />
              <button
                className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-60"
                onClick={() => coverRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                {uploadingCover ? 'Uploading…' : 'Edit Cover Photo'}
              </button>
            </>
          )}
        </div>

        {/* Profile Picture row */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-3 -mt-10">
            {/* Avatar */}
            <div className="relative group/profile flex-shrink-0">
              <button
                onClick={() => setLightbox('profile')}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[var(--surface-container)] bg-[#1877F2] overflow-hidden shadow-md block"
              >
                {profileUrl ? (
                  <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-3xl select-none">
                    👶
                  </span>
                )}
                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover/profile:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </button>

              {canEdit && (
                <>
                  <input
                    ref={profileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload('profile', f)
                      e.target.value = ''
                    }}
                  />
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] flex items-center justify-center shadow-sm transition-colors border-2 border-[var(--surface-container)] disabled:opacity-60"
                    onClick={() => profileRef.current?.click()}
                    disabled={uploadingProfile}
                    title="Change profile photo"
                  >
                    {uploadingProfile ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3 text-[var(--on-surface)]" />
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="pb-1">
              <p className="text-xs text-[var(--on-surface-muted)]">
                {canEdit ? 'Click the camera icon to update photos' : 'Profile & Cover Photo'}
              </p>
              <p className="text-[10px] text-[var(--on-surface-muted)] mt-0.5">
                Uploads go to "Profile Pictures" &amp; "Cover Photos" albums
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/75 text-sm font-semibold pointer-events-none">
            {lightbox === 'profile' ? 'Profile Photo' : 'Cover Photo'}
          </p>
          <img
            src={lightboxUrl}
            alt={lightbox === 'profile' ? 'Profile Photo' : 'Cover Photo'}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
