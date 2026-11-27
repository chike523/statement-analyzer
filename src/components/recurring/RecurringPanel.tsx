import { RefreshCw, Upload } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'

export function RecurringPanel() {
  const { recurringPatterns, accounts, transactionCount, setActiveTab } = useApp()

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]))

  if (transactionCount === 0) {
    return (
      <EmptyState
        icon={Upload}
        title="No bills detected yet"
        description="Import statements to spot subscriptions and regular payments."
        action={{ label: 'Import a statement', onClick: () => setActiveTab('upload') }}
      />
    )
  }

  if (recurringPatterns.length === 0) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="No recurring bills found"
        description="Need at least three similar debits at regular intervals. Import another month if you can."
        action={{ label: 'Import another statement', onClick: () => setActiveTab('upload') }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {recurringPatterns.map((pattern) => (
        <Card key={pattern.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm capitalize">{pattern.merchant}</CardTitle>
              <Badge variant="outline">{pattern.interval}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Amount</span>
              <span className="font-medium text-[var(--color-destructive)]">
                {formatCurrency(pattern.amount, accountMap[pattern.account_id]?.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Account</span>
              <span>{accountMap[pattern.account_id]?.name ?? pattern.account_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Occurrences</span>
              <span>{pattern.transaction_ids.length}</span>
            </div>
            {pattern.next_expected && (
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Next expected</span>
                <span>{formatDate(pattern.next_expected)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Confidence</span>
              <span>{Math.round(pattern.confidence * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
