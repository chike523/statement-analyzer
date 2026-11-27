import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)]">
        <Icon className="h-5 w-5 text-[var(--color-muted-foreground)]" aria-hidden />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[-0.01em]">
        {title}
      </h3>
      <p className="mt-2 max-w-[36ch] text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {action && (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
