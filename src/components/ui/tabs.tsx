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
      className={cn(
        '-mx-1 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div className="flex min-w-full gap-1 rounded-[var(--radius-pill)] p-0.5 sm:min-w-0 sm:flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'min-h-10 shrink-0 rounded-[var(--radius-pill)] px-4 py-2 text-xs font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors sm:min-h-0 sm:flex-1 sm:py-2.5',
              active === tab.id
                ? 'bg-[var(--color-lime)] text-[var(--color-accent-foreground)]'
                : 'text-[var(--color-mist)] hover:bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] hover:text-[var(--color-card)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
