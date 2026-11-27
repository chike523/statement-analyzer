# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want to understand their own bank statements — income, spending, recurring bills, and odd charges — without sending financial data to a server. Primary audience is everyday consumers reviewing their own money; advisors are a secondary audience via the exportable summary.

## Product Purpose

Statement Analyzer turns bank statement files (CSV, Excel, OFX/QFX, digital PDF, scanned PDF) into a clear local overview: cash flow, top payees, recurring bills, duplicate flags, and internal transfers. Success means the visitor can import a statement in the browser and leave with clarity (and optionally a shareable Markdown summary) without anything leaving their device.

## Positioning

100% private, local-first analysis: parsing, DuckDB-WASM SQL, OCR, and reporting all run in the browser tab. No account required for the core flow. Neighboring “upload your statements to our cloud” tools cannot truthfully claim the same boundary.

## Operating Context

Visitor lands on a marketing homepage, then enters the in-app import flow (drag-and-drop CSV/PDF). After import they use Overview, Activity, Review, and Bills tabs, then optionally export a report or enable “Save on device” (IndexedDB only).

## Capabilities and Constraints

- Formats: CSV, Excel, OFX/QFX, digital PDF, scanned PDF (on-device OCR)
- Analysis: income/expense, merchants, recurring, duplicates, transfers, multi-account
- Export: Markdown financial summary generated client-side
- No backend; GitHub Pages static hosting
- Undecided: monetization, accounts/auth, mobile apps

## Brand Commitments

- Product name: **Statement Analyzer** (confirmed; no separate brand rename for now)
- Binding visual reference for the marketing homepage: the Kurvo fitness landing template on 21st.dev / 8B (`fitness-app-landing-page-template`) — charcoal frame, mint/lilac/lime panels, elastic uppercase display type, pill shapes, CSS scroll motion — adapted to this product’s finance story, not fitness copy

## Evidence on Hand

- Live app and README feature set at `README.md`
- Working SPA under `src/`
- No real customer testimonials, logos, or benchmarks yet — do not invent commercial claims; synthetic demo figures on the landing page must be labeled as illustrative

## Product Principles

1. Privacy is the product: never imply server upload of statements.
2. Show the mechanism (import → local analysis → clarity), don’t only claim it.
3. Keep the path to first import short from the marketing CTA.
4. Prefer honest, specific capability copy over invented social proof.
5. Portfolio-grade craft without abandoning real product truth.
