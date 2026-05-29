'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download, X, ZoomIn } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption?: string | null
}

interface Props {
  photos: Photo[]
}

export default function PhotoCarousel({ photos }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({})

  const go = useCallback(
    (next: number, dir: 'left' | 'right') => {
      if (isAnimating) return
      setDirection(dir)
      setIsAnimating(true)
      setTimeout(() => {
        setCurrent(next)
        setIsAnimating(false)
      }, 250)
    },
    [isAnimating]
  )

  const prev = useCallback(() => {
    go((current - 1 + photos.length) % photos.length, 'left')
  }, [current, photos.length, go])

  const next = useCallback(() => {
    go((current + 1) % photos.length, 'right')
  }, [current, photos.length, go])

  const lightboxPrev = useCallback(() => {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + photos.length) % photos.length)
  }, [lightbox, photos.length])

  const lightboxNext = useCallback(() => {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % photos.length)
  }, [lightbox, photos.length])

  useEffect(() => {
    if (lightbox !== null) return
    const timer = setInterval(() => next(), 4000)
    return () => clearInterval(timer)
  }, [lightbox, next])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, lightboxPrev, lightboxNext])

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>, photoId: string) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalWidth && naturalHeight) {
      setAspectRatios((prev) => ({ ...prev, [photoId]: naturalWidth / naturalHeight }))
    }
  }

  const download = (photo: Photo) => {
    const a = document.createElement('a')
    a.href = photo.url
    a.download = photo.caption ?? `photo-${photo.id}`
    a.target = '_blank'
    a.click()
  }

  if (photos.length === 0) return null

  const photo = photos[current]
  const currentRatio = aspectRatios[photo.id] ?? 4 / 3
  const isPortrait = currentRatio < 1
  const containerStyle: React.CSSProperties = {
    aspectRatio: currentRatio,
    maxWidth: isPortrait ? `calc(75vh * ${currentRatio})` : '100%',
  }

  return (
    <>
      {/* Carousel */}
      <div className="w-full flex justify-center">
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-900 dark:bg-gray-950 select-none group w-full transition-all duration-300"
        style={containerStyle}
      >
        {/* Blurred background fill (visible for portrait images with letterboxing) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={photo.url}
            aria-hidden
            className="w-full h-full object-cover blur-2xl scale-110 opacity-50"
          />
        </div>

        {/* Slide image */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transition: isAnimating ? 'opacity 250ms ease, transform 250ms ease' : undefined,
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating
              ? `translateX(${direction === 'right' ? '-24px' : '24px'})`
              : 'translateX(0)',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption ?? 'Photo'}
            className="w-full h-full object-contain"
            onLoad={(e) => handleImageLoad(e, photo.id)}
          />
        </div>

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Caption */}
        {photo.caption && (
          <p className="absolute bottom-3 left-4 right-16 text-white text-sm font-medium truncate drop-shadow">
            {photo.caption}
          </p>
        )}

        {/* Download button */}
        <button
          onClick={() => download(photo)}
          className="absolute bottom-2.5 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Zoom button */}
        <button
          onClick={() => setLightbox(current)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
          title="View full size"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Nav buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Click to open lightbox (full area) */}
        <button
          onClick={() => setLightbox(current)}
          className="absolute inset-0 z-0 cursor-zoom-in"
          aria-label="View full size"
        />
      </div>
      </div>

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 'right' : 'left')}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-1.5 bg-rose-400'
                  : 'w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => go(i, i > current ? 'right' : 'left')}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-rose-400 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-75'
              }`}
            >
              <img src={p.url} alt={p.caption ?? ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Download */}
          <button
            className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); download(photos[lightbox]) }}
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Image */}
          <img
            src={photos[lightbox].url}
            alt={photos[lightbox].caption ?? 'Photo'}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          {photos[lightbox].caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {photos[lightbox].caption}
            </p>
          )}

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <span className="absolute bottom-6 right-6 text-white/50 text-xs tabular-nums">
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}
