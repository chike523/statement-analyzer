import { createWorker } from 'tesseract.js'

export type OcrWorkerResponse =
  | { type: 'progress'; pageIndex: number; progress: number }
  | { type: 'page_result'; pageIndex: number; text: string }
  | { type: 'complete'; text: string }
  | { type: 'error'; message: string }

export type OcrPageRequest =
  | {
      type: 'ocr_pages'
      pages: { pageIndex: number; imageData: ImageData }[]
    }
  | {
      type: 'ocr_page'
      pageIndex: number
      imageData: ImageData
    }

let worker: Awaited<ReturnType<typeof createWorker>> | null = null

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng')
  }
  return worker
}

self.onmessage = async (event: MessageEvent<OcrPageRequest>) => {
  try {
    const msg = event.data
    const w = await getWorker()

    if (msg.type === 'ocr_page') {
      self.postMessage({
        type: 'progress',
        pageIndex: msg.pageIndex,
        progress: 0,
      } satisfies OcrWorkerResponse)

      const result = await w.recognize(
        msg.imageData as unknown as Parameters<typeof w.recognize>[0],
      )

      self.postMessage({
        type: 'page_result',
        pageIndex: msg.pageIndex,
        text: result.data.text,
      } satisfies OcrWorkerResponse)
      return
    }

    // Legacy batch path (kept for callers that still send all pages at once).
    const { pages } = msg
    const texts: string[] = []

    for (const page of pages) {
      self.postMessage({
        type: 'progress',
        pageIndex: page.pageIndex,
        progress: 0,
      } satisfies OcrWorkerResponse)

      const result = await w.recognize(page.imageData as unknown as Parameters<typeof w.recognize>[0])
      texts[page.pageIndex] = result.data.text

      self.postMessage({
        type: 'page_result',
        pageIndex: page.pageIndex,
        text: result.data.text,
      } satisfies OcrWorkerResponse)
    }

    self.postMessage({
      type: 'complete',
      text: texts.filter(Boolean).join('\n'),
    } satisfies OcrWorkerResponse)
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'OCR failed',
    } satisfies OcrWorkerResponse)
  }
}
