'use client'

import { useState, type ReactNode } from 'react'
import { X, Camera, Syringe, Stethoscope, BookOpen, Calendar, MapPin, Heart } from 'lucide-react'
import { AgeCounter } from '@/components/dashboard/age-counter'
import { VaccineReminder } from '@/components/dashboard/vaccine-reminder'
import PhotoCarousel from '@/components/baby/PhotoCarousel'
import { BalanceSection } from '@/components/baby/BalanceSection'
import { LedgerHistory } from '@/components/baby/LedgerHistory'
import { ShareButton } from '@/components/baby/ShareButton'
import { formatDate } from '@/utils/age'
import { EVENT_TYPES, CHILD_DOB } from '@/constants/child'
import type { Event } from '@/types/events'
import type { Vaccine } from '@/types/medical'

type Tab = 'All' | 'Photos' | 'Reels'

interface Photo {
  id: string
  url: string
  caption?: string | null
}

interface Balance {
  currency: 'BDT' | 'JPY'
  balance: number
}

interface LedgerEntry {
  id: string
  amount: number
  type: string
  currency: string
  category: string
  description: string | null
  entry_date: string
  source_person: string | null
}

interface ProfileContentProps {
  carouselPhotos: Photo[]
  vaccines: Vaccine[]
  events: Event[]
  balances: Balance[]
  ledgerEntries: LedgerEntry[]
  childName: string
  childNickname: string
  photoCount: number
  vaccineCount: number
  visitCount: number
  postCount: number
}

export function ProfileContent({
  carouselPhotos,
  vaccines,
  events,
  balances,
  ledgerEntries,
  childName,
  childNickname,
  photoCount,
  vaccineCount,
  visitCount,
  postCount,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [photoLightbox, setPhotoLightbox] = useState<number | null>(null)

  const profilePhotoUrl = carouselPhotos[0]?.url ?? null

  return (
    <>
      {/* ── Tab Bar ── */}
      <div className="bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#3A3B3C] sticky top-14 z-40 shadow-sm">
        <div className="max-w-[940px] mx-auto px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex">
            {(['All', 'Photos', 'Reels'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] transition-colors mr-1',
                  activeTab === tab
                    ? 'border-[#1877F2] text-[#1877F2]'
                    : 'border-transparent text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-t-md',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[940px] mx-auto px-4 py-4">

        {/* ── ALL TAB ── */}
        {activeTab === 'All' && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">

            {/* Left Sidebar */}
            <div className="space-y-3">
              {/* Intro Card */}
              <div className="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C]">
                <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB] mb-4">Intro</h2>
                <div className="space-y-3">
                  {[
                    { Icon: Calendar, text: `Born on ${formatDate(CHILD_DOB, 'MMMM D, YYYY')}` },
                    { Icon: MapPin, text: 'Dhaka, Bangladesh' },
                    { Icon: Heart, text: 'Cherished by family', iconClass: 'text-rose-500' },
                    { Icon: Camera, text: `${photoCount} featured photo${photoCount !== 1 ? 's' : ''}` },
                    { Icon: Syringe, text: `${vaccineCount} vaccine${vaccineCount !== 1 ? 's' : ''} administered` },
                    { Icon: Stethoscope, text: `${visitCount} doctor visit${visitCount !== 1 ? 's' : ''}` },
                    { Icon: BookOpen, text: `${postCount} blog post${postCount !== 1 ? 's' : ''}` },
                  ].map(({ Icon, text, iconClass }) => (
                    <div key={text} className="flex items-center gap-3">
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 text-[#65676B] dark:text-[#B0B3B8] ${iconClass ?? ''}`} />
                      <span className="text-sm text-[#050505] dark:text-[#E4E6EB]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Grid Card */}
              {carouselPhotos.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">Photos</h2>
                    <button
                      onClick={() => setActiveTab('Photos')}
                      className="text-sm font-semibold text-[#1877F2] hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                    {carouselPhotos.slice(0, 9).map((p, i) => (
                      <div key={p.id} className="aspect-square overflow-hidden bg-[#F0F2F5] dark:bg-[#3A3B3C]">
                        <img
                          src={p.url}
                          alt={p.caption ?? `Photo ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setActiveTab('Photos')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaccine Reminders */}
              <VaccineReminder vaccines={vaccines} readOnly />
            </div>

            {/* Right Feed */}
            <div className="space-y-3">

              {/* Age Counter — standalone (no FeedCard) */}
              <AgeCounter />

              {/* Featured Photos */}
              {carouselPhotos.length > 0 && (
                <FeedCard
                  profilePhotoUrl={profilePhotoUrl}
                  title={childNickname}
                  subtitle="added new photos"
                  shareUrl={carouselPhotos[0]?.url}
                >
                  <PhotoCarousel photos={carouselPhotos} />
                </FeedCard>
              )}

              {/* Recent Memories */}
              {events.length > 0 && (
                <FeedCard
                  profilePhotoUrl={profilePhotoUrl}
                  title={childNickname}
                  subtitle="Recent Memories"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {events.slice(0, 4).map((event) => {
                      const typeInfo = EVENT_TYPES.find((t) => t.value === event.event_type)
                      return (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F0F2F5] dark:bg-[#3A3B3C] flex items-center justify-center flex-shrink-0 text-lg select-none">
                            {typeInfo?.emoji ?? '📝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#050505] dark:text-[#E4E6EB] truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
                              {formatDate(event.event_date)}
                            </p>
                          </div>
                          {event.tags.length > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E7F3FF] dark:bg-[#263951] text-[#1877F2] flex-shrink-0">
                              {event.tags[0]}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </FeedCard>
              )}

              {/* Family Fund */}
              <FeedCard
                profilePhotoUrl={profilePhotoUrl}
                title={childNickname}
                subtitle="Family Fund"
              >
                <div className="px-4 pb-4">
                  <BalanceSection balances={balances} />
                </div>
              </FeedCard>

              {/* Ledger */}
              {ledgerEntries.length > 0 && (
                <FeedCard
                  profilePhotoUrl={profilePhotoUrl}
                  title={childNickname}
                  subtitle="Ledger History"
                >
                  <div className="px-4 pb-4">
                    <LedgerHistory entries={ledgerEntries} />
                  </div>
                </FeedCard>
              )}
            </div>
          </div>
        )}

        {/* ── PHOTOS TAB ── */}
        {activeTab === 'Photos' && (
          <div className="bg-white dark:bg-[#242526] rounded-xl border border-[#E4E6EB] dark:border-[#3A3B3C] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                Photos
              </h2>
              <span className="text-sm text-[#65676B] dark:text-[#B0B3B8]">
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            {carouselPhotos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">📷</p>
                <p className="text-[#65676B] dark:text-[#B0B3B8]">No photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {carouselPhotos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoLightbox(i)}
                    className="aspect-square overflow-hidden rounded-lg bg-[#F0F2F5] dark:bg-[#3A3B3C] group"
                  >
                    <img
                      src={p.url}
                      alt={p.caption ?? `Photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REELS TAB ── */}
        {activeTab === 'Reels' && (
          <div className="bg-white dark:bg-[#242526] rounded-xl border border-[#E4E6EB] dark:border-[#3A3B3C] py-20 text-center">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-lg font-bold text-[#050505] dark:text-[#E4E6EB]">No Reels Yet</p>
            <p className="text-sm text-[#65676B] dark:text-[#B0B3B8] mt-1">
              Check back soon for video memories!
            </p>
          </div>
        )}
      </div>

      {/* Photos-tab lightbox */}
      {photoLightbox !== null && carouselPhotos[photoLightbox] && (
        <div
          className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setPhotoLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
            onClick={() => setPhotoLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={carouselPhotos[photoLightbox].url}
            alt={carouselPhotos[photoLightbox].caption ?? ''}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {carouselPhotos[photoLightbox].caption && (
            <p className="absolute bottom-6 text-white/75 text-sm bg-black/40 px-4 py-1.5 rounded-full">
              {carouselPhotos[photoLightbox].caption}
            </p>
          )}
          {/* Counter */}
          <span className="absolute bottom-6 right-6 text-white/50 text-xs tabular-nums">
            {photoLightbox + 1} / {carouselPhotos.length}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-[940px] mx-auto px-4 pb-8 mt-2 text-center">
        <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
          For {childNickname} with love ❤️
        </p>
      </div>
    </>
  )
}

// ── FeedCard ─────────────────────────────────────────────────────────

function FeedCard({
  profilePhotoUrl,
  title,
  subtitle,
  shareUrl,
  children,
}: {
  profilePhotoUrl: string | null
  title: string
  subtitle: string
  shareUrl?: string
  children: ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C] overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1877F2] overflow-hidden flex-shrink-0">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg select-none">
              👶
            </div>
          )}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#050505] dark:text-[#E4E6EB] leading-tight">
            {title}
          </p>
          <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">{subtitle}</p>
        </div>
      </div>

      {/* Post body */}
      {children}

      {/* Share-only reactions bar */}
      <div className="px-4 py-2 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center">
        <ShareButton url={shareUrl} title={title} />
      </div>
    </div>
  )
}
