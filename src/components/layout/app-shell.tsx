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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar — rendered at root level, outside any backdrop-filter ancestor */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: isMd ? (collapsed ? 64 : 240) : 0 }}
      >
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}
