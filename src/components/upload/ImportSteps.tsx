import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Import' },
]

type ImportStepsProps = {
  current: 1 | 2 | 3
  className?: string
}

export function ImportSteps({ current, className }: ImportStepsProps) {
  return (
    <ol
      className={cn(
        'flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-card)] px-4 py-3',
        className,
      )}
    >
      {STEPS.map((step, i) => {
        const done = step.id < current
        const active = step.id === current
        return (
          <li key={step.id} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-[var(--color-mist)] sm:w-10" />}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  done && 'bg-[var(--color-background)] text-[var(--color-card)]',
                  active && !done && 'bg-[var(--color-lime)] text-[var(--color-accent-foreground)]',
                  !done && !active && 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium tracking-[0.04em] uppercase sm:inline',
                  active ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]',
                )}
              >
                {step.label}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
