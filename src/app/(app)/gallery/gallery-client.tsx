'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FolderOpen, Images, X, ChevronLeft, Loader2, ImageIcon, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Album, Photo } from '@/types/gallery'

const BUCKET = 'photos'

function useSignedUrl(storagePath: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!storagePath) return
    const supabase = createClient()
    supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl)
    })
  }, [storagePath])
  return url
}

interface GalleryClientProps {
  albums: Album[]
  photos: Photo[]
  userId: string
}

export function GalleryClient({ albums: initAlbums, photos: initPhotos, userId }: GalleryClientProps) {
  const [albums, setAlbums] = useState<Album[]>(initAlbums)
  const [photos, setPhotos] = useState<Photo[]>(initPhotos)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [newAlbumOpen, setNewAlbumOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [albumName, setAlbumName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  const supabase = createClient()

  const onDrop = useCallback((accepted: File[]) => {
    setUploadFiles(accepted)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
  })

  async function createAlbum() {
    if (!albumName.trim()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await supabase
      .from('albums')
      .insert({ name: albumName, user_id: userId, child_id: userId } as any)
      .select()
      .single()
    if (data) setAlbums((prev) => [data, ...prev])
    setAlbumName('')
    setNewAlbumOpen(false)
  }

  async function uploadPhotos() {
    if (!uploadFiles.length) return
    setUploading(true)
    try {
      for (const file of uploadFiles) {
        const path = `${userId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, file, { cacheControl: '3600' })
        if (uploadError) continue

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: photo } = await supabase
          .from('photos')
          .insert({
            storage_path: path,
            user_id: userId,
            child_id: userId,
            album_id: selectedAlbum?.id ?? albums[0]?.id,
            taken_at: new Date().toISOString(),
          } as any)
          .select()
          .single()
        if (photo) setPhotos((prev) => [photo, ...prev])
      }
    } finally {
      setUploading(false)
      setUploadFiles([])
      setUploadOpen(false)
    }
  }

  async function deletePhoto(photo: Photo) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path])
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    if (lightboxPhoto?.id === photo.id) setLightboxPhoto(null)
  }

  const displayPhotos = selectedAlbum
    ? photos.filter((p) => p.album_id === selectedAlbum.id)
    : photos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {selectedAlbum && (
            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedAlbum(null)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-[var(--on-surface)]">
              {selectedAlbum ? selectedAlbum.name : 'Gallery'}
            </h2>
            <p className="text-sm text-[var(--on-surface-muted)]">
              {displayPhotos.length} photos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNewAlbumOpen(true)}>
            <FolderOpen className="w-4 h-4" /> New album
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="w-4 h-4" /> Upload
          </Button>
        </div>
      </div>

      {!selectedAlbum && (
        <Tabs defaultValue="photos">
          <TabsList>
            <TabsTrigger value="photos"><Images className="w-3.5 h-3.5 mr-1.5" />All photos</TabsTrigger>
            <TabsTrigger value="albums"><FolderOpen className="w-3.5 h-3.5 mr-1.5" />Albums</TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <PhotoGrid photos={displayPhotos} onPhotoClick={setLightboxPhoto} onDelete={deletePhoto} />
          </TabsContent>

          <TabsContent value="albums">
            {albums.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-sm text-[var(--on-surface-variant)]">No albums yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setNewAlbumOpen(true)}>
                  Create first album
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {albums.map((album) => {
                  const count = photos.filter((p) => p.album_id === album.id).length
                  return (
                    <Card
                      key={album.id}
                      className="cursor-pointer hover:shadow-[var(--shadow-2)] transition-shadow"
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <CardContent className="pt-4">
                        <div className="aspect-square rounded-[var(--radius-md)] bg-[var(--surface-container-high)] mb-3 flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-[var(--on-surface-muted)]" />
                        </div>
                        <p className="font-medium text-sm text-[var(--on-surface)] truncate">{album.name}</p>
                        <p className="text-xs text-[var(--on-surface-muted)] mt-0.5">{count} photos</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedAlbum && (
        <PhotoGrid photos={displayPhotos} onPhotoClick={setLightboxPhoto} onDelete={deletePhoto} />
      )}

      {/* New Album Dialog */}
      <Dialog open={newAlbumOpen} onOpenChange={setNewAlbumOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New album</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Album name</Label>
              <Input
                placeholder="First year, Hospital days..."
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createAlbum()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createAlbum}>Create</Button>
              <Button variant="outline" onClick={() => setNewAlbumOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload photos</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[var(--primary)] bg-[var(--primary-container)]/20' : 'border-[var(--outline-variant)]'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--on-surface-muted)]" />
              <p className="text-sm text-[var(--on-surface-variant)]">
                {isDragActive ? 'Drop photos here' : 'Drag & drop or click to select'}
              </p>
              <p className="text-xs text-[var(--on-surface-muted)] mt-1">JPG, PNG, WEBP up to 10MB each</p>
            </div>
            {uploadFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {uploadFiles.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {f.name.slice(0, 20)}
                    <button onClick={() => setUploadFiles((prev) => prev.filter((_, j) => j !== i))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={uploadPhotos} disabled={!uploadFiles.length || uploading}>
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload {uploadFiles.length > 0 ? `${uploadFiles.length} photo${uploadFiles.length > 1 ? 's' : ''}` : 'photos'}
              </Button>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <LightboxOverlay photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} onDelete={deletePhoto} />
        )}
      </AnimatePresence>
    </div>
  )
}

function LightboxOverlay({ photo, onClose, onDelete }: { photo: Photo; onClose: () => void; onDelete: (photo: Photo) => void }) {
  const url = useSignedUrl(photo.storage_path)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      <button
        className="absolute top-4 left-4 text-white/60 hover:text-red-400 p-2 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm('Delete this photo? This cannot be undone.')) onDelete(photo)
        }}
        title="Delete photo"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      {url ? (
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          src={url}
          alt={photo.caption ?? 'Photo'}
          className="max-w-full max-h-full rounded-[var(--radius-lg)] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      )}
    </motion.div>
  )
}

function PhotoCard({ photo, index, onClick, onDelete }: { photo: Photo; index: number; onClick: () => void; onDelete: (p: Photo) => void }) {
  const url = useSignedUrl(photo.storage_path)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--surface-container-high)] group"
    >
      <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={onClick}>
        {url ? (
          <img
            src={url}
            alt={photo.caption ?? `Photo ${index + 1}`}
            className="w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[var(--on-surface-muted)]" />
          </div>
        )}
      </div>
      <button
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10"
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm('Delete this photo? This cannot be undone.')) onDelete(photo)
        }}
        title="Delete photo"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

function PhotoGrid({ photos, onPhotoClick, onDelete }: { photos: Photo[]; onPhotoClick: (p: Photo) => void; onDelete: (p: Photo) => void }) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm text-[var(--on-surface-variant)]">No photos yet</p>
      </div>
    )
  }

  return (
    <div className="columns-2 md:columns-3 gap-3 space-y-3 mt-4">
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} index={i} onClick={() => onPhotoClick(photo)} onDelete={onDelete} />
      ))}
    </div>
  )
}
