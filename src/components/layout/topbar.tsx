'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { MobileSidebar } from './sidebar'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/timeline': 'Timeline',
  '/gallery': 'Gallery',
  '/medical': 'Medical',
  '/ledger': 'Ledger',
  '/blog': 'Blog',
  '/settings': 'Settings',
}

export function Topbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? 'Raiyan\'s Vault'

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 h-14 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--outline-variant)]/30">
      <div className="md:hidden">
        <MobileSidebar />
      </div>

      <h1 className="text-base font-semibold text-[var(--on-surface)]">{title}</h1>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
