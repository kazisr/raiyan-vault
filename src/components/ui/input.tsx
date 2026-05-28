import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-[var(--radius-lg)] border border-[var(--outline-variant)]',
          'bg-[var(--surface-container-lowest)] px-4 py-3',
          'text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)]',
          'transition-all duration-150',
          'hover:border-[var(--outline)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/80 focus:border-[var(--primary)] focus:bg-[var(--surface-container-lowest)]',
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[var(--surface-container)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
