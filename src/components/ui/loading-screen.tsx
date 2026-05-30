import React from 'react'
import { CHILD_NICKNAME } from '@/constants/child'

// Right foot, sole view: heel at bottom, big toe upper-left, pinky upper-right.
// pathLength="200" lets us use dasharray/dashoffset of 200 regardless of true geometry.
const FOOT_PATH =
  'M 31 78 C 17 77 9 64 11 50 C 13 36 19 24 28 20 C 33 17 41 17 46 21 C 54 27 56 44 54 58 C 52 71 45 78 31 78 Z'

// cx/cy/r in viewBox units (0 0 62 84).  Big toe leftmost → when flipped becomes left foot.
const TOES = [
  { cx: 16, cy: 16, r: 5.5 },
  { cx: 27, cy: 10, r: 5.0 },
  { cx: 38, cy:  9, r: 4.5 },
  { cx: 48, cy: 13, r: 4.0 },
  { cx: 55, cy: 19, r: 3.5 },
]

const DASH = 200   // virtual path length (matches pathLength attr)
const CYCLE = 2.6  // full animation cycle in seconds
const TOE_LAG = 0.45  // seconds after main pad starts before toes begin

function BabyFoot({ flip }: { flip?: boolean }) {
  const base: React.CSSProperties = {
    animationName: 'baby-draw',
    animationDuration: `${CYCLE}s`,
    animationIterationCount: 'infinite',
    animationFillMode: 'backwards',
    animationTimingFunction: 'ease-in-out',
    '--dash': DASH,
  } as React.CSSProperties

  return (
    <svg
      viewBox="0 0 62 84"
      width="48"
      height="65"
      aria-hidden="true"
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        color: 'var(--primary)',
      }}
    >
      {/* Main pad — pathLength normalises geometry so dasharray:200 = full stroke */}
      <path
        d={FOOT_PATH}
        pathLength={DASH}
        fill="var(--primary-container)"
        fillOpacity={0.18}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={DASH}
        style={{ ...base, animationDelay: '0s' }}
      />

      {/* Toes — staggered within the foot, but identical between both feet */}
      {TOES.map((toe, i) => {
        const circ = parseFloat((2 * Math.PI * toe.r).toFixed(2))
        return (
          <circle
            key={i}
            cx={toe.cx}
            cy={toe.cy}
            r={toe.r}
            fill="var(--primary-container)"
            fillOpacity={0.18}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circ}
            style={{
              ...base,
              '--dash': circ,
              animationDelay: `${TOE_LAG + i * 0.09}s`,
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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-[var(--background)]/85 backdrop-blur-[3px]">
      <div className="flex items-end gap-5">
        {/* Left foot = right-foot SVG mirrored on X */}
        <BabyFoot flip />
        <BabyFoot />
      </div>
      <p className="text-sm font-medium text-[var(--on-surface-variant)] tracking-wide">
        Opening {CHILD_NICKNAME}&apos;s Vault…
      </p>
    </div>
  )
}
