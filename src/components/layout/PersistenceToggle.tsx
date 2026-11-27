import { HardDrive, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Switch } from '@/components/ui/switch'

export function PersistenceToggle() {
  const { persistenceSupported, persistenceEnabled, persistenceBusy, setPersistence } = useApp()

  if (!persistenceSupported) return null

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] sm:gap-2"
      title={
        persistenceEnabled
          ? 'Your data is saved in this browser and will still be here after a refresh. It never leaves your device.'
          : 'Data is kept only for this session. Turn on to save it in this browser (on-device only).'
      }
    >
      {persistenceBusy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <HardDrive className="h-3.5 w-3.5" aria-hidden />
      )}
      <label
        htmlFor="persist-toggle"
        className="cursor-pointer text-xs font-medium tracking-[0.04em] uppercase sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal"
      >
        <span className="sm:hidden">Save</span>
        <span className="hidden sm:inline">Save on device</span>
      </label>
      <Switch
        id="persist-toggle"
        checked={persistenceEnabled}
        disabled={persistenceBusy}
        aria-label="Save on device"
        onCheckedChange={(checked) => {
          void setPersistence(checked)
        }}
      />
    </div>
  )
}
