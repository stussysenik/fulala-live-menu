# FULALA Live Menu

Real-time restaurant menu display for [Fulala](https://fulala.cz). Powers `menu.fulala.cz` standalone and embeds inside `fulala.cz/menu`. Updates instantly when staff changes anything — prices, availability, weekly rotation.

**Live:** [menu.fulala.cz](https://menu.fulala.cz)

## Quick Start

```bash
bun install
bun run dev:all          # SvelteKit + Convex
```

Open [localhost:5173](http://localhost:5173)

## Stack

- **SvelteKit 2** + Svelte 5
- **Convex** (real-time database)
- **Vanilla CSS** with CSS variables (theme system)
- **Vercel** (auto-deploy from `main`, region: fra1)
- **Bun** (runtime)

## Routes

| Route | For | What |
|-------|-----|------|
| `/` | Customers | Main menu (mobile/web) |
| `/tv-dumplings` | TV | Vertical TV — steamed dumplings (portrait) |
| `/tv-noodles` | TV | Vertical TV — noodle soups (portrait) |
| `/tv-info` | TV | Vertical TV — highlights, discounts, allergens |
| `/tv-dumplings-valentine` | TV | Valentine's Day — dumplings (seasonal) |
| `/tv-noodles-valentine` | TV | Valentine's Day — noodle soups (seasonal) |
| `/tv-info-valentine` | TV | Valentine's Day — info & drinks (seasonal) |
| `/order` | Customers | Cart + checkout |
| `/admin` | Staff | Menu CRUD, categories |
| `/admin/theme` | Staff | Colors, fonts, currency config |
| `/admin/layout` | Staff | 4 display layouts with per-page config |
| `/admin/events` | Staff | Event packages, catering, school meals |
| `/admin/analytics` | Staff | Session tracking |

## Features

- **Real-time** — Convex WebSocket subscriptions, ~200ms update propagation
- **Bilingual** — Czech + English toggle, Chinese characters on items
- **Multi-currency** — CZK (default), EUR, USD, CNY with configurable rates
- **Multi-tier pricing** — Dumplings sold by 4ks/6ks/12ks (salty) and 3ks/6ks/9ks (sweet)
- **4 layouts** — Standard list, dim sum grid, card grid, traditional Chinese order sheet
- **Per-page layouts** — Different layouts for display vs ordering pages
- **EU allergens** — Full 14-allergen system with sub-types (1a wheat, 1b rye, etc.)
- **Weekly schedule** — Auto-displays current week number and date range
- **Theme system** — Customizable colors, fonts, spacing with live preview
- **Vertical TV** — 3 dedicated portrait routes for LG 43" TVs (`/tv-dumplings`, `/tv-noodles`, `/tv-info`)
- **Seasonal themes** — Valentine's Day TV routes with warm cream, fortune gold, SVG decorations
- **TV design system** — Token-driven CSS, 180px food images, 24px minimum font, Playwright legibility tests
- **Storybook** — Component development and visual verification at port 6006
- **Customer ordering** — Session-based cart with modifiers (noodle type, spice, etc.)

## Architecture

```
fulala-live-menu/
├── src/
│   ├── routes/           # Pages (menu, tv, order, admin)
│   ├── lib/
│   │   ├── components/   # MenuItem, Category, AllergenLegend, ...
│   │   │   └── tv/       # TV-optimized portrait display components + Storybook stories
│   │   ├── design/      # TV design system docs
│   │   ├── stores/       # Currency, order cart
│   │   ├── i18n/         # Czech + English
│   │   ├── currency/     # Multi-currency formatting + conversion
│   │   ├── allergens/    # EU 14-allergen data
│   │   └── theme/        # Default theme config
├── convex/               # 14 tables, CRUD, settings, analytics
└── tests/                # Playwright E2E
```

## Commands

| Command | What |
|---------|------|
| `bun run dev` | SvelteKit only |
| `bun run dev:backend` | Convex only |
| `bun run dev:all` | Both |
| `bun run build` | Production build |
| `bun run test` | Playwright E2E |
| `bun run storybook` | Storybook dev (port 6006) |
| `bun run build-storybook` | Storybook static build |

## Environment

```bash
VITE_CONVEX_URL=https://cheery-setter-27.convex.cloud
```

## Seed Data

```bash
bunx convex run seed:seedMenu
```

Seeds the real Fulala menu: steamed dumplings (Har Gow, pork & cabbage, beef & onion, chicken & cheese, custard bun, peach bun) with multi-tier pricing, noodle soups (braised beef brisket, minced pork, eggplant vegetarian, chicken & peppers, GF rice noodles), with Czech names, Chinese characters, allergen codes, and images.

---

Part of the [Fulala platform](https://fulala.cz). Made with dumplings.
