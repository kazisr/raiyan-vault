import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-3 bg-[var(--background)]/80 backdrop-blur-[2px]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      <p className="text-sm font-medium text-[var(--on-surface-variant)]">Loading…</p>
    </div>
  )
}
