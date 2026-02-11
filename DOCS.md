# FULALA Live Menu — Documentation

## What Is This?

The Fulala Live Menu is a real-time menu display system for the Fulala restaurant in Prague. It shows customers the current menu with prices, allergens, and photos — and updates instantly when staff makes changes. No page refresh, no delay.

It serves four audiences:

1. **Customers on phones** — Browse the menu on their own device (via QR code or direct link)
2. **Customers at the restaurant** — View the menu on TV screens mounted in the space
3. **Staff** — Update menu items, prices, availability, and weekly schedules from the admin panel
4. **The main website** — `fulala.cz/menu` embeds this app in an iframe for seamless integration

---

## How Customers See It

### The Menu Page (`/`)

When a customer opens `menu.fulala.cz` (or scans the restaurant's QR code), they see:

**Header**
- Restaurant name: FULALA.CZ
- Subtitle: FRESH NOODLES & DUMPLINGS & SNACKS
- Current week schedule (e.g., "Week #2 · February 2026 · 9–15 February")
- Language toggle: CZ / EN
- Currency toggle: Kc / EUR

**Customer Information**
- Kids & family: portions available on request
- Students: 10% off with valid ISIC card
- Seniors: 10% off for guests 65+

**Allergen Legend**
EU-compliant 14-allergen table showing allergen number, Czech name, and English name. Includes sub-types (1a Wheat, 1b Rye, 1c Barley, 1d Oats).

**Menu Categories**
Each category (e.g., STEAMED DUMPLINGS, NOODLE SOUPS) shows items with:
- **Czech name** (primary) — e.g., "Hovezi knedlicky s cibuli"
- **Chinese characters** — e.g., "牛肉蒸饺"
- **English subtitle** — e.g., "Steamed Beef & Onion Dumplings"
- **Quantity** — e.g., "6ks" (6 pieces)
- **Price** — e.g., "209 Kc"
- **Photo** — high-quality food photography
- **Allergen badges** — numbered circles (1, 6, 11, etc.)
- **Tags** — RECOMMENDED, SWEET, GLUTEN-FREE

### TV Display (`/tv`)
Same content, optimized for large screens:
- Bigger fonts and spacing
- Multi-column layout
- No interactive elements

### Vertical TV Display (`/tv-dumplings`, `/tv-noodles`, `/tv-info`)

Three dedicated routes for the restaurant's 3x LG 43UR78003LK TVs mounted in portrait orientation. Each TV loads one URL in its built-in browser.

| Route | TV | Content |
|-------|-----|---------|
| `/tv-dumplings` | Left | Steamed dumplings — 6 items with photos, bilingual names, prices, allergens |
| `/tv-noodles` | Middle | Noodle soups — 5 items with photos, bilingual names, prices, allergens |
| `/tv-info` | Right | Student/senior discounts, allergen legend |

**Design:**
- Non-scrollable (`overflow: hidden`, `100vh`)
- Bilingual: Czech primary + English secondary shown simultaneously
- Prices in CZK only (no interactive currency switching on passive display)
- Large typography: 40px item names, 48px prices, 56px category titles (24px minimum floor)
- Food photos (120px thumbnails) next to each item
- Fulala Red (#E83636) accent, green (#16a34a) prices

**CSS Rotation:**
The TVs output 1920x1080 landscape but are physically mounted portrait. A CSS rotation wrapper creates a 1080x1920 portrait container and rotates it 90° to fill the landscape viewport. To flip rotation direction, change `rotate(90deg)` to `rotate(-90deg)` in `src/routes/(tv-portrait)/+layout.svelte`.

**Shared layout:**
All TV portrait routes share `(tv-portrait)/+layout.svelte` which provides the header (brand, week schedule, clock), footer (prices note), and rotation wrapper. Adding a new TV page is just creating a `+page.svelte` in the route group.

**Components** (`src/lib/components/tv/`):
- `TvPortraitHeader.svelte` — Brand name, tagline, week/schedule, live clock
- `TvPortraitFooter.svelte` — Bilingual prices note
- `TvMenuItem.svelte` — Large-font menu item (image, names, price, allergens, tags)
- `TvCategory.svelte` — Category section with bilingual title and item list

**Design System** (`src/lib/design/tv-design-system.md`):
All TV portrait tokens live in `src/lib/styles/tv-portrait.css`. Minimum font size: 24px. See the design system doc for space budget, legibility rules, and deploy checklist.

### Customer Ordering (`/order`)
Full cart experience:
- Browse menu items
- Select modifiers (noodle type, spice level, broth, temperature)
- Add to cart with quantity
- View order summary with subtotal, tax (10%), total
- Submit order

---

## How Staff Uses It

### Menu Management (`/admin`)
The admin dashboard lets staff manage everything:

**Menu Items**
- Add/edit/delete items
- Set name (Czech), nameLocal (English), nameChinese (Chinese characters)
- Set price in CZK (auto-converts to other currencies)
- Upload food photos (WebP format)
- Assign allergen codes (e.g., 1a, 2, 6, 11)
- Toggle availability (sold out / available)
- Mark as featured (RECOMMENDED badge)
- Set quantity display (e.g., "3ks", "6ks")

**Categories**
- Organize items into sections
- Set display names in Czech + English
- Control sort order
- Toggle active/inactive

### Theme Editor (`/admin/theme`)
Customize the visual appearance:
- **Colors** — text, background, accent, price (green), surface
- **Fonts** — headline (Cormorant Garamond), body (Inter), price (DM Mono)
- **Typography** — sizes for headline, body, price, allergen text
- **Spacing** — item gap, category gap, card padding
- **Currency** — configure which currencies to show, exchange rates, display mode (single/multi/toggle)

Save presets and switch between them. Changes appear in real-time on all connected screens.

### Layout Configuration (`/admin/layout`)
Four display layouts, configurable independently for display pages (/, /tv) and the order page (/order):

1. **Standard List** — Simple vertical list with images
2. **Dim Sum Grid** — Two-column grid with checkboxes and item codes
3. **Card Grid** — Image-heavy card layout, 1-4 responsive columns
4. **Traditional Chinese** — Classic dim sum order sheet with ornamental characters, quantity inputs, and three color schemes (classic red, jade green, gold)

### Event Management (`/admin/events`)
Three event types:
- **Event Packages** — Banquets with min/max guests, price per person, deposit
- **Catering Menus** — Delivery catering with minimum orders and radius
- **School Meals** — Weekly meal schedules (Mon-Fri) with per-meal pricing

### Analytics (`/admin/analytics`)
Track display sessions:
- Session count by type (mobile vs TV)
- Viewport sizes
- Peak hours
- Duration metrics

---

## How It Connects to fulala.cz

The main website at `fulala.cz/menu` embeds the live menu in a full-page iframe:

```svelte
<iframe
  src={PUBLIC_LIVE_MENU_URL}
  title="FULALA Live Menu"
/>
```

This means:
- One source of truth for menu data (the Convex database)
- Updates made by staff appear on both `menu.fulala.cz` and `fulala.cz/menu` simultaneously
- The live menu can also run standalone for direct customer access

---

## Technical Details

### Real-Time Architecture
All data flows through **Convex** with WebSocket subscriptions. The flow:

```
Staff updates price in /admin
       |
       v
Convex mutation writes to database
       |
       v
All connected clients receive push update (~200ms)
       |
       v
Menu re-renders with new price (no refresh)
```

### Database (14 Tables)

**Core:** `menuItems`, `categories`
**Display:** `displayLayouts`, `siteSettings`, `themePresets`
**Orders:** `customerOrders`
**Events:** `eventPackages`, `cateringMenus`, `schoolMeals`
**History:** `menuArchive`, `dailySnapshots`, `syncState`
**Analytics:** `displayAnalytics`, `analyticsAggregates`

### Allergen System
Based on EU Regulation No. 1169/2011. All 14 mandatory allergens:

| # | Name | Czech |
|---|------|-------|
| 1 | Cereals with gluten | Obiloviny obsahujici lepek |
| 1a | Wheat | Psenice |
| 1b | Rye | Zito |
| 1c | Barley | Jecmen |
| 1d | Oats | Oves |
| 2 | Crustaceans | Korysi |
| 3 | Eggs | Vejce |
| 4 | Fish | Ryby |
| 5 | Peanuts | Arasidy |
| 6 | Soybeans | Soja |
| 7 | Milk | Mleko |
| 8 | Nuts | Skorapkove plody |
| 9 | Celery | Celer |
| 10 | Mustard | Horcice |
| 11 | Sesame | Sezamova semena |
| 12 | Sulphites | Oxid siricity |
| 13 | Lupin | Vlci bob |
| 14 | Molluscs | Mekkysci |

### Currency System
Prices stored in CZK cents. Converted client-side using configurable exchange rates:

| Currency | Symbol | Decimals | Default Rate |
|----------|--------|----------|--------------|
| CZK | Kc | 0 | 1.000 |
| EUR | EUR | 2 | 0.039 |
| USD | $ | 2 | 0.042 |
| CNY | ¥ | 0 | 0.310 |

### Theme Defaults
- **Headline font:** Cormorant Garamond (serif, 1.75rem)
- **Body font:** Inter (sans-serif, 1rem)
- **Price font:** DM Mono (monospace, 1.125rem)
- **Accent color:** #E83636 (Fulala red)
- **Price color:** #16a34a (green)

---

## Development

### Prerequisites
- [Bun](https://bun.sh)
- [Convex](https://convex.dev) account

### Setup
```bash
git clone https://github.com/stussysenik/fulala-live-menu
cd fulala-live-menu
bun install
bun run dev:all
```

### Testing
```bash
bun run test              # All Playwright tests
bun run test -- --ui      # Interactive UI mode
bun run test:unit         # Vitest unit tests
```

### Deployment
Vercel auto-deploys from `main`. Region: `fra1` (Frankfurt).

```bash
# Manual deploy
vercel deploy --prod

# Deploy Convex schema
bunx convex deploy
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL |
| `GOOGLE_SHEETS_API_KEY` | No | Google Sheets sync |
| `GOOGLE_SHEETS_ID` | No | Spreadsheet ID |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Menu items not loading | Check Convex connection — `VITE_CONVEX_URL` must be set |
| Empty categories | Run `bunx convex run seed:seedMenu` to seed data |
| CSS preload warning | Harmless browser optimization notice — ignore |
| Theme changes not applying | Check `/admin/theme` save button — changes need explicit save |
| Currency toggle missing | Only shows when >1 currency is enabled in theme config |

---

*Last updated: February 11, 2026*
