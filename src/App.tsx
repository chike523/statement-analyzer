import { Suspense, lazy, useEffect, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { AppProvider, useApp } from '@/context/AppContext'
import { Tabs } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { WelcomeHero } from '@/components/onboarding/WelcomeHero'
import { ImportSuccessToast } from '@/components/layout/AppChrome'
import { PersistenceToggle } from '@/components/layout/PersistenceToggle'
import { countPendingDuplicates } from '@/lib/duplicates'
import { LandingPage } from '@/landing/LandingPage'

const UploadZone = lazy(() =>
  import('@/components/upload/UploadZone').then((m) => ({ default: m.UploadZone })),
)
const FilterBar = lazy(() =>
  import('@/components/filters/FilterBar').then((m) => ({ default: m.FilterBar })),
)
const TransactionTable = lazy(() =>
  import('@/components/table/TransactionTable').then((m) => ({ default: m.TransactionTable })),
)
const Dashboard = lazy(() =>
  import('@/components/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const RecurringPanel = lazy(() =>
  import('@/components/recurring/RecurringPanel').then((m) => ({ default: m.RecurringPanel })),
)
const ReviewPanel = lazy(() =>
  import('@/components/review/ReviewPanel').then((m) => ({ default: m.ReviewPanel })),
)
const ExportReportButton = lazy(() =>
  import('@/components/report/ExportReportButton').then((m) => ({ default: m.ExportReportButton })),
)

function PanelFallback() {
  return (
    <div className="flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-card)] py-16 text-[var(--color-muted-foreground)]">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  )
}

const ENTERED_APP_KEY = 'sa-entered-app'
const PREFER_LANDING_KEY = 'sa-prefer-landing'

function readWantsApp(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(PREFER_LANDING_KEY) === '1') return false
  return window.location.hash === '#app' || sessionStorage.getItem(ENTERED_APP_KEY) === '1'
}

function AppContent() {
  const {
    ready,
    transactionCount,
    duplicateGroups,
    recurringPatterns,
    activeTab,
    setActiveTab,
    importSummary,
    dismissImportSummary,
    accounts,
  } = useApp()

  const [inApp, setInApp] = useState(readWantsApp)
  const pendingDupes = countPendingDuplicates(duplicateGroups)
  const hasData = transactionCount > 0

  useEffect(() => {
    if (!importSummary) return
    const timer = setTimeout(dismissImportSummary, 6000)
    return () => clearTimeout(timer)
  }, [importSummary, dismissImportSummary])

  // Auto-enter the tool when saved data loads, unless the user chose Home.
  useEffect(() => {
    if (!hasData || inApp) return
    if (sessionStorage.getItem(PREFER_LANDING_KEY) === '1') return
    setInApp(true)
    sessionStorage.setItem(ENTERED_APP_KEY, '1')
    if (window.location.hash !== '#app') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#app`)
    }
  }, [hasData, inApp])

  const enterApp = () => {
    setInApp(true)
    sessionStorage.setItem(ENTERED_APP_KEY, '1')
    sessionStorage.removeItem(PREFER_LANDING_KEY)
    window.location.hash = 'app'
  }

  const backToLanding = () => {
    setInApp(false)
    sessionStorage.removeItem(ENTERED_APP_KEY)
    sessionStorage.setItem(PREFER_LANDING_KEY, '1')
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'transactions', label: 'Activity' },
    {
      id: 'review',
      label: pendingDupes > 0 ? `Review · ${pendingDupes}` : 'Review',
    },
    {
      id: 'recurring',
      label:
        recurringPatterns.length > 0 ? `Bills · ${recurringPatterns.length}` : 'Bills',
    },
  ]

  if (!ready && inApp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-[var(--color-mist)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-lime)]" />
          <p className="text-xs font-medium tracking-[0.06em] uppercase">Starting…</p>
        </div>
      </div>
    )
  }

  if (!inApp) {
    return (
      <LandingPage
        onStart={enterApp}
        startLabel={hasData ? 'Back to analyzer' : undefined}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-[env(safe-area-inset-bottom)] text-[var(--color-card-foreground)]">
      <div className="px-3 pt-3 sm:px-3">
        <header className="sticky top-3 z-40 rounded-[var(--radius-lg)] bg-[var(--color-card)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-[14px] w-[14px] shrink-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-lilac) 58%, var(--color-lime) 58%)',
                    }}
                    aria-hidden
                  />
                  <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.01em] uppercase sm:text-lg">
                    Analyzer
                  </span>
                </div>
                <p className="mt-1 truncate text-xs tracking-[0.04em] text-[var(--color-caption)] uppercase sm:text-[11px]">
                  {hasData
                    ? `${accounts.length} acct${accounts.length !== 1 ? 's' : ''} · ${transactionCount.toLocaleString()} txns`
                    : 'Import a statement to get started'}
                </p>
              </div>
              <button
                type="button"
                onClick={backToLanding}
                className="shrink-0 text-xs font-medium tracking-[0.06em] text-[var(--color-caption)] uppercase hover:text-[var(--color-foreground)] sm:hidden"
              >
                Home
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={backToLanding}
                className="hidden min-h-9 px-2 text-xs font-medium tracking-[0.06em] text-[var(--color-caption)] uppercase hover:text-[var(--color-foreground)] sm:inline"
              >
                Home
              </button>
              <PersistenceToggle />
              {hasData && (
                <>
                  <Suspense fallback={null}>
                    <ExportReportButton />
                  </Suspense>
                  <Button
                    variant="default"
                    size="sm"
                    className="min-h-9"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    Import
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-3 sm:py-3">
        {!hasData ? (
          <WelcomeHero />
        ) : (
          <>
            <div className="mb-3 rounded-[var(--radius-lg)] bg-[var(--color-graphite)] p-2 sm:p-2.5">
              <Tabs
                tabs={tabs}
                active={activeTab === 'upload' ? '' : activeTab}
                onChange={setActiveTab}
              />
            </div>

            <Suspense fallback={<PanelFallback />}>
              {activeTab === 'upload' && (
                <div className="mx-auto max-w-2xl space-y-4 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-4 sm:p-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-medium tracking-[0.06em] text-[var(--color-caption)] uppercase hover:text-[var(--color-foreground)]"
                  >
                    ← Back to overview
                  </button>
                  <UploadZone compact />
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-3">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-3 sm:p-4">
                    <FilterBar />
                  </div>
                  <Dashboard />
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-3 sm:p-4">
                    <FilterBar />
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-3 sm:p-4">
                    <TransactionTable />
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-3 sm:p-4">
                  <ReviewPanel />
                </div>
              )}
              {activeTab === 'recurring' && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-3 sm:p-4">
                  <RecurringPanel />
                </div>
              )}
            </Suspense>
          </>
        )}
      </main>

      {importSummary && (
        <ImportSuccessToast
          summary={importSummary}
          onDismiss={dismissImportSummary}
          onReviewDuplicates={() => {
            dismissImportSummary()
            setActiveTab('review')
          }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
