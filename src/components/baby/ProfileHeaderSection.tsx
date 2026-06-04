'use client'

import { useState, useEffect } from 'react'
import { Camera, ZoomIn, X, Check } from 'lucide-react'
import { formatDate } from '@/utils/age'
import { CHILD_BIO } from '@/constants/child'
import { setVaultPhoto } from '@/app/actions/vault-settings'

interface Photo {
  id: string
  url: string
  caption?: string | null
  storage_path?: string
}

interface ProfileHeaderSectionProps {
  initialCoverUrl: string | null
  initialProfileUrl: string | null
  allPhotos: Photo[]
  childName: string
  childDob: string
  childNickname: string
  photoCount: number
  vaccineCount: number
  visitCount: number
  postCount: number
}

const STORAGE_KEY = 'raiyan-photo-prefs'

export function ProfileHeaderSection({
  initialCoverUrl,
  initialProfileUrl,
  allPhotos,
  childName,
  photoCount,
  vaccineCount,
  visitCount,
  postCount,
}: ProfileHeaderSectionProps) {
  const [profileUrl, setProfileUrl] = useState(initialProfileUrl)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl)
  const [lightbox, setLightbox] = useState<'profile' | 'cover' | null>(null)
  const [selector, setSelector] = useState<'profile' | 'cover' | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  // Client-side auth + permission check (upload_pictures)
  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (!profile) return

        if (profile.role === 'Dad') {
          setCanEdit(true)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: perm } = await (supabase as any)
          .from('role_permissions')
          .select('granted')
          .eq('role', profile.role)
          .eq('permission', 'upload_pictures')
          .single()

        if (perm?.granted) setCanEdit(true)
      } catch {}
    }
    checkAuth()
  }, [])

  // Restore saved photo selections from localStorage
  useEffect(() => {
    async function restorePrefs() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return
        const prefs: { profileId?: string; profilePath?: string; coverId?: string; coverPath?: string } = JSON.parse(saved)

        if (prefs.profileId) {
          const found = allPhotos.find((p) => p.id === prefs.profileId)
          if (found) {
            setProfileUrl(found.url)
          } else if (prefs.profilePath) {
            const { createClient } = await import('@/lib/supabase/client')
            const { data } = await createClient().storage.from('photos').createSignedUrl(prefs.profilePath, 3600)
            if (data?.signedUrl) setProfileUrl(data.signedUrl)
          }
        }

        if (prefs.coverId) {
          const found = allPhotos.find((p) => p.id === prefs.coverId)
          if (found) {
            setCoverUrl(found.url)
          } else if (prefs.coverPath) {
            const { createClient } = await import('@/lib/supabase/client')
            const { data } = await createClient().storage.from('photos').createSignedUrl(prefs.coverPath, 3600)
            if (data?.signedUrl) setCoverUrl(data.signedUrl)
          }
        }
      } catch {}
    }
    restorePrefs()
  }, [allPhotos])

  const selectPhoto = async (slot: 'profile' | 'cover', photo: Photo) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
      if (slot === 'profile') {
        setProfileUrl(photo.url)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...saved, profileId: photo.id, profilePath: photo.storage_path,
        }))
      } else {
        setCoverUrl(photo.url)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...saved, coverId: photo.id, coverPath: photo.storage_path,
        }))
      }
    } catch {}
    setSelector(null)
    if (photo.storage_path) {
      setVaultPhoto(slot, photo.id, photo.storage_path).catch(() => {})
    }
  }

  const lightboxUrl = lightbox === 'profile' ? profileUrl : coverUrl

  return (
    <>
      {/* ── Cover Photo ── */}
      <div className="relative h-[220px] sm:h-[340px] bg-gradient-to-br from-[#1877F2] via-[#4facfe] to-[#00c6fb] overflow-hidden rounded-b-2xl group/cover">
        {coverUrl && (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* View on hover */}
        <button
          onClick={() => setLightbox('cover')}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/45 hover:bg-black/65 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors opacity-0 group-hover/cover:opacity-100"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          View Cover Photo
        </button>

        {canEdit && (
          <button
            onClick={() => setSelector('cover')}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4" />
            Edit Cover Photo
          </button>
        )}
      </div>

      {/* ── Profile Info Bar ── */}
      <div className="bg-white dark:bg-[#242526] shadow-sm border-b border-[#E4E6EB] dark:border-[#3A3B3C]">
        <div className="max-w-[940px] mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 pb-4">

            {/* Profile Picture */}
            <div className="-mt-[54px] sm:-mt-[72px] flex-shrink-0 z-10 relative group/profile">
              <div
                className="w-[120px] h-[120px] sm:w-[168px] sm:h-[168px] rounded-full border-4 border-white dark:border-[#242526] bg-[#1877F2] overflow-hidden shadow-md cursor-pointer relative"
                onClick={() => setLightbox('profile')}
              >
                {profileUrl ? (
                  <img src={profileUrl} alt={childName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl select-none">
                    👶
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/profile:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={() => setSelector('profile')}
                  title="Change profile photo"
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4A4B4C] flex items-center justify-center shadow-sm transition-colors border-2 border-white dark:border-[#242526]"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>

            {/* Name + stats (no login button here — it's in the navbar) */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:pb-2">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#050505] dark:text-[#E4E6EB] leading-tight">
                  {childName}
                </h1>
                <p className="text-[#65676B] dark:text-[#B0B3B8] text-sm mt-0.5">{CHILD_BIO}</p>
                <div className="flex flex-wrap items-center gap-x-1 mt-2">
                  <StatPill value={photoCount} label="Photos" />
                  <Dot />
                  <StatPill value={vaccineCount} label="Vaccines" />
                  <Dot />
                  <StatPill value={visitCount} label="Dr. Visits" />
                  <Dot />
                  <StatPill value={postCount} label="Posts" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-sm flex flex-col items-center justify-center"
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

      {/* ── Photo Selector ── */}
      {selector !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelector(null)}
        >
          <div
            className="bg-white dark:bg-[#242526] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] dark:border-[#3A3B3C]">
              <h3 className="text-base font-bold text-[#050505] dark:text-[#E4E6EB]">
                Select {selector === 'profile' ? 'Profile' : 'Cover'} Photo
              </h3>
              <button
                onClick={() => setSelector(null)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4A4B4C] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {allPhotos.length === 0 ? (
              <p className="text-center text-sm text-[#65676B] dark:text-[#B0B3B8] py-10">
                No photos available yet.
              </p>
            ) : (
              <div className="p-4 grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
                {allPhotos.map((photo) => {
                  const isSelected =
                    selector === 'profile'
                      ? profileUrl === photo.url
                      : coverUrl === photo.url
                  return (
                    <button
                      key={photo.id}
                      onClick={() => selectPhoto(selector, photo)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-[#1877F2]'
                          : 'border-transparent hover:border-[#1877F2]/40'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption ?? ''}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#1877F2]/25 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-sm">
      <span className="font-bold text-[#050505] dark:text-[#E4E6EB]">{value}</span>
      <span className="text-[#65676B] dark:text-[#B0B3B8] ml-1">{label}</span>
    </span>
  )
}

function Dot() {
  return <span className="text-[#65676B] dark:text-[#B0B3B8] mx-0.5 text-xs">·</span>
}
