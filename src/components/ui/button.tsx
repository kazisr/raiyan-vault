'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm hover:opacity-90 hover:shadow',
        secondary:
          'bg-[var(--secondary-container)] text-[var(--on-secondary-container)] hover:opacity-80',
        outline:
          'border border-[var(--outline)] bg-transparent text-[var(--on-surface)] hover:bg-[var(--surface-container)]',
        ghost:
          'bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
        destructive:
          'bg-[var(--error)] text-[var(--on-error)] hover:opacity-90',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto',
        tonal:
          'bg-[var(--primary-container)] text-[var(--on-primary-container)] hover:opacity-80',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        default: 'h-10 px-6',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
