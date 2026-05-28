import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-[0.1px] transition-colors select-none leading-none',
  {
    variants: {
      variant: {
        default:   'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
        secondary: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
        tertiary:  'bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]',
        outline:   'border border-[var(--outline-variant)] text-[var(--on-surface-variant)] bg-transparent',
        error:     'bg-[var(--error-container)] text-[var(--on-error-container)]',
        surface:   'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
