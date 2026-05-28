'use client'

import React from 'react'
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
  { href: '/profile',   label: 'Profile',   icon: Baby },
  { href: '/timeline',  label: 'Timeline',  icon: Clock },
  { href: '/gallery',   label: 'Gallery',   icon: ImageIcon },
  { href: '/medical',   label: 'Medical',   icon: Stethoscope },
  { href: '/ledger',    label: 'Ledger',    icon: Wallet },
  { href: '/blog',      label: 'Blog',      icon: BookOpen },
  { href: '/settings',  label: 'Settings',  icon: Settings },
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
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-[var(--surface-container-low)] border-r border-[var(--outline-variant)]/40',
        'transition-[width] duration-300 ease-[var(--motion-emphasized)]',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo / brand */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-[var(--outline-variant)]/30',
          'transition-[padding] duration-300',
          collapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'
        )}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-sm">
          <Heart className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="overflow-hidden flex-1"
            >
              <p className="text-[13px] font-semibold text-[var(--on-surface)] whitespace-nowrap leading-tight">
                {CHILD_NICKNAME}&apos;s Vault
              </p>
              <p className="text-[11px] text-[var(--on-surface-muted)] whitespace-nowrap leading-tight mt-0.5">
                Family Archive
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full',
              'flex items-center justify-center',
              'text-[var(--on-surface-muted)] hover:text-[var(--on-surface)]',
              'hover:bg-[var(--surface-container-high)]',
              'transition-colors duration-150'
            )}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {collapsed && (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className={cn(
              'absolute right-2 top-[22px] w-7 h-7 rounded-full',
              'flex items-center justify-center',
              'text-[var(--on-surface-muted)] hover:text-[var(--on-surface)]',
              'hover:bg-[var(--surface-container-high)]',
              'transition-colors duration-150'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-[var(--radius-2xl)] text-sm font-medium',
                'transition-all duration-150 relative overflow-hidden',
                collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3',
                active
                  ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
              )}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 transition-colors duration-150',
                  collapsed ? 'w-5 h-5' : 'w-5 h-5',
                  active
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)]'
                )}
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="nav-label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
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

      {/* Bottom user info */}
      <div className="p-3 border-t border-[var(--outline-variant)]/30">
        <div
          className={cn(
            'flex items-center gap-3 rounded-[var(--radius-xl)] px-3 py-2.5',
            'bg-[var(--surface-container)] transition-colors duration-150',
            collapsed ? 'justify-center px-0' : ''
          )}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <p className="text-xs font-semibold text-[var(--on-surface)] whitespace-nowrap leading-tight">
                  Family
                </p>
                <p className="text-[10px] text-[var(--on-surface-muted)] whitespace-nowrap leading-tight">
                  Private Vault
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}

interface MobileSidebarTriggerProps {
  onOpen: () => void
}

export function MobileSidebarTrigger({ onOpen }: MobileSidebarTriggerProps) {
  return (
    <button
      onClick={onOpen}
      aria-label="Open menu"
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center',
        'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]',
        'hover:bg-[var(--surface-container-high)]',
        'transition-colors duration-150'
      )}
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--scrim)]/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed left-0 top-0 h-full w-[280px] z-50 flex flex-col',
              'bg-[var(--surface-container-low)]',
              'shadow-[var(--shadow-4)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--outline-variant)]/30">
              <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-sm">
                <Heart style={{ width: 18, height: 18 }} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--on-surface)] leading-tight">
                  {CHILD_NICKNAME}&apos;s Vault
                </p>
                <p className="text-[11px] text-[var(--on-surface-muted)] leading-tight mt-0.5">
                  Family Archive
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]',
                  'hover:bg-[var(--surface-container-high)]',
                  'transition-colors duration-150'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-[var(--radius-2xl)]',
                      'text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                        : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        active ? 'text-[var(--primary)]' : ''
                      )}
                    />
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-[var(--outline-variant)]/30">
              <div className="flex items-center gap-3 rounded-[var(--radius-xl)] px-3 py-2.5 bg-[var(--surface-container)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--on-surface)] leading-tight">Family</p>
                  <p className="text-[10px] text-[var(--on-surface-muted)] leading-tight">Private Vault</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
