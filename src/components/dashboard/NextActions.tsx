import { useState } from 'react'
import { AlertTriangle, Download, RefreshCw, List, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { countPendingDuplicates } from '@/lib/duplicates'
import { generateReportMarkdown, reportFilename } from '@/lib/report'
import { downloadTextFile } from '@/lib/download'
import { cn } from '@/lib/utils'

type NextAction = {
  id: string
  title: string
  description: string
  icon: typeof List
  onClick: () => void
  emphasize?: boolean
  busy?: boolean
}

export function NextActions() {
  const {
    accounts,
    importBatches,
    filters,
    ignoredIds,
    dashboardPrefs,
    transferPairs,
    transferIds,
    rejectedTransferPairIds,
    duplicateGroups,
    recurringPatterns,
    setActiveTab,
  } = useApp()
  const [exporting, setExporting] = useState(false)

  const pendingDupes = countPendingDuplicates(duplicateGroups)
  const actions: NextAction[] = []

  if (pendingDupes > 0) {
    actions.push({
      id: 'review-dupes',
      title: `Review ${pendingDupes} possible duplicate${pendingDupes === 1 ? '' : 's'}`,
      description: 'Confirm or dismiss flagged charges so totals stay honest',
      icon: AlertTriangle,
      onClick: () => setActiveTab('review'),
      emphasize: true,
    })
  } else if (transferPairs.length > 0) {
    actions.push({
      id: 'review-transfers',
      title: 'Check internal transfers',
      description: `${transferPairs.length} move${transferPairs.length === 1 ? '' : 's'} between your accounts`,
      icon: AlertTriangle,
      onClick: () => setActiveTab('review'),
    })
  }

  if (recurringPatterns.length > 0) {
    actions.push({
      id: 'bills',
      title: `See ${recurringPatterns.length} recurring bill${recurringPatterns.length === 1 ? '' : 's'}`,
      description: 'Subscriptions and regular payments we detected',
      icon: RefreshCw,
      onClick: () => setActiveTab('recurring'),
    })
  }

  actions.push({
    id: 'activity',
    title: 'Browse every transaction',
    description: 'Search, filter, and scroll the full activity list',
    icon: List,
    onClick: () => setActiveTab('transactions'),
  })

  actions.push({
    id: 'export',
    title: exporting ? 'Preparing summary…' : 'Export a summary',
    description: 'Download a report for an advisor or AI',
    icon: exporting ? Loader2 : Download,
    busy: exporting,
    onClick: async () => {
      if (exporting) return
      setExporting(true)
      try {
        const markdown = await generateReportMarkdown({
          accounts,
          importBatches,
          filters,
          ignoredIds,
          dashboardPrefs,
          transferPairs,
          transferIds,
          rejectedTransferPairIds,
          duplicateGroups,
          recurringPatterns,
        })
        downloadTextFile(markdown, reportFilename())
      } finally {
        setExporting(false)
      }
    },
  })

  const shown = actions.slice(0, 3)

  return (
    <section aria-label="Suggested next steps" className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.04em]">
        Next
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={action.onClick}
                className={cn(
                  'flex w-full items-start gap-3 rounded-[var(--radius-lg)] border-[1.5px] px-3 py-3 text-left transition-colors',
                  action.emphasize
                    ? 'border-[var(--color-background)] bg-[var(--color-lime)]'
                    : 'border-[var(--color-mist)] bg-[var(--color-card)] hover:border-[var(--color-background)]',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    action.emphasize ? 'bg-[var(--color-background)] text-[var(--color-lime)]' : 'bg-[var(--color-muted)]',
                  )}
                >
                  <Icon className={cn('h-4 w-4', action.busy && 'animate-spin')} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug">{action.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">
                    {action.description}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
