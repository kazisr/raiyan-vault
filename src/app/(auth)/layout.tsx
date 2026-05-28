import { Heart } from 'lucide-react'
import { CHILD_NAME } from '@/constants/child'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div
        className={[
          'hidden lg:flex lg:w-[46%] xl:w-[42%]',
          'flex-col items-center justify-center p-12 relative overflow-hidden',
          'bg-gradient-to-br from-[var(--primary)] via-[var(--primary-container)] to-[var(--secondary-container)]',
        ].join(' ')}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: (i % 5) * 18 + 20,
                height: (i % 5) * 18 + 20,
                left: `${(i * 17 + 5) % 95}%`,
                top: `${(i * 23 + 3) % 95}%`,
                opacity: 0.2 + (i % 4) * 0.1,
              }}
            />
          ))}
        </div>

        {/* Floating accent shapes */}
        <div className="absolute top-12 right-12 w-20 h-20 rounded-[var(--radius-xl)] bg-white/10 backdrop-blur-sm rotate-12" />
        <div className="absolute bottom-16 left-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm" />
        <div className="absolute top-1/2 right-8 w-10 h-10 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-sm -rotate-6" />

        {/* Main content */}
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-[var(--shadow-3)]">
            <Heart className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white leading-tight">
              {CHILD_NAME}&apos;s Vault
            </h1>
            <p className="text-white/75 text-base leading-relaxed">
              A private family archive, crafted with love and care
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { icon: '🌟', label: 'Precious Memories' },
              { icon: '🏥', label: 'Health Records' },
              { icon: '📸', label: 'Photo Gallery' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-[var(--radius-xl)] px-4 py-3"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[var(--background)]">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--on-surface)] text-sm">{CHILD_NAME}&apos;s Vault</p>
              <p className="text-xs text-[var(--on-surface-muted)]">Family Archive</p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-[var(--radius-2xl)] bg-[var(--surface-container-low)] shadow-[var(--shadow-2)] p-6 sm:p-8">
            {children}
          </div>

          <p className="text-center text-xs text-[var(--on-surface-muted)] mt-6">
            Private & secure — only family members can access
          </p>
        </div>
      </div>
    </div>
  )
}
