# Fulala Live Menu System

A real-time restaurant menu display system with mobile-first responsive design.

## Features

- **Real-time updates**: Menu changes sync instantly to all displays
- **Mobile-first design**: Works on phones, tablets, and vertical TV screens
- **TV display mode**: Optimized view for restaurant displays (`/tv`)
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

| Route | Description |
|-------|-------------|
| `/` | Main menu (mobile/web) |
| `/tv` | TV display mode (larger fonts, multi-column) |
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
│   │   ├── components/      # Svelte components
│   │   ├── convex/          # Convex client utilities
│   │   └── styles/          # CSS tokens and styles
│   └── routes/
│       ├── +page.svelte     # Main menu page
│       ├── tv/+page.svelte  # TV display mode
│       └── api/sync/        # Webhook endpoint
├── convex/
│   ├── schema.ts            # Database schema
│   ├── menu.ts              # Menu queries/mutations
│   ├── archive.ts           # Archive & analytics
│   ├── sync.ts              # Google Sheets sync
│   ├── seed.ts              # Example data
│   └── crons.ts             # Scheduled jobs
└── tests/
    ├── menu.spec.ts         # Menu display tests
    ├── realtime.spec.ts     # Real-time sync tests
    └── accessibility.spec.ts # Accessibility tests
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
