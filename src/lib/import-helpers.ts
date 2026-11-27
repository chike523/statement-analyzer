export type ImportSummary = {
  filename: string
  account_name: string
  row_count: number
  skipped_count: number
  duplicate_count: number
  currency: string
}

/** Soft institution cues used only when no explicit currency symbol/code is found. */
const INSTITUTION_CURRENCY: { pattern: RegExp; currency: string }[] = [
  {
    pattern:
      /gtbank|guaranty|access\s*bank|\baccess\b|kuda|moniepoint|opay|owallet|zenith|\buba\b|first\s*bank|fidelity|stanbic|wema|polaris|ecobank|providus|carbon|fairmoney|palm(?:pay)?/i,
    currency: 'NGN',
  },
  {
    pattern: /\b(chase|bank of america|wells fargo|capital one|ally bank|us bank|citi)\b/i,
    currency: 'USD',
  },
  {
    pattern: /\b(barclays|lloyds|natwest|hsbc uk|monzo|starling|revolut uk)\b/i,
    currency: 'GBP',
  },
  {
    pattern: /\b(deutsche bank|commerzbank|ing de|n26)\b/i,
    currency: 'EUR',
  },
]

export function suggestAccountName(filename: string): string {
  const base = filename
    .replace(/\.(pdf|csv|tsv|xlsx|xls|ofx|qfx)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\(\d+\)$/, '')
    .trim()

  if (/opay|owallet/i.test(base)) return 'OPay'
  if (/gtbank|guaranty/i.test(base)) return 'GTBank'
  if (/access/i.test(base)) return 'Access Bank'
  if (/kuda/i.test(base)) return 'Kuda'
  if (/moniepoint/i.test(base)) return 'Moniepoint'
  if (/zenith/i.test(base)) return 'Zenith'
  if (/\buba\b/i.test(base)) return 'UBA'
  if (/palmpay|palm\s*pay/i.test(base)) return 'PalmPay'

  const words = base.split(/\s+/).filter(Boolean)
  if (words.length <= 3) return words.join(' ') || 'Main Account'
  return words.slice(0, 2).join(' ') || 'Main Account'
}

/**
 * Infer currency from statement text / filename.
 * Returns null when unsure so the user must confirm at import.
 */
export function detectCurrencyFromText(text: string): string | null {
  if (!text.trim()) return null
  if (/₦|\bNGN\b|naira/i.test(text)) return 'NGN'
  if (/€|\bEUR\b/i.test(text)) return 'EUR'
  if (/£|\bGBP\b/i.test(text)) return 'GBP'
  if (/\$|\bUSD\b|\bdollars?\b/i.test(text)) return 'USD'
  if (/\bCAD\b|canadian\s+dollar/i.test(text)) return 'CAD'
  if (/\bAUD\b|australian\s+dollar/i.test(text)) return 'AUD'
  if (/\bKES\b|kenyan\s+shilling/i.test(text)) return 'KES'
  if (/\bGHS\b|cedi/i.test(text)) return 'GHS'
  if (/\bZAR\b|rand\b/i.test(text)) return 'ZAR'
  if (/\bINR\b|rupee/i.test(text)) return 'INR'

  for (const { pattern, currency } of INSTITUTION_CURRENCY) {
    if (pattern.test(text)) return currency
  }

  return null
}
