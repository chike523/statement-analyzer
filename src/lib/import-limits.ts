/**
 * Mobile Safari (and many Android browsers) kill the tab when JS heap or
 * decoded image memory spikes. Streaming (one page at a time) is the main
 * defense; these helpers tune scale / yields / soft file ceilings.
 */

export function isConstrainedDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const mobileUa = /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
  const coarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const lowMemory =
    'deviceMemory' in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number' &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
  return mobileUa || (coarsePointer && lowMemory) || lowMemory
}

export const IMPORT_LIMITS = {
  /** Canvas scale for OCR rasterization (lower = less RAM, slightly worse OCR). */
  ocrScaleDesktop: 2,
  ocrScaleMobile: 1.15,
  /**
   * Soft file-size ceilings. Streaming keeps pages workable past these, but a
   * single ArrayBuffer/blob still has to exist — beyond this we warn early.
   */
  maxPdfBytesDesktop: 80 * 1024 * 1024,
  maxPdfBytesMobile: 40 * 1024 * 1024,
  maxTabularBytesDesktop: 40 * 1024 * 1024,
  maxTabularBytesMobile: 25 * 1024 * 1024,
} as const

export function ocrRenderScale(): number {
  return isConstrainedDevice() ? IMPORT_LIMITS.ocrScaleMobile : IMPORT_LIMITS.ocrScaleDesktop
}

export function maxFileBytes(fileType: 'csv' | 'excel' | 'ofx' | 'pdf'): number {
  const constrained = isConstrainedDevice()
  if (fileType === 'pdf') {
    return constrained ? IMPORT_LIMITS.maxPdfBytesMobile : IMPORT_LIMITS.maxPdfBytesDesktop
  }
  return constrained ? IMPORT_LIMITS.maxTabularBytesMobile : IMPORT_LIMITS.maxTabularBytesDesktop
}

/** Yield to the browser so Safari's watchdog doesn't kill a long parse/OCR run. */
export function yieldToMain(ms?: number): Promise<void> {
  const delay = ms ?? (isConstrainedDevice() ? 16 : 0)
  return new Promise((resolve) => setTimeout(resolve, delay))
}
