'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MobileSidebarTrigger } from './sidebar'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile':   'Profile',
  '/timeline':  'Timeline',
  '/gallery':   'Gallery',
  '/medical':   'Medical',
  '/ledger':    'Ledger',
  '/blog':      'Blog',
  '/settings':  'Settings',
}

interface TopbarProps {
  onMobileMenuOpen: () => void
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    "Raiyan's Vault"

  return (
    <header
      className={[
        'sticky top-0 z-30',
        'flex items-center gap-3 h-16 px-4 sm:px-5 md:px-6',
        'bg-[var(--surface)]/85 backdrop-blur-md',
        'border-b border-[var(--outline-variant)]/25',
      ].join(' ')}
    >
      {/* Mobile menu trigger */}
      <div className="md:hidden flex-shrink-0">
        <MobileSidebarTrigger onOpen={onMobileMenuOpen} />
      </div>

      {/* Page title */}
      <h1 className="flex-1 text-[15px] font-semibold tracking-[0.1px] text-[var(--on-surface)] truncate">
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun
            className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
          />
          <Moon
            className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
          />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </header>
  )
}
