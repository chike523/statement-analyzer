import '@/lib/polyfills'
import type { ParsedRow } from '@/types/transaction'
import { parseGenericText } from '@/lib/parsers/statement-text'
import { rowsToTransactions } from '@/lib/parsers/shared'
import { isConstrainedDevice, yieldToMain } from '@/lib/import-limits'
import { forEachPdfPageImage, openPdf, type PdfSource } from '@/lib/parsers/pdf-render'

export type PdfParseOutput = {
  rows: ParsedRow[]
  page_count: number
  has_text_layer: boolean
  raw_text_preview: string
}

function toParsedRows(
  rows: { date: string; description: string; amount: number }[],
  filename: string,
  tag: string,
): ParsedRow[] {
  return rows.map((r, i) => ({
    ...r,
    raw_source: `${filename}:${tag} ${i + 1}`,
  }))
}

/** Prefer unique date+amount+description so page-overlap carry doesn't double-count. */
function dedupeRows(rows: ParsedRow[]): ParsedRow[] {
  const seen = new Set<string>()
  const out: ParsedRow[] = []
  for (const row of rows) {
    const key = `${row.date}|${row.amount}|${row.description}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

/**
 * Extract transactions page-by-page so we never hold the full document text
 * in memory. Works for long digital statements on phones.
 */
export async function parsePdfBuffer(
  source: PdfSource,
  filename: string,
  onProgress?: (page: number, total: number) => void,
): Promise<PdfParseOutput> {
  const opened = await openPdf(source)
  try {
    const { pdf } = opened
    const pageCount = pdf.numPages
    const rows: ParsedRow[] = []
    let totalTextLength = 0
    let preview = ''
    // Short carry so a transaction split across a page break can still match.
    let carry = ''

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      onProgress?.(pageNum, pageCount)
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      page.cleanup()

      totalTextLength += pageText.length
      if (preview.length < 2000) {
        preview = `${preview} ${pageText}`.slice(0, 2000)
      }

      const chunk = `${carry}\n${pageText}`
      const parsed = parseGenericText(chunk)
      rows.push(...toParsedRows(parsed, filename, `p${pageNum}`))
      carry = pageText.slice(-400)

      await yieldToMain()
    }

    await pdf.destroy()

    return {
      rows: dedupeRows(rows),
      page_count: pageCount,
      has_text_layer: totalTextLength > 50,
      raw_text_preview: preview,
    }
  } finally {
    opened.revoke?.()
  }
}

export async function parseOcrText(text: string, filename: string): Promise<PdfParseOutput> {
  const parsed = parseGenericText(text)
  return {
    rows: toParsedRows(parsed, filename, 'ocr-line'),
    page_count: 1,
    has_text_layer: true,
    raw_text_preview: text.slice(0, 2000),
  }
}

export async function pdfRowsToTransactions(
  rows: ParsedRow[],
  accountId: string,
  batchId: string,
  currency: string,
): Promise<import('@/types/transaction').Transaction[]> {
  return rowsToTransactions(rows, accountId, batchId, currency)
}

/**
 * OCR every page, one at a time. ImageData is transferred to the worker so the
 * main-thread copy is released immediately. Page text is parsed into rows and
 * discarded — we never accumulate the full OCR string for a long statement.
 */
export async function runOcrOnPdf(
  source: PdfSource,
  onProgress: (page: number, total: number) => void,
  filename = 'statement.pdf',
): Promise<PdfParseOutput> {
  const worker = new Worker(new URL('@/workers/ocr.worker.ts', import.meta.url), { type: 'module' })
  const rows: ParsedRow[] = []
  let preview = ''
  let pageCount = 0
  let carry = ''
  const pauseMs = isConstrainedDevice() ? 32 : 8

  try {
    await forEachPdfPageImage(source, {
      onPage: async (pageIndex, imageData, total) => {
        pageCount = total
        onProgress(pageIndex + 1, total)

        const pageText = await new Promise<string>((resolve, reject) => {
          const onMessage = (
            event: MessageEvent<import('@/workers/ocr.worker').OcrWorkerResponse>,
          ) => {
            const data = event.data
            if (data.type === 'page_result' && data.pageIndex === pageIndex) {
              worker.removeEventListener('message', onMessage)
              worker.removeEventListener('error', onError)
              resolve(data.text)
            } else if (data.type === 'error') {
              worker.removeEventListener('message', onMessage)
              worker.removeEventListener('error', onError)
              reject(new Error(data.message))
            }
          }
          const onError = (event: ErrorEvent) => {
            worker.removeEventListener('message', onMessage)
            worker.removeEventListener('error', onError)
            reject(new Error(event.message || 'OCR worker failed'))
          }
          worker.addEventListener('message', onMessage)
          worker.addEventListener('error', onError)

          // Transfer the underlying buffer so this ImageData is neutered here.
          worker.postMessage(
            {
              type: 'ocr_page',
              pageIndex,
              imageData,
            },
            [imageData.data.buffer],
          )
        })

        if (preview.length < 2000) {
          preview = `${preview}\n${pageText}`.slice(0, 2000)
        }

        const chunk = `${carry}\n${pageText}`
        const parsed = parseGenericText(chunk)
        rows.push(...toParsedRows(parsed, filename, `ocr-p${pageIndex + 1}`))
        carry = pageText.slice(-400)

        await yieldToMain(pauseMs)
      },
    })
  } finally {
    worker.terminate()
  }

  return {
    rows: dedupeRows(rows),
    page_count: pageCount,
    has_text_layer: false,
    raw_text_preview: preview,
  }
}
