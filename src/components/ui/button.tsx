'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden',
    'font-medium tracking-[0.1px] transition-all select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
    /* state layer */
    'before:absolute before:inset-0 before:rounded-[inherit]',
    'before:bg-current before:opacity-0 before:transition-opacity before:duration-150 before:pointer-events-none',
    'hover:before:opacity-[0.08] focus-visible:before:opacity-[0.1] active:before:opacity-[0.12]',
  ].join(' '),
  {
    variants: {
      variant: {
        /* MD3: Filled button */
        default:
          'rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-sm hover:shadow transition-shadow duration-200',
        /* MD3: Filled tonal button */
        tonal:
          'rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]',
        /* MD3: Elevated button */
        elevated:
          'rounded-full bg-[var(--surface-container-low)] text-[var(--primary)] shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow duration-200',
        /* MD3: Outlined button */
        outlined:
          'rounded-full border border-[var(--outline)] bg-transparent text-[var(--primary)]',
        /* Keep old name as alias */
        outline:
          'rounded-full border border-[var(--outline-variant)] bg-transparent text-[var(--on-surface)]',
        /* MD3: Text button */
        text:
          'rounded-full bg-transparent text-[var(--primary)]',
        /* Ghost — subtle, uses surface tint */
        ghost:
          'rounded-full bg-transparent text-[var(--on-surface-variant)]',
        /* Secondary tonal */
        secondary:
          'rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
        /* Tertiary tonal */
        tertiary:
          'rounded-full bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]',
        /* Destructive */
        destructive:
          'rounded-full bg-[var(--error)] text-[var(--on-error)] shadow-sm',
        /* Link */
        link:
          'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto before:hidden',
      },
      size: {
        xs:       'h-7 min-w-0 px-3 text-xs gap-1.5',
        sm:       'h-8 min-w-[64px] px-4 text-xs',
        default:  'h-10 min-w-[88px] px-6 text-sm',
        lg:       'h-12 min-w-[96px] px-8 text-sm',
        xl:       'h-14 min-w-[112px] px-10 text-base',
        icon:     'h-10 w-10 min-w-0 rounded-full p-0',
        'icon-sm':'h-8 w-8 min-w-0 rounded-full p-0',
        'icon-lg':'h-12 w-12 min-w-0 rounded-full p-0',
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
