import type { ImportSummary } from '@/lib/import-helpers'
import { Toast } from '@/components/ui/toast'

type ImportSuccessToastProps = {
  summary: ImportSummary
  onDismiss: () => void
  onReviewDuplicates?: () => void
}

export function ImportSuccessToast({ summary, onDismiss, onReviewDuplicates }: ImportSuccessToastProps) {
  const hasDupes = summary.duplicate_count > 0
  const detail = [
    summary.filename,
    summary.skipped_count > 0 ? `${summary.skipped_count} rows skipped` : null,
    hasDupes ? `${summary.duplicate_count} possible duplicates` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Toast
      message={
        hasDupes
          ? `${summary.row_count.toLocaleString()} imported · ${summary.duplicate_count} to review`
          : `${summary.row_count.toLocaleString()} transactions imported to ${summary.account_name}`
      }
      detail={detail || undefined}
      action={
        hasDupes && onReviewDuplicates
          ? { label: `Review ${summary.duplicate_count} duplicate${summary.duplicate_count === 1 ? '' : 's'}`, onClick: onReviewDuplicates }
          : undefined
      }
      onDismiss={onDismiss}
    />
  )
}
