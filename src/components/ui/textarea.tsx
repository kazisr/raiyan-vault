import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-[var(--radius-lg)] border border-[var(--outline-variant)]',
          'bg-[var(--surface-container-lowest)] px-4 py-3',
          'text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-muted)]',
          'transition-all duration-150 resize-none',
          'hover:border-[var(--outline)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/80 focus:border-[var(--primary)]',
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[var(--surface-container)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
