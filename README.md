# Fulala Live Menu System

A real-time restaurant menu display system with mobile-first responsive design.

## Features

- **Real-time updates**: Menu changes sync instantly to all displays
- **Mobile-first design**: Works on phones, tablets, and vertical TV screens
- **TV display mode**: Optimized view for restaurant displays (`/tv`)
- **Display layouts**: 4 layout types (standard-list, dim-sum-grid, card-grid, traditional-chinese) with real-time switching
- **Per-page layouts**: Independent layout configuration for display pages (/, /tv) vs order page (/order)
- **Customer ordering**: Session-based cart system with order lifecycle tracking
- **Item modifiers**: 7 modifier types (temperature, noodle, frying, broth, spice, drinks, add-ons)
- **Dietary tags**: Visual icons for vegetarian, vegan, allergens, halal, kosher, and more
- **Event management**: Event packages, catering menus, and school meal schedules
- **Multi-currency**: Single-currency display by default with global currency selector (CZK, EUR, USD, CNY support)
- **Archive & versioning**: Full history of menu changes
- **Google Sheets sync**: Edit your menu from any device

## Tech Stack

- **Runtime**: Bun
- **Framework**: SvelteKit
- **Real-time Database**: Convex
- **Data Source**: Google Sheets (optional)
- **Testing**: Playwright
- **Styling**: Vanilla CSS with CSS variables

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Convex

Create a Convex project and connect it to this app:

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex (or create an account)
- Create a new Convex project
- Generate the `VITE_CONVEX_URL` and add it to `.env.local`
- Generate proper TypeScript types in `convex/_generated/`

### 3. Seed the Database

Once Convex is running, seed the menu with example data:

```bash
# In the Convex dashboard or via CLI
npx convex run seed:seedMenu
```

### 4. Start Development Server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the menu.

## Routes

### Customer Routes
| Route | Description |
|-------|-------------|
| `/` | Main menu (mobile/web) with active display layout |
| `/tv` | TV display mode (larger fonts, multi-column) |
| `/order` | Customer ordering page with cart and checkout |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard - menu item and category management |
| `/admin/theme` | Theme editor with live preview and currency configuration |
| `/admin/layout` | Display layout configuration with per-page tabs (Display Pages / Order Page) |
| `/admin/events` | Event packages, catering, and school meals management |
| `/admin/analytics` | Display session analytics |

### API Routes
| Route | Description |
|-------|-------------|
| `/api/sync` | Webhook endpoint for Google Sheets |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | Your Convex deployment URL (auto-set by `npx convex dev`) |
| `GOOGLE_SHEETS_API_KEY` | Google Sheets API key for sync (optional) |
| `GOOGLE_SHEETS_ID` | Spreadsheet ID for menu data (optional) |
| `VITE_WEBHOOK_SECRET` | Secret for webhook authentication (optional) |

## Google Sheets Setup (Optional)

To sync your menu from Google Sheets:

1. Create a Google Cloud project and enable the Sheets API
2. Create an API key
3. Create a spreadsheet with two sheets:
   - `Categories`: columns `name`, `displayName`, `sortOrder`, `isActive`
   - `Menu Items`: columns `name`, `description`, `price`, `category`, `isAvailable`, `sortOrder`
4. Add your API key and spreadsheet ID to `.env.local`

## Testing

Run all tests:

```bash
bun run test
```

Run tests in UI mode:

```bash
bun run test -- --ui
```

## Project Structure

```
fulala-live-menu/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── admin/           # Admin UI components
│   │   │   │   ├── ItemModifierEditor.svelte
│   │   │   │   ├── CurrencyConfigEditor.svelte
│   │   │   │   ├── ColorPicker.svelte
│   │   │   │   ├── ThemeEditor.svelte
│   │   │   │   └── TypographyPanel.svelte
│   │   │   ├── layouts/         # Display layout components
│   │   │   │   ├── CardGrid.svelte
│   │   │   │   ├── DimSumGrid.svelte
│   │   │   │   ├── TraditionalChineseGrid.svelte
│   │   │   │   └── LayoutRenderer.svelte
│   │   │   ├── modifiers/       # Modifier components
│   │   │   │   ├── ModifierBadges.svelte
│   │   │   │   └── ModifierSelector.svelte
│   │   │   ├── order/           # Order components
│   │   │   │   ├── OrderCart.svelte
│   │   │   │   └── OrderReceipt.svelte
│   │   │   ├── DietaryTags.svelte
│   │   │   ├── MenuItem.svelte
│   │   │   └── PriceDisplay.svelte
│   │   ├── stores/
│   │   │   ├── index.ts         # Theme store
│   │   │   └── order.ts         # Order cart store
│   │   └── theme/               # Theme configuration
│   └── routes/
│       ├── +page.svelte         # Main menu page
│       ├── tv/+page.svelte      # TV display mode
│       ├── order/+page.svelte   # Customer ordering
│       ├── admin/
│       │   ├── +page.svelte     # Admin dashboard
│       │   ├── theme/+page.svelte
│       │   ├── layout/+page.svelte
│       │   ├── events/+page.svelte
│       │   └── analytics/+page.svelte
│       └── api/sync/            # Webhook endpoint
├── convex/
│   ├── schema.ts                # Database schema (14 tables)
│   ├── menuItems.ts             # Menu item queries/mutations
│   ├── categories.ts            # Category queries/mutations
│   ├── layouts.ts               # Layout queries/mutations
│   ├── orders.ts                # Order queries/mutations
│   ├── events.ts                # Event management queries/mutations
│   ├── archive.ts               # Archive & analytics
│   ├── sync.ts                  # Google Sheets sync
│   ├── seed.ts                  # Example data
│   └── crons.ts                 # Scheduled jobs
├── tests/
│   ├── menu.spec.ts             # Menu display tests
│   ├── currency-toggle.spec.ts  # Currency toggle tests
│   ├── currency-admin.spec.ts   # Currency admin configuration tests
│   ├── layouts.spec.ts          # Per-page layout tests
│   ├── realtime.spec.ts         # Real-time sync tests
│   └── accessibility.spec.ts    # Accessibility tests
├── openspec/                    # OpenSpec proposals and specs
│   ├── changes/
│   │   └── add-advanced-menu-features/
│   └── specs/
│       ├── menu-display/
│       ├── customer-ordering/
│       └── event-management/
├── PROGRESS.md                  # Development progress and roadmap
├── DOCS.md                      # Technical documentation
└── README.md                    # This file
```

## Example Menu Categories

The seed data includes:
- **Dumplings**: Pork Gyoza, Veggie Dumplings, Soup Dumplings
- **Noodles**: Dan Dan, Cold Sesame, Beef Noodle Soup
- **Rice Dishes**: Mapo Tofu, Curry Chicken, Teriyaki Salmon
- **Snacks**: Scallion Pancakes, Cucumber Salad, Edamame
- **Drinks**: Jasmine Tea, Oolong Tea, Thai Iced Tea
- **Juices**: Fresh Orange, Watermelon, Green Juice

## License

MIT
