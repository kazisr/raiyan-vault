import React from 'react'
import { CHILD_NICKNAME } from '@/constants/child'

// Baby right-foot outline: heel at bottom, big toe upper-left, pinky upper-right
const FOOT_PATH =
  'M 28 73 C 14 71 7 58 9 44 C 11 30 17 18 25 14 C 33 10 44 14 49 26 C 54 38 51 58 42 69 C 38 73 33 74 28 73 Z'

const TOES = [
  { cx: 12, cy: 11, r: 5.5 },
  { cx: 23, cy:  5, r: 5.0 },
  { cx: 34, cy:  4, r: 4.5 },
  { cx: 44, cy:  7, r: 4.0 },
  { cx: 51, cy: 14, r: 3.5 },
]

// Perimeter slightly over-estimated so stroke is hidden before animation
const PAD_DASH = 220
const CYCLE    = 2.8   // seconds per full loop
const TOE_LAG  = CYCLE * 0.22  // how far into the cycle toes start appearing

function BabyFoot({ delay, flip }: { delay: number; flip?: boolean }) {
  const base: React.CSSProperties = {
    animationName: 'baby-draw',
    animationDuration: `${CYCLE}s`,
    animationIterationCount: 'infinite',
    animationFillMode: 'backwards',
  }
  return (
    <svg
      viewBox="0 0 60 80"
      width="44"
      height="59"
      aria-hidden="true"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, color: 'var(--primary)' }}
    >
      {/* Main pad */}
      <path
        d={FOOT_PATH}
        fill="var(--primary-container)"
        fillOpacity={0.22}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={PAD_DASH}
        style={{
          ...base,
          '--dash': PAD_DASH,
          animationDelay: `${delay}s`,
          animationTimingFunction: 'ease-in-out',
        } as React.CSSProperties}
      />
      {/* Toes – staggered after main pad starts drawing */}
      {TOES.map((toe, i) => {
        const circ = parseFloat((2 * Math.PI * toe.r).toFixed(2))
        return (
          <circle
            key={i}
            cx={toe.cx}
            cy={toe.cy}
            r={toe.r}
            fill="var(--primary-container)"
            fillOpacity={0.22}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circ}
            style={{
              ...base,
              '--dash': circ,
              animationDelay: `${delay + TOE_LAG + i * 0.09}s`,
              animationTimingFunction: 'ease-out',
            } as React.CSSProperties}
          />
        )
      })}
    </svg>
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-8 bg-[var(--background)]/85 backdrop-blur-[3px]">
      <div className="flex items-end gap-5">
        {/* Left foot (mirrored right-foot SVG) — draws first */}
        <div style={{ transform: 'translateY(10px)' }}>
          <BabyFoot delay={0} flip />
        </div>
        {/* Right foot — draws after left is well underway */}
        <BabyFoot delay={CYCLE * 0.46} />
      </div>
      <p className="text-sm font-medium text-[var(--on-surface-variant)] tracking-wide">
        Opening {CHILD_NICKNAME}&apos;s Vault…
      </p>
    </div>
  )
}
