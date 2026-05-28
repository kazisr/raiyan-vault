'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar, MobileSidebar } from './sidebar'
import { Topbar } from './topbar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMd, setIsMd] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsMd(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const sidebarWidth = isMd ? (collapsed ? 72 : 260) : 0

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar — rendered outside any backdrop-filter ancestor */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area */}
      <div
        className={cn('min-h-screen flex flex-col', 'transition-[margin-left] duration-300 ease-[var(--motion-emphasized)]')}
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 page-enter">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
