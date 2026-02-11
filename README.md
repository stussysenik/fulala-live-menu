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
| `/tv` | Staff | TV display (large fonts, multi-column) |
| `/tv-dumplings` | TV | Vertical TV — steamed dumplings (portrait) |
| `/tv-noodles` | TV | Vertical TV — noodle soups (portrait) |
| `/tv-info` | TV | Vertical TV — highlights, discounts, allergens |
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
- **4 layouts** — Standard list, dim sum grid, card grid, traditional Chinese order sheet
- **Per-page layouts** — Different layouts for display vs ordering pages
- **EU allergens** — Full 14-allergen system with sub-types (1a wheat, 1b rye, etc.)
- **Weekly schedule** — Auto-displays current week number and date range
- **Theme system** — Customizable colors, fonts, spacing with live preview
- **TV mode** — Optimized for restaurant displays at `/tv`
- **Vertical TV** — 3 dedicated portrait routes for LG 43" TVs (`/tv-dumplings`, `/tv-noodles`, `/tv-info`)
- **TV design system** — Token-driven CSS, 24px minimum font, Playwright legibility tests
- **Customer ordering** — Session-based cart with modifiers (noodle type, spice, etc.)

## Architecture

```
fulala-live-menu/
├── src/
│   ├── routes/           # Pages (menu, tv, order, admin)
│   ├── lib/
│   │   ├── components/   # MenuItem, Category, AllergenLegend, ...
│   │   │   └── tv/       # TV-optimized portrait display components
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

## Environment

```bash
VITE_CONVEX_URL=https://cheery-setter-27.convex.cloud
```

## Seed Data

```bash
bunx convex run seed:seedMenu
```

Seeds the real Fulala menu: steamed dumplings (Har Gow, pork & cabbage, beef & onion), noodle soups (braised beef brisket, minced pork, eggplant vegetarian), with Czech names, Chinese characters, allergen codes, and images.

---

Part of the [Fulala platform](https://fulala.cz). Made with dumplings.
