import { CheckCircle2, Upload } from 'lucide-react'
import { DuplicatePanel } from '@/components/duplicates/DuplicatePanel'
import { TransfersPanel } from '@/components/transfers/TransfersPanel'
import { EmptyState } from '@/components/ui/empty-state'
import { useApp } from '@/context/AppContext'
import { countPendingDuplicates } from '@/lib/duplicates'

export function ReviewPanel() {
  const {
    transactionCount,
    duplicateGroups,
    transferPairs,
    setActiveTab,
  } = useApp()
  const pendingDupes = countPendingDuplicates(duplicateGroups)

  if (transactionCount === 0) {
    return (
      <EmptyState
        icon={Upload}
        title="Nothing to review"
        description="Import statements first. We’ll flag possible duplicates and transfers here."
        action={{ label: 'Import a statement', onClick: () => setActiveTab('upload') }}
      />
    )
  }

  if (pendingDupes === 0 && transferPairs.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="You’re clear"
        description="No pending duplicates or internal transfers to review right now."
        action={{ label: 'Back to overview', onClick: () => setActiveTab('dashboard') }}
      />
    )
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-base font-semibold">Duplicates</h2>
        <DuplicatePanel embedded />
      </section>
      <section>
        <h2 className="mb-4 text-base font-semibold">Internal transfers</h2>
        <TransfersPanel embedded />
      </section>
    </div>
  )
}
