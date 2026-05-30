import React from 'react'
import { CHILD_NICKNAME } from '@/constants/child'

// Both paths drawn in the same CW direction (Y-down screen coords).
// Right foot: big toe upper-left, pinky upper-right.
// Left foot:  x-mirrored coordinates (62-x), same traversal direction → also CW.
const RIGHT_PATH =
  'M 31 78 C 17 77 9 64 11 50 C 13 36 19 24 28 20 C 33 17 41 17 46 21 C 54 27 56 44 54 58 C 52 71 45 78 31 78 Z'
const LEFT_PATH =
  'M 31 78 C 45 77 53 64 51 50 C 49 36 43 24 34 20 C 29 17 21 17 16 21 C 8 27 6 44 8 58 C 10 71 17 78 31 78 Z'

// Right foot toes: big toe left, pinky right (viewBox 0 0 62 84)
const RIGHT_TOES = [
  { cx: 16, cy: 16, r: 5.5 },
  { cx: 27, cy: 10, r: 5.0 },
  { cx: 38, cy:  9, r: 4.5 },
  { cx: 48, cy: 13, r: 4.0 },
  { cx: 55, cy: 19, r: 3.5 },
]

// Left foot toes: big toe right, pinky left (62 - cx from right foot)
const LEFT_TOES = [
  { cx: 46, cy: 16, r: 5.5 },
  { cx: 35, cy: 10, r: 5.0 },
  { cx: 24, cy:  9, r: 4.5 },
  { cx: 14, cy: 13, r: 4.0 },
  { cx:  7, cy: 19, r: 3.5 },
]

const DASH  = 200  // virtual path length (matches pathLength attr)
const CYCLE = 2.6  // full animation cycle in seconds

const anim = (dash: number): React.CSSProperties => ({
  animationName: 'baby-draw',
  animationDuration: `${CYCLE}s`,
  animationIterationCount: 'infinite',
  animationFillMode: 'backwards',
  animationTimingFunction: 'ease-in-out',
  animationDelay: '0s',
  '--dash': dash,
} as React.CSSProperties)

function BabyFoot({ left }: { left?: boolean }) {
  const path = left ? LEFT_PATH  : RIGHT_PATH
  const toes = left ? LEFT_TOES  : RIGHT_TOES

  return (
    <svg
      viewBox="0 0 62 84"
      width="48"
      height="65"
      aria-hidden="true"
      style={{ color: 'var(--primary)' }}
    >
      <path
        d={path}
        pathLength={DASH}
        fill="var(--primary-container)"
        fillOpacity={0.18}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={DASH}
        style={anim(DASH)}
      />
      {toes.map((toe, i) => {
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
            style={anim(circ)}
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
        <BabyFoot left />
        <BabyFoot />
      </div>
      <p className="text-sm font-medium text-[var(--on-surface-variant)] tracking-wide">
        Opening {CHILD_NICKNAME}&apos;s Vault…
      </p>
    </div>
  )
}
