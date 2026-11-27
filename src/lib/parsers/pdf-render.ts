import '@/lib/polyfills'
import { loadPdfJs } from '@/lib/parsers/pdfjs'
import { ocrRenderScale, yieldToMain } from '@/lib/import-limits'

export type PdfSource = File | ArrayBuffer | Uint8Array | string

type PdfDocument = Awaited<
  ReturnType<Awaited<ReturnType<typeof loadPdfJs>>['getDocument']>['promise']
>

export type OpenedPdf = {
  pdf: PdfDocument
  /** Revoke when finished if we created an object URL. */
  revoke?: () => void
}

/**
 * Open a PDF without copying the whole file into a second ArrayBuffer when
 * possible. File → blob URL lets pdf.js stream pages from the blob.
 */
export async function openPdf(source: PdfSource): Promise<OpenedPdf> {
  const pdfjsLib = await loadPdfJs()
  const opts = {
    useWorkerFetch: false,
    isEvalSupported: false,
  }

  if (typeof source === 'string') {
    const pdf = await pdfjsLib.getDocument({
      url: source,
      ...opts,
    } as Parameters<typeof pdfjsLib.getDocument>[0]).promise
    return { pdf }
  }

  if (typeof File !== 'undefined' && source instanceof File) {
    const url = URL.createObjectURL(source)
    try {
      const pdf = await pdfjsLib.getDocument({
        url,
        ...opts,
      } as Parameters<typeof pdfjsLib.getDocument>[0]).promise
      return {
        pdf,
        revoke: () => URL.revokeObjectURL(url),
      }
    } catch (err) {
      URL.revokeObjectURL(url)
      throw err
    }
  }

  const data =
    source instanceof Uint8Array
      ? source
      : new Uint8Array(source as ArrayBuffer)

  const pdf = await pdfjsLib.getDocument({
    data,
    ...opts,
  } as Parameters<typeof pdfjsLib.getDocument>[0]).promise
  return { pdf }
}

/**
 * Rasterize pages one at a time. The ImageData from page N must be finished
 * (and preferably transferred) before page N+1 is rendered.
 */
export async function forEachPdfPageImage(
  source: PdfSource,
  options: {
    scale?: number
    onPage: (pageIndex: number, imageData: ImageData, total: number) => Promise<void>
  },
): Promise<{ processed: number; total: number }> {
  const opened = await openPdf(source)
  try {
    const total = opened.pdf.numPages
    const scale = options.scale ?? ocrRenderScale()

    for (let pageNum = 1; pageNum <= total; pageNum++) {
      const page = await opened.pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        throw new Error('Could not create canvas for OCR')
      }

      await page.render({ canvasContext: ctx, viewport }).promise
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = 0
      canvas.height = 0
      page.cleanup()

      await options.onPage(pageNum - 1, imageData, total)
      await yieldToMain()
    }

    await opened.pdf.destroy()
    return { processed: total, total }
  } finally {
    opened.revoke?.()
  }
}
