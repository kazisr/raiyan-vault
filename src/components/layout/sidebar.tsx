'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Clock, ImageIcon, Stethoscope, Wallet, BookOpen,
  Settings, Baby, Menu, X, ChevronRight, Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHILD_NICKNAME } from '@/constants/child'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: Baby },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/medical', label: 'Medical', icon: Stethoscope },
  { href: '/ledger', label: 'Ledger', icon: Wallet },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-[var(--surface-container-low)] border-r border-[var(--outline-variant)]/50',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--outline-variant)]/40">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
          <Heart className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-semibold text-[var(--on-surface)] whitespace-nowrap">
                {CHILD_NICKNAME}&apos;s Vault
              </p>
              <p className="text-xs text-[var(--on-surface-muted)] whitespace-nowrap">Family Archive</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto flex-shrink-0 p-1 rounded-full hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
                'hover:bg-[var(--surface-container)] group',
                active
                  ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 w-5 h-5 transition-colors',
                  active ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)]'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--outline-variant)]/40">
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-[var(--radius-md)]',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs font-medium text-[var(--on-surface)] whitespace-nowrap">Family</p>
                <p className="text-xs text-[var(--on-surface-muted)] whitespace-nowrap">Private Vault</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-[var(--surface-container)] transition-colors text-[var(--on-surface-variant)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col bg-[var(--surface-container-low)] border-r border-[var(--outline-variant)]/50"
            >
              <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--outline-variant)]/40">
                <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--on-surface)]">{CHILD_NICKNAME}&apos;s Vault</p>
                  <p className="text-xs text-[var(--on-surface-muted)]">Family Archive</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto p-1.5 rounded-full hover:bg-[var(--surface-container-high)] transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--on-surface-variant)]" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                        active
                          ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                          : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active ? 'text-[var(--primary)]' : '')} />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
