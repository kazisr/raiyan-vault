'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-0.5 rounded-full bg-[var(--surface-container)] p-1',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full',
      'px-4 py-2 text-sm font-medium tracking-[0.1px]',
      'text-[var(--on-surface-variant)] transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
      'disabled:pointer-events-none disabled:opacity-40',
      'hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]',
      'data-[state=active]:bg-[var(--surface-container-lowest)] data-[state=active]:text-[var(--primary)] data-[state=active]:font-semibold data-[state=active]:shadow-[var(--shadow-1)]',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 animate-fade-in',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
