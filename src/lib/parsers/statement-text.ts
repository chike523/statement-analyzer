const MONTH = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
const DATE = `\\d{1,2}\\s+(?:${MONTH})\\s+\\d{4}`
const AMOUNT = `[\\d,]+\\.\\d{2}|--`
const SIGNED_AMOUNT = `[+-][\\d,]+\\.\\d{2}`

// Matches a common tabular statement row:
// <posted datetime> <value date> <description> <debit> <credit> <balance>
const TABULAR_ROW_RE = new RegExp(
  `(?:${DATE}\\s+\\d{2}:\\d{2}:\\d{2})\\s+(${DATE})\\s+(.+?)\\s+(${AMOUNT})\\s+(${AMOUNT})\\s+(${AMOUNT})`,
  'gi',
)

const DATE_RE = new RegExp(DATE, 'gi')
const SIGNED_TAIL_RE = new RegExp(
  `(${SIGNED_AMOUNT})\\s+(${AMOUNT})(?:\\s+(\\S+))?(?:\\s+(\\S+))?`,
  'gi',
)

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

export type StatementTextRow = {
  date: string
  description: string
  amount: number
  balance?: number
  reference?: string
}

function parseMonthDate(value: string): string | null {
  const match = value
    .trim()
    .match(new RegExp(`^(\\d{1,2})\\s+(${MONTH})\\s+(\\d{4})$`, 'i'))
  if (!match) return null
  const day = Number(match[1])
  const month = MONTH_INDEX[match[2].toLowerCase()]
  const year = Number(match[3])
  if (month == null || day < 1 || day > 31 || year < 1900) return null
  // Build a calendar date without timezone shift from Date#toISOString.
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseAmountToken(token: string): number | null {
  if (!token || token === '--') return null
  const num = Number.parseFloat(token.replace(/,/g, ''))
  return Number.isFinite(num) ? num : null
}

/** `String.matchAll` can be missing or awkward on older mobile browsers. */
function matchAll(text: string, pattern: RegExp): RegExpExecArray[] {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const re = new RegExp(pattern.source, flags)
  const matches: RegExpExecArray[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    matches.push(match)
    if (match[0].length === 0) re.lastIndex += 1
  }
  return matches
}

function cleanDescription(value: string): string {
  return value
    .replace(/\b\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{2}:\d{2}:\s*\d{0,2}\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseTabularText(text: string): StatementTextRow[] {
  const rows: StatementTextRow[] = []
  const normalized = text.replace(/\s+/g, ' ')

  for (const match of matchAll(normalized, TABULAR_ROW_RE)) {
    const date = parseMonthDate(match[1])
    const description = cleanDescription(match[2])
    const debit = parseAmountToken(match[3])
    const credit = parseAmountToken(match[4])
    const balance = parseAmountToken(match[5]) ?? undefined

    if (!date || description.length < 2) continue

    let amount: number | null = null
    if (credit !== null && credit > 0) amount = credit
    else if (debit !== null && debit > 0) amount = -debit
    if (amount === null) continue

    rows.push({ date, description, amount, balance })
  }

  return rows
}

/**
 * Statements (e.g. OPay) that put a signed amount in a single Debit/Credit column:
 * `17 Feb 2025 Transfer from Jane +4,000.00 4,000.00 E-Channel REF`
 *
 * Match signed amount first, then walk back to the nearest value date so wrapped
 * descriptions and header date ranges cannot swallow rows.
 */
export function parseSignedDebitCreditText(text: string): StatementTextRow[] {
  const rows: StatementTextRow[] = []
  const normalized = text.replace(/\s+/g, ' ')
  let cursor = 0

  for (const match of matchAll(normalized, SIGNED_TAIL_RE)) {
    const amount = parseAmountToken(match[1])
    const balance = parseAmountToken(match[2]) ?? undefined
    if (amount === null) continue

    const amountIndex = match.index ?? -1
    if (amountIndex < cursor) continue

    const before = normalized.slice(cursor, amountIndex)
    const dateMatches = matchAll(before, DATE_RE)
    const dateMatch = dateMatches[dateMatches.length - 1]
    if (!dateMatch) continue

    const date = parseMonthDate(dateMatch[0])
    if (!date) continue

    const dateAt = dateMatch.index ?? 0
    let description = cleanDescription(before.slice(dateAt + dateMatch[0].length))
    // OPay often repeats the value date on the amount line with the description above it.
    if (description.length < 2) {
      description = cleanDescription(before.slice(0, dateAt))
    }
    if (description.length < 2) continue
    if (/^(opening|closing|total|current|start|end|date)\b/i.test(description)) continue
    if (/Trans\.?\s*Time|Value\s*Date|Debit\/Credit/i.test(description)) continue

    const channelOrRef = match[3]
    const maybeRef = match[4]
    const looksLikeRef = (value?: string) =>
      !!value && /^(?![A-Za-z]+$)[A-Za-z0-9]{10,}$/.test(value) && !/^(E-Channel|POS|USSD|ATM)$/i.test(value)
    const reference = looksLikeRef(maybeRef)
      ? maybeRef
      : looksLikeRef(channelOrRef)
        ? channelOrRef
        : undefined

    rows.push({ date, description, amount, balance, reference })
    cursor = amountIndex + match[0].length
  }

  return rows
}

export function parseGenericText(text: string): StatementTextRow[] {
  const signed = parseSignedDebitCreditText(text)
  if (signed.length > 0) return signed

  const tabular = parseTabularText(text)
  if (tabular.length > 0) return tabular

  const rows: StatementTextRow[] = []
  for (const line of text.split('\n')) {
    const dateMatch = line.match(new RegExp(`(${DATE})`, 'i'))
    if (!dateMatch) continue
    const date = parseMonthDate(dateMatch[1])
    const signedMatch = line.match(new RegExp(`(${SIGNED_AMOUNT})`))
    const amounts = line.match(/[\d,]+\.\d{2}/g)
    if (!date) continue

    let amount: number | null = null
    if (signedMatch) {
      amount = parseAmountToken(signedMatch[1])
    } else if (amounts?.length) {
      // Last unsigned amount is usually balance; prefer the one before it when present.
      const token = amounts.length >= 2 ? amounts[amounts.length - 2] : amounts[0]
      amount = parseAmountToken(token)
    }
    if (amount === null) continue

    rows.push({
      date,
      description: line
        .replace(dateMatch[0], '')
        .replace(/[+-]?[\d,]+\.\d{2}/g, '')
        .trim(),
      amount,
    })
  }
  return rows
}
