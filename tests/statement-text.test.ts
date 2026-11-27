import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  parseGenericText,
  parseSignedDebitCreditText,
} from '../src/lib/parsers/statement-text.ts'

const OPAY_SNIPPET = `
Trans. Time Value Date Description Debit/Credit(₦) Balance(₦) Channel Transaction Reference
2025 Feb 17 20:01: 02 17 Feb 2025 Transfer from ismail ogege +15,000.00 15,000.00 E-Channel 250217010100308411034412
2025 Feb 17 20:01: 03 17 Feb 2025 Electronic Money Transfer Levy -50.00 14,950.00 E-Channel 250217140200308411098034
2025 Feb 17 20:02: 03 17 Feb 2025 Auto-save to OWealth Balance -14,950.00 0.00 E-Channel 250217140200308556481057
2025 Feb 17 20:36: 04 17 Feb 2025 Transfer from ABDULJALIL LATEEF +6,000.00 6,000.00 E-Channel 250217010100308966932366
2025 Feb 17 20:37: 12 17 Feb 2025 Auto-save to OWealth Balance -6,000.00 0.00 E-Channel 250217140200308855816737
`

test('parseSignedDebitCreditText keeps debit signs and value dates', () => {
  const rows = parseSignedDebitCreditText(OPAY_SNIPPET)
  assert.equal(rows.length, 5)
  assert.equal(rows[0].date, '2025-02-17')
  assert.equal(rows[0].amount, 15000)
  assert.equal(rows[1].amount, -50)
  assert.equal(rows[2].amount, -14950)
  assert.equal(rows[1].description, 'Electronic Money Transfer Levy')
  assert.equal(rows[0].reference, '250217010100308411034412')
})

test('parseGenericText prefers signed Debit/Credit column over balance fallback', () => {
  const rows = parseGenericText(OPAY_SNIPPET)
  assert.equal(rows.filter((r) => r.amount < 0).length, 3)
  assert.equal(rows.filter((r) => r.amount > 0).length, 2)
})

test('parseSignedDebitCreditText handles pdf.js flattened OPay page text', () => {
  const flattened =
    '07 17 Feb 2025 Transfer from VICTORIA ABAH JOHN +4,000.00 4,000.00 E-Channel 100033250217214607090077833756 2025 Feb 17 21:47: 13 17 Feb 2025 Auto-save to OWealth Balance -4,000.00 0.00 E-Channel 250217140200310148295744 2025 Feb 17 21:55: 23 17 Feb 2025 Transfer from UDOKA KINGSLEY AMAMA +3,200.00 3,200.00 E-Channel 000013250217225523000157433024'
  const rows = parseSignedDebitCreditText(flattened)
  assert.equal(rows.length, 3)
  assert.deepEqual(
    rows.map((r) => r.amount),
    [4000, -4000, 3200],
  )
  assert.equal(rows[0].date, '2025-02-17')
})

test('full OPay statement text yields all signed movements', () => {
  const path = '/tmp/opay-test/full.txt'
  let text: string
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    // Fixture is produced locally during debugging; skip if absent.
    return
  }
  const rows = parseGenericText(text)
  assert.equal(rows.length, 3095)
  assert.equal(rows.filter((r) => r.amount < 0).length, 890)
  assert.equal(rows.filter((r) => r.amount > 0).length, 2205)
})

test('OPay alphanumeric OWealth references are captured', () => {
  const text =
    '02 Mar 2025 OWealth Interest Earned +0.27 833.31 E-Channel 250302991p4yDtkRpkifQtm68slFpE'
  const rows = parseSignedDebitCreditText(text)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].amount, 0.27)
  assert.equal(rows[0].reference, '250302991p4yDtkRpkifQtm68slFpE')
})
