import { cn } from '@/lib/utils'

type BadgeProps = {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium tracking-[0.02em]',
        variant === 'default' && 'bg-[var(--color-lime)] text-[var(--color-accent-foreground)]',
        variant === 'secondary' && 'bg-[var(--color-mint)] text-[var(--color-foreground)]',
        variant === 'destructive' &&
          'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]',
        variant === 'outline' &&
          'border-[1.5px] border-current bg-transparent text-[var(--color-foreground)]',
        className,
      )}
    >
      {children}
    </span>
  )
}
