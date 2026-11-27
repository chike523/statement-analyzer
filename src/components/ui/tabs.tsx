import { cn } from '@/lib/utils'

type TabsProps = {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex w-full gap-1 rounded-[var(--radius-pill)] p-0.5',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'min-h-10 min-w-0 flex-1 rounded-[var(--radius-pill)] px-1.5 py-2 text-center text-[11px] font-medium tracking-[0.04em] uppercase transition-colors sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.06em]',
            active === tab.id
              ? 'bg-[var(--color-lime)] text-[var(--color-accent-foreground)]'
              : 'text-[var(--color-mist)] hover:bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] hover:text-[var(--color-card)]',
          )}
        >
          <span className="block truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
