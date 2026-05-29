'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type ToastVariant } from '@/hooks/use-toast'

const VARIANTS: Record<ToastVariant, { icon: React.ElementType; iconCls: string; borderCls: string }> = {
  success: { icon: CheckCircle2, iconCls: 'text-[var(--secondary)]',  borderCls: 'border-l-[var(--secondary)]'  },
  error:   { icon: AlertCircle,  iconCls: 'text-[var(--error)]',      borderCls: 'border-l-[var(--error)]'      },
  info:    { icon: Info,         iconCls: 'text-[var(--primary)]',    borderCls: 'border-l-[var(--primary)]'    },
  warning: { icon: AlertTriangle,iconCls: 'text-[var(--tertiary)]',   borderCls: 'border-l-[var(--tertiary)]'   },
}

function ToastItem({ id, message, variant, duration }: { id: string; message: string; variant: ToastVariant; duration: number }) {
  const remove = useToastStore((s) => s.remove)
  const { icon: Icon, iconCls, borderCls } = VARIANTS[variant]

  useEffect(() => {
    const t = setTimeout(() => remove(id), duration)
    return () => clearTimeout(t)
  }, [id, duration, remove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 72, y: -8, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  y: 0, scale: 1    }}
      exit={{    opacity: 0, x: 72, y: -8, scale: 0.92 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      className={[
        'flex items-center gap-3 w-[22rem] max-w-[calc(100vw-2rem)]',
        'rounded-[var(--radius-xl)] bg-[var(--surface-container-low)]',
        'shadow-[var(--shadow-3)] border border-[var(--outline-variant)] border-l-4',
        'px-4 py-3.5',
        borderCls,
      ].join(' ')}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconCls}`} />
      <p className="flex-1 text-sm font-medium text-[var(--on-surface)] leading-snug">
        {message}
      </p>
      <button
        onClick={() => remove(id)}
        aria-label="Dismiss"
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--on-surface-muted)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
