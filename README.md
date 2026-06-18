<div align="center">

# FULALA Live Menu

### Real-time restaurant menu display

![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square&logo=svelte&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-Realtime-EE5522?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)

[Live Menu](https://fulala-live-menu.vercel.app)

</div>

---

Real-time restaurant menu display for [Fulala](https://fulala.cz). Powers `menu.fulala.cz` standalone and embeds inside `fulala.cz/menu`. Updates instantly when staff changes anything — prices, availability, weekly rotation.

## What is this?

### In 1 minute

A live digital menu for the Fulala dumpling & noodle restaurant. One backend ([Convex](https://convex.dev)) feeds three audiences from the same data: **customers** on their phones (`menu.fulala.cz`), the **portrait TVs** mounted in the shop (`/tv-*`), and **staff** in an admin dashboard (`/admin/*`). When a staff member edits a price, toggles availability, or swaps a photo, every screen updates within ~200ms — no rebuild, no redeploy. Prices show in CZK/EUR, text in Czech/English, and EU allergens are labelled on every item.

### In 10 minutes

**Shape.** It's a [SvelteKit](https://svelte.dev) app on Vercel (region `fra1`, auto-deploys from `main`) with a Convex realtime backend (prod deployment `cheery-setter-27`). The public and TV pages are **client-rendered** (`ssr = false`): the server ships a thin shell, then the browser opens a Convex WebSocket and streams the menu live. That's why a `curl` of a TV page returns an near-empty HTML file — the content arrives over the socket.

**Data flow.** Convex holds the menu (categories → items, with multi-tier pricing, allergen codes, Chinese names, and either a static image path or a Convex-storage image). Queries like `menu.getFullMenu` and `menu.getCategoryWithItems` resolve storage IDs into signed image URLs on the way out. The Svelte components are a pure projection of that data: `+page.svelte` (mobile menu) and the `tv/` components (TV displays) subscribe via `useQuery` and re-render reactively.

**Three surfaces, one source of truth.**
- **`/`** — the customer menu (phone/web), `Category` → `MenuItem`.
- **`/tv-dumplings`, `/tv-noodles`, `/tv-info`** — portrait TV displays for in-shop LG 43" screens, plus seasonal Valentine's variants.
- **`/admin/*`** — staff CRUD for menu, schedule, theme, layouts, events, plus image upload to Convex storage and a consolidated live TV preview.

**Display rules.** Two layers decide what a screen shows: a **theme** (`settings.getTheme` — colors, fonts, and global flags like `display.showImages`) and **per-page settings** (`settings.getPageSettings` — `showImages` / `showChinese` / `showAllergens` overrides keyed by page slug, e.g. `home`). A `readyForDisplay` hard-rail also filters out half-built draft items so incomplete entries never reach a customer screen.

### The longer version

**Why client-rendered.** Every meaningful read is a live Convex subscription, so server-rendering the menu would just produce stale HTML that the client immediately replaces. `ssr = false` skips that wasted round-trip; the page paints an instant skeleton, then fills in over the socket. Trade-off: pages are blank to a plain HTTP fetch and to crawlers — fine here because the canonical SEO surface is `fulala.cz` itself, which embeds this.

**Images, and the gotcha behind real incidents.** An item's photo is either a static asset under `static/images/...` or a file in Convex storage referenced by `imageStorageId`; queries turn the latter into a signed URL. But whether a photo *renders* is gated by **both** the active theme's `display.showImages` **and** the page-level `showImages` override for that slug. Either being `false` blanks the photos. The TV components only honor the page-level flag, so it's possible (and has happened) for the TVs to show photos while the public `/` menu hides them — because the `home` page setting was toggled off in admin while the theme still allowed images. If photos vanish on one surface but not another, check `settings.getPageSettings` for that slug first.

**Internationalization & money.** UI strings live in `lib/i18n` (Czech-first, English toggle); items additionally carry Chinese characters. Currency is a "lens" — prices are stored once and converted/formatted at display time (`lib/currency`) across CZK/EUR/USD/CNY with configurable rates, defaulting to single-currency CZK.

**Allergens.** Full EU 14-allergen system with sub-types (1a wheat, 1b rye, 1c barley, 1d oats…), rendered as numbered badges on items and a legend block, data-driven from `lib/allergens`.

**Layouts & theming.** Admin can pick among display layouts (standard list, dim sum grid, card grid, traditional Chinese order sheet) per page, and edit a theme (colors/fonts/spacing/currency config) with live preview. Themes are stored in Convex `siteSettings` and applied as CSS custom properties at runtime by `ThemeProvider`.

**Ordering.** `/order` is a session-based cart with item modifiers (noodle type, spice level, frying, broth, add-ons) and bill-splitting, shipped behind an admin kill switch.

**Deploy & ops.** Push to `main` → Vercel builds (`npm run validate:env && vite build`) and deploys to `fra1`. The build refuses to start without `VITE_CONVEX_URL`. Prod Convex data can be backed up with `npm run backup:prod`. Domain config and runbook details live in `DOCS.md` / `PROGRESS.md`.

## Quick Start

```bash
bun install
bun run dev:all          # SvelteKit + Convex
```

Open [localhost:5173](http://localhost:5173)

## Stack

- **SvelteKit 2** + Svelte 5
- **Convex** (real-time database)
- **Tailwind CSS 4** + scoped **SCSS**
- **Bits UI** (accessible primitives)
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
| `/admin` | Staff | Dashboard — stats, quick actions |
| `/admin/menu` | Staff | Menu CRUD, price tiers, quick image swap, upload-to-storage |
| `/admin/preview` | Staff | Consolidated live preview — all 3 TV displays |
| `/admin/schedule` | Staff | Weekly menu schedule |
| `/admin/theme` | Staff | Colors, fonts, currency config |
| `/admin/layout` | Staff | 4 display layouts with per-page config |
| `/admin/events` | Staff | Event packages, catering, school meals |
| `/admin/print` | Staff | Printable A4 menu sheet |
| `/admin/analytics` | Staff | Session tracking |

## Features

- **Real-time** — Convex WebSocket subscriptions, ~200ms update propagation
- **Bilingual** — Czech + English toggle, Chinese characters on items
- **Multi-currency** — CZK (default), EUR, USD, CNY with configurable rates
- **Multi-tier pricing** — Flexible tiers (e.g., 6ks/12ks) editable from admin with quick-add presets
- **4 layouts** — Standard list, dim sum grid, card grid, traditional Chinese order sheet
- **Per-page layouts** — Different layouts for display vs ordering pages
- **EU allergens** — Full 14-allergen system with sub-types (1a wheat, 1b rye, etc.)
- **Weekly schedule** — Auto-displays current week number and date range
- **Theme system** — Customizable colors, fonts, spacing with live preview
- **Vertical TV** — 3 dedicated portrait routes for LG 43" TVs (`/tv-dumplings`, `/tv-noodles`, `/tv-info`)
- **Seasonal themes** — Valentine's Day TV routes with warm cream, fortune gold, SVG decorations
- **TV design system** — Token-driven CSS, 180px food images, 24px minimum font, Playwright legibility tests
- **Admin live preview** — Consolidated view of all 3 TV displays with theme toggle and zoom
- **Quick image swap** — Click any menu item thumbnail in admin to change photos instantly
- **Image upload storage** — Upload from device to Convex storage with live save feedback
- **Storybook** — Component development and visual verification at port 6006
- **Customer ordering** — Session-based cart with modifiers (noodle type, spice, etc.)
- **Mobile-optimized** — Stacked name/price layout, smaller images (100px), compact 2-column allergen legend on phones (≤480px)

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
# Production / hosted
VITE_CONVEX_URL=https://cheery-setter-27.convex.cloud

# Local `npx convex dev` also works through SvelteKit public env
PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

If you see a blank/empty page, verify one of the Convex URL variables above is set.

## Seed Data

```bash
bunx convex run seed:seedMenu
```

Seeds the real Fulala menu: steamed dumplings (Har Gow, pork & cabbage, beef & onion, chicken & cheese, custard bun, peach bun) with multi-tier pricing, noodle soups (braised beef brisket, minced pork, eggplant vegetarian, chicken & peppers, GF rice noodles), with Czech names, Chinese characters, allergen codes, and images.

### Update Dumpling Tiers (One-Time Migration)
```bash
bunx convex run seed:updateDumplingTiers
```
Updates all dumplings to 6ks/12ks pricing (12ks = 6ks x 2 - 15 CZK discount). After running, manage tiers from `/admin/menu`.

---

Part of the [Fulala platform](https://fulala.cz). Made with dumplings.
