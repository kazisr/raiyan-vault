import { Heart } from 'lucide-react'
import { CHILD_NAME } from '@/constants/child'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--primary-container)] via-[var(--secondary-container)] to-[var(--tertiary-container)] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--on-primary-container)]">
              {CHILD_NAME}&apos;s Vault
            </h1>
            <p className="mt-2 text-[var(--on-primary-container)]/70 text-lg">
              A private family archive, crafted with love
            </p>
          </div>
          <div className="flex gap-4 justify-center text-sm text-[var(--on-primary-container)]/60">
            <span>✦ Memories</span>
            <span>✦ Milestones</span>
            <span>✦ Medical</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--background)]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--on-surface)]">{CHILD_NAME}&apos;s Vault</p>
              <p className="text-xs text-[var(--on-surface-muted)]">Family Archive</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
