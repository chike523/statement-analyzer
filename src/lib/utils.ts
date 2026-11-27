import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_LOCALE: Record<string, string> = {
  NGN: 'en-NG',
  EUR: 'de-DE',
  GBP: 'en-GB',
  USD: 'en-US',
  CAD: 'en-CA',
  AUD: 'en-AU',
  KES: 'en-KE',
  GHS: 'en-GH',
  ZAR: 'en-ZA',
  INR: 'en-IN',
}

/** Format with ISO currency when known; plain grouped number when currency is still undecided. */
export function formatCurrency(amount: number, currency?: string | null): string {
  if (!currency) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
      signDisplay: 'auto',
    }).format(amount)
  }
  const locale = CURRENCY_LOCALE[currency] ?? undefined
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      signDisplay: 'auto',
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatDate(date: string): string {
  if (!date) return '-'
  const normalized = date.slice(0, 10)
  const parsed = new Date(`${normalized}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

export function generateId(): string {
  return crypto.randomUUID()
}
