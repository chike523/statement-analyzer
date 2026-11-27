---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# App shell — Statement Analyzer

Mode: Operate
Audience: Consumers analyzing their own statements after entering from the marketing homepage.
Task: Import statements; scan Overview / Activity / Review / Bills; export; optional on-device save.
Constraints: Inherit Kurvo visual world from DESIGN.md. Preserve all existing flows and copy facts. No glass/shadow chrome. CTA continuity from landing.

## Direction contract

THESIS: The analyzer sits in the same charcoal-framed, pill-and-flat-panel world as the marketing page — refuse soft blue SaaS chrome and glass sticky headers.
OWN-WORLD: Kurvo tokens (#232323 frame, #f2f4f5 panels, lime #d8f45f signal, lilac #8d91e6 accent), TikTok Sans for product title, Geist for UI, pills 999px, panels 26px, no shadows.
STORY: User recognizes they are still in Statement Analyzer, imports a file, and works tabs without a visual break from the landing.
FIRST VIEWPORT: Charcoal page ground with 12px gutter; off-white sticky header panel (no blur); Analyzer wordmark + meta; lime/charcoal pill actions; pill tab strip; main content in framed panels.
FORM: seed: none (pinned) — extension of user-pinned Kurvo world into Operate app chrome.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: pill tabs with charcoal active state; Import as charcoal pill; Save-on-device as quiet control.
