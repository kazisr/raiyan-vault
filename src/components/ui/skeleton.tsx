import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[linear-gradient(90deg,var(--surface-container)_25%,var(--surface-container-high)_50%,var(--surface-container)_75%)]',
        '[background-size:200%_100%] animate-shimmer rounded-[var(--radius-lg)]',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
