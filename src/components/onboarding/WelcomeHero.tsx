import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

const UploadZone = lazy(() =>
  import('@/components/upload/UploadZone').then((m) => ({ default: m.UploadZone })),
)

export function WelcomeHero() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 rounded-[var(--radius-lg)] bg-[var(--color-card)] px-5 py-8 sm:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] sm:text-4xl">
          Drop a
          <br />
          statement
        </h2>
        <p className="mt-4 max-w-[40ch] text-base text-[var(--color-muted-foreground)] sm:text-lg">
          See income, spending, and bills, without anything leaving this device.
        </p>
        <p className="mt-3 text-xs font-medium tracking-[0.06em] text-[var(--color-caption)] uppercase">
          Processed in your browser · Nothing is uploaded
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center rounded-[var(--radius-lg)] border-[1.5px] border-dashed border-[var(--color-mist)] bg-[var(--color-card)] py-16 text-[var(--color-muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <UploadZone />
      </Suspense>
    </div>
  )
}
