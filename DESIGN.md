# Design System — Statement Analyzer (marketing)

<!-- impeccable:design-schema 1 -->

## Overview

Marketing surfaces for Statement Analyzer use the **Kurvo** visual grammar (8B / MIT): a charcoal frame around flat color panels, elastic uppercase display type, and pill controls. Product truth stays local-first privacy; demo figures are labeled illustrative.

## Colors

| Token | Hex | Role |
|---|---|---|
| `--color-1` | `#232323` | Charcoal frame, notches, dark buttons, chart line |
| `--color-2` | `#c5d8d8` | Mint panels |
| `--color-3` | `#f2f4f5` | Off-white hero / stories / phone screen |
| `--color-4` | `#8d91e6` | Lilac panels and chart bars |
| `--color-5` | `#d8f45f` | Lime signal (today, tags, dark-panel CTAs) |
| `--color-6` | `#444444` | Graphite panels |
| `--color-7` | `#a4c3bd` | Sage easy-day bars |
| `--color-8` | `#c2c2c2` | Secondary text on dark |
| `--color-9` | `#4f5552` | Captions on light |

No shadows, glass, or decorative gradients except the mint fade behind chart tracks.

## Typography

- **Display:** TikTok Sans 500/600, `font-stretch` 75–150%, uppercase headlines
- **Body / UI:** Geist 400/500
- Headings animate width on enter when motion is enabled

## Layout

- `12px` charcoal gutter frames every panel
- Panels: `26px` radius; pills: `999px`; phone: `46px` / screen `35px`
- Corner notch tabs hold section titles after the hero
- No max-width container; text measures stay ~30–62ch

## Components

- Charcoal / lime pill buttons with stretch labels on hover
- Outline cue badges; lime filled tags
- Capability rows as full-width pills
- CSS phone with wipe-up screen stack
- Native FAQ `<details>`

## Motion

- Elastic stretch on display headings
- Drop-in lime tags
- Chart bar grow on load
- Sticky phone scrub with wipe-up views
- Contact panel shade shrinks away on enter
- Respects `prefers-reduced-motion`

## Surfaces

- Marketing homepage: `src/landing/LandingPage.tsx`
- App shell (Operate): `src/App.tsx` — charcoal page ground, 12px gutters, off-white header panel, graphite pill tab strip with lime active state, content in flat rounded panels; shared tokens in `src/index.css`
