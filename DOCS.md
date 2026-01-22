# Fulala Live Menu - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Convex API Reference](#convex-api-reference)
4. [Component Reference](#component-reference)
5. [Configuration](#configuration)
6. [Development Guide](#development-guide)
7. [Data Flow](#data-flow)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
├──────────────────┬──────────────────┬──────────────────────┤
│  Customer View   │   Admin View     │   Kitchen View       │
│  (/, /tv,        │   (/admin/*)     │   (Phase 7)          │
│   /order)        │                  │                       │
└────────┬─────────┴────────┬─────────┴──────────────────────┘
         │                  │
         │    SvelteKit     │
         │    Frontend      │
         │                  │
         └────────┬─────────┘
                  │
         Real-time WebSocket
         (Convex Subscriptions)
                  │
┌─────────────────┴─────────────────────────────────────────┐
│                    Convex Backend                          │
├────────────────────────────────────────────────────────────┤
│  Queries (Read)         │   Mutations (Write)              │
│  - getActiveLayout      │   - createOrder                  │
│  - getMenuItems         │   - updateOrderItem              │
│  - getActiveOrder       │   - setActiveLayout              │
│  - getEventPackages     │   - updateMenuItem               │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │
┌────────────────┴───────────────────────────────────────────┐
│                   Convex Database                          │
├────────────────────────────────────────────────────────────┤
│  14 Tables:                                                │
│  - menuItems (with modifiers, dietary tags)                │
│  - categories                                              │
│  - displayLayouts                                          │
│  - customerOrders                                          │
│  - eventPackages, cateringMenus, schoolMeals               │
│  - siteSettings, themePresets                              │
│  - menuArchive, syncState, dailySnapshots                  │
│  - displayAnalytics, analyticsAggregates                   │
└────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **SvelteKit** (v2.x) - Full-stack framework
- **Svelte** (v4.x) - Reactive UI components
- **Tailwind CSS** (v3.x) - Utility-first styling
- **TypeScript** (v5.x) - Type safety
- **Lucide Icons** - Icon library

**Backend:**
- **Convex** (v1.x) - Real-time database and backend
- **Node.js** (v20) - Runtime environment

**Deployment:**
- **Vercel** - Frontend hosting
- **Convex Cloud** - Database hosting

---

## Database Schema

### Complete Schema Reference

#### 1. categories

Organizes menu items into hierarchical sections.

```typescript
{
  name: string,                // Internal name (e.g., "appetizers")
  displayName: string,         // Customer-facing name (e.g., "Appetizers")
  sortOrder: number,           // Display order (lower = first)
  isActive: boolean           // Visibility toggle
}

Indices:
- by_sort: [sortOrder]
```

**Example:**
```json
{
  "_id": "jx7abc123...",
  "name": "dim-sum",
  "displayName": "Dim Sum 點心",
  "sortOrder": 1,
  "isActive": true
}
```

---

#### 2. menuItems

Core menu item data with modifiers, dietary tags, and pricing.

```typescript
{
  name: string,                           // Item name
  description?: string,                   // Optional description
  price: number,                          // Price in cents
  categoryId: Id<"categories">,          // Parent category
  isAvailable: boolean,                  // Availability toggle
  sortOrder: number,                      // Display order within category
  addedAt: number,                        // Unix timestamp (ms)
  lastModifiedAt: number,                // Unix timestamp (ms)
  modificationCount: number,             // Edit counter
  imageUrl?: string,                      // Image URL
  allergens?: string[],                   // Legacy allergen list
  itemCode?: string,                      // Dim sum code (e.g., "S1")

  // Modifiers (Phase 2)
  modifiers?: {
    temperature?: ("hot" | "cold" | "room-temp")[],
    noodleType?: ("thin" | "flat" | "thick" | "hand-pulled" | "rice" | "glass" | "egg")[],
    fryingDegree?: ("light" | "golden" | "crispy")[],
    brothType?: ("clear" | "bone" | "spicy" | "tomato" | "coconut")[],
    spiceLevel?: ("mild" | "medium" | "hot" | "extra-hot")[]
  },

  // Dietary Tags (Phase 3)
  dietaryTags?: (
    "vegetarian" | "vegan" | "contains-seafood" | "contains-pork" |
    "contains-beef" | "contains-chicken" | "contains-nuts" |
    "gluten-free" | "dairy-free" | "halal" | "kosher"
  )[],

  // Drink Options (Phase 3)
  drinkOptions?: {
    temperatures: ("hot" | "iced")[],
    defaultTemp?: string,
    sugarLevels?: string[],              // ["0%", "30%", "50%", "100%"]
    addOns?: {
      name: string,                       // "Boba", "Honey", "Lemon"
      price: number                       // Additional cents
    }[]
  }
}

Indices:
- by_category: [categoryId]
- by_available: [isAvailable]
```

**Example:**
```json
{
  "_id": "ky8def456...",
  "name": "Pad Thai",
  "description": "Stir-fried rice noodles with tamarind sauce",
  "price": 1200,
  "categoryId": "jx7abc123...",
  "isAvailable": true,
  "sortOrder": 2,
  "addedAt": 1705881600000,
  "lastModifiedAt": 1705881600000,
  "modificationCount": 0,
  "imageUrl": "https://example.com/pad-thai.jpg",
  "modifiers": {
    "noodleType": ["thin", "flat"],
    "spiceLevel": ["mild", "medium", "hot"]
  },
  "dietaryTags": ["contains-seafood", "gluten-free"]
}
```

---

#### 3. displayLayouts

Layout configurations for menu display (Phase 1).

```typescript
{
  layoutType: "standard-list" | "dim-sum-grid" | "card-grid",
  config: {
    columnsPerRow?: number,              // 2 for dim sum
    showCheckboxes?: boolean,           // Dim sum style
    showItemNumbers?: boolean,          // Show item codes (S1, F2)
    showImages?: boolean,               // Display images
    categoryStyle?: "header" | "tabs" | "colored"
  },
  isActive: boolean                      // Only one active at a time
}

Indices:
- by_active: [isActive]
```

**Example:**
```json
{
  "_id": "lz9ghi789...",
  "layoutType": "dim-sum-grid",
  "config": {
    "columnsPerRow": 2,
    "showCheckboxes": true,
    "showItemNumbers": true,
    "showImages": false,
    "categoryStyle": "header"
  },
  "isActive": true
}
```

---

#### 4. customerOrders

Customer order tracking with session-based cart (Phase 4).

```typescript
{
  sessionId: string,                     // Browser session UUID
  status: "active" | "submitted" | "completed",
  items: {
    menuItemId: Id<"menuItems">,
    name: string,                        // Snapshot for historical accuracy
    quantity: number,
    unitPrice: number,                   // Cents
    selectedModifiers?: {
      noodleType?: string,
      temperature?: string,
      spiceLevel?: string,
      brothType?: string,
      fryingDegree?: string,
      addOns?: string[]
    }
  }[],
  subtotal: number,                      // Cents
  tax: number,                           // Cents (10%)
  total: number,                         // Cents
  tableNumber?: string,                  // Optional table
  notes?: string,                        // Special instructions
  createdAt: number,                     // Unix timestamp (ms)
  updatedAt?: number                     // Unix timestamp (ms)
}

Indices:
- by_session: [sessionId]
- by_status: [status]
```

**Example:**
```json
{
  "_id": "ma0jkl012...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "submitted",
  "items": [
    {
      "menuItemId": "ky8def456...",
      "name": "Pad Thai",
      "quantity": 2,
      "unitPrice": 1200,
      "selectedModifiers": {
        "noodleType": "flat",
        "spiceLevel": "medium"
      }
    }
  ],
  "subtotal": 2400,
  "tax": 240,
  "total": 2640,
  "tableNumber": "12",
  "notes": "Extra peanuts please",
  "createdAt": 1705881600000,
  "updatedAt": 1705881700000
}
```

---

#### 5. eventPackages

Event packages with guest ranges and deposits (Phase 5).

```typescript
{
  name: string,
  description?: string,
  minGuests: number,
  maxGuests: number,
  pricePerPerson: number,                // Cents
  depositRequired: number,               // Cents
  includedItems: Id<"menuItems">[],     // Menu items in package
  isActive: boolean,
  createdAt: number                      // Unix timestamp (ms)
}

Indices:
- by_active: [isActive]
```

**Example:**
```json
{
  "_id": "nb1mno345...",
  "name": "Wedding Banquet",
  "description": "10-course Chinese wedding feast",
  "minGuests": 50,
  "maxGuests": 200,
  "pricePerPerson": 4500,
  "depositRequired": 50000,
  "includedItems": ["ky8def456...", "lz9ghi789..."],
  "isActive": true,
  "createdAt": 1705881600000
}
```

---

#### 6. cateringMenus

Catering menu offerings (Phase 5).

```typescript
{
  name: string,
  description?: string,
  minOrderAmount: number,                // Cents
  deliveryRadius?: number,               // Kilometers
  items: Id<"menuItems">[],
  isActive: boolean,
  createdAt: number
}

Indices:
- by_active: [isActive]
```

**Example:**
```json
{
  "_id": "oc2pqr678...",
  "name": "Office Lunch Catering",
  "description": "Perfect for corporate events",
  "minOrderAmount": 20000,
  "deliveryRadius": 10,
  "items": ["ky8def456...", "lz9ghi789...", "ma0jkl012..."],
  "isActive": true,
  "createdAt": 1705881600000
}
```

---

#### 7. schoolMeals

Weekly school meal schedules (Phase 5).

```typescript
{
  weekNumber: number,                    // ISO week number
  year: number,                          // 2026
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
  items: Id<"menuItems">[],
  pricePerMeal: number,                  // Cents
  isActive: boolean
}

Indices:
- by_week: [year, weekNumber]
```

**Example:**
```json
{
  "_id": "pd3stu901...",
  "weekNumber": 5,
  "year": 2026,
  "dayOfWeek": "monday",
  "items": ["ky8def456...", "lz9ghi789..."],
  "pricePerMeal": 850,
  "isActive": true
}
```

---

#### 8-14. Supporting Tables

**menuArchive** - Historical snapshots of menu changes
```typescript
{
  menuItemId: Id<"menuItems">,
  snapshot: any,                         // Full item snapshot
  changeType: string,                    // "created" | "updated" | "deleted"
  changedAt: number
}
Index: by_item: [menuItemId]
```

**syncState** - Google Sheets sync status
```typescript
{
  lastSyncAt: number,
  status: string,                        // "idle" | "syncing" | "error"
  errorMessage?: string
}
```

**dailySnapshots** - Daily menu backups
```typescript
{
  date: string,                          // "YYYY-MM-DD"
  snapshot: any,
  createdAt: number
}
Index: by_date: [date]
```

**siteSettings** - Global configuration (theme, restaurant info)
```typescript
{
  key: string,                           // "theme" | "restaurant-info"
  value: any,
  updatedAt: number
}
Index: by_key: [key]
```

**themePresets** - Saved theme configurations
```typescript
{
  name: string,
  theme: any,
  isDefault: boolean,
  createdAt: number
}
Index: by_name: [name]
```

**displayAnalytics** - Session tracking
```typescript
{
  sessionId: string,
  displayType: string,                   // "mobile" | "tv"
  startedAt: number,
  endedAt?: number,
  viewportSize?: { width: number, height: number }
}
Indices:
- by_type: [displayType]
- by_date: [startedAt]
```

**analyticsAggregates** - Daily analytics rollups
```typescript
{
  date: string,                          // "YYYY-MM-DD"
  displayType: string,
  totalSessions: number,
  totalDurationMs: number,
  peakHour?: number
}
Index: by_date_type: [date, displayType]
```

---

## Convex API Reference

### Queries (Read Operations)

#### Menu Items

**`api.menuItems.list`**
```typescript
async () => MenuItem[]
```
Returns all menu items with category information.

**`api.menuItems.getById`**
```typescript
async (args: { id: Id<"menuItems"> }) => MenuItem | null
```

**`api.menuItems.getByCategory`**
```typescript
async (args: { categoryId: Id<"categories"> }) => MenuItem[]
```

---

#### Categories

**`api.categories.list`**
```typescript
async () => Category[]
```
Returns all categories ordered by sortOrder.

**`api.categories.getActive`**
```typescript
async () => Category[]
```
Returns only active categories.

---

#### Display Layouts

**`api.layouts.getActive`**
```typescript
async () => DisplayLayout | null
```
Returns the currently active layout configuration.

**`api.layouts.getAll`**
```typescript
async () => DisplayLayout[]
```

**`api.layouts.getById`**
```typescript
async (args: { id: Id<"displayLayouts"> }) => DisplayLayout | null
```

---

#### Orders

**`api.orders.getActiveOrder`**
```typescript
async (args: { sessionId: string }) => CustomerOrder | null
```
Returns active order for given sessionId.

**`api.orders.getOrderById`**
```typescript
async (args: { id: Id<"customerOrders"> }) => CustomerOrder | null
```

**`api.orders.getOrdersByStatus`**
```typescript
async (args: { status: "active" | "submitted" | "completed" }) => CustomerOrder[]
```

---

#### Event Management

**`api.events.getActiveEventPackages`**
```typescript
async () => EventPackage[]
```

**`api.events.getEventPackageById`**
```typescript
async (args: { id: Id<"eventPackages"> }) => EventPackage | null
```

**`api.events.getActiveCateringMenus`**
```typescript
async () => CateringMenu[]
```

**`api.events.getCateringMenuById`**
```typescript
async (args: { id: Id<"cateringMenus"> }) => CateringMenu | null
```

**`api.events.getSchoolMealsByWeek`**
```typescript
async (args: { year: number, weekNumber: number }) => SchoolMeal[]
```

**`api.events.getSchoolMealById`**
```typescript
async (args: { id: Id<"schoolMeals"> }) => SchoolMeal | null
```

---

### Mutations (Write Operations)

#### Menu Items

**`api.menuItems.create`**
```typescript
async (args: {
  name: string
  description?: string
  price: number
  categoryId: Id<"categories">
  isAvailable: boolean
  sortOrder: number
  imageUrl?: string
  modifiers?: {...}
  dietaryTags?: string[]
  drinkOptions?: {...}
}) => Id<"menuItems">
```

**`api.menuItems.update`**
```typescript
async (args: {
  id: Id<"menuItems">
  // ... same fields as create (all optional except id)
}) => void
```

**`api.menuItems.delete`**
```typescript
async (args: { id: Id<"menuItems"> }) => void
```

---

#### Display Layouts

**`api.layouts.create`**
```typescript
async (args: {
  layoutType: "standard-list" | "dim-sum-grid" | "card-grid"
  config: {...}
  isActive: boolean
}) => Id<"displayLayouts">
```

**`api.layouts.setActive`**
```typescript
async (args: { id: Id<"displayLayouts"> }) => void
```
Sets specified layout as active, deactivates all others.

**`api.layouts.update`**
```typescript
async (args: { id: Id<"displayLayouts">, config: {...} }) => void
```

**`api.layouts.delete`**
```typescript
async (args: { id: Id<"displayLayouts"> }) => void
```

---

#### Orders

**`api.orders.createOrder`**
```typescript
async (args: { sessionId: string }) => Id<"customerOrders">
```
Creates new active order for sessionId.

**`api.orders.addItemToOrder`**
```typescript
async (args: {
  orderId: Id<"customerOrders">
  menuItemId: Id<"menuItems">
  quantity: number
  selectedModifiers?: {...}
}) => void
```

**`api.orders.updateOrderItem`**
```typescript
async (args: {
  orderId: Id<"customerOrders">
  itemIndex: number
  quantity: number
}) => void
```

**`api.orders.removeItemFromOrder`**
```typescript
async (args: {
  orderId: Id<"customerOrders">
  itemIndex: number
}) => void
```

**`api.orders.updateOrderDetails`**
```typescript
async (args: {
  orderId: Id<"customerOrders">
  tableNumber?: string
  notes?: string
}) => void
```

**`api.orders.submitOrder`**
```typescript
async (args: { orderId: Id<"customerOrders"> }) => void
```
Changes status from active → submitted.

**`api.orders.completeOrder`**
```typescript
async (args: { orderId: Id<"customerOrders"> }) => void
```
Changes status from submitted → completed.

**`api.orders.clearOrder`**
```typescript
async (args: { orderId: Id<"customerOrders"> }) => void
```
Removes all items, keeps sessionId.

---

#### Event Management

**`api.events.createEventPackage`**
```typescript
async (args: {
  name: string
  description?: string
  minGuests: number
  maxGuests: number
  pricePerPerson: number
  depositRequired: number
  includedItems: Id<"menuItems">[]
  isActive: boolean
}) => Id<"eventPackages">
```

**`api.events.updateEventPackage`**
```typescript
async (args: { id: Id<"eventPackages">, ...fields }) => void
```

**`api.events.deleteEventPackage`**
```typescript
async (args: { id: Id<"eventPackages"> }) => void
```

**`api.events.createCateringMenu`**
```typescript
async (args: {
  name: string
  description?: string
  minOrderAmount: number
  deliveryRadius?: number
  items: Id<"menuItems">[]
  isActive: boolean
}) => Id<"cateringMenus">
```

**`api.events.updateCateringMenu`**
```typescript
async (args: { id: Id<"cateringMenus">, ...fields }) => void
```

**`api.events.deleteCateringMenu`**
```typescript
async (args: { id: Id<"cateringMenus"> }) => void
```

**`api.events.createSchoolMeal`**
```typescript
async (args: {
  weekNumber: number
  year: number
  dayOfWeek: string
  items: Id<"menuItems">[]
  pricePerMeal: number
  isActive: boolean
}) => Id<"schoolMeals">
```

**`api.events.updateSchoolMeal`**
```typescript
async (args: { id: Id<"schoolMeals">, ...fields }) => void
```

**`api.events.deleteSchoolMeal`**
```typescript
async (args: { id: Id<"schoolMeals"> }) => void
```

---

## Component Reference

### Layout Components

#### `CardGrid.svelte`
**Location:** `src/lib/components/layouts/CardGrid.svelte`
**Size:** 8189 bytes

**Props:**
```typescript
{
  items: MenuItem[]
  categoryStyle?: "header" | "tabs" | "colored"
}
```

**Description:** Card-based grid layout with large images, responsive columns (1-4).

---

#### `DimSumGrid.svelte`
**Location:** `src/lib/components/layouts/DimSumGrid.svelte`
**Size:** 8284 bytes

**Props:**
```typescript
{
  items: MenuItem[]
  showCheckboxes?: boolean
  showItemNumbers?: boolean
}
```

**Description:** 2-column grid with checkboxes and item codes, dim sum style.

---

#### `LayoutRenderer.svelte`
**Location:** `src/lib/components/layouts/LayoutRenderer.svelte`
**Size:** 1786 bytes

**Props:**
```typescript
{
  items: MenuItem[]
  layout: DisplayLayout
}
```

**Description:** Dynamic layout switcher, renders appropriate layout based on config.

---

### Modifier Components

#### `ModifierBadges.svelte`
**Location:** `src/lib/components/modifiers/ModifierBadges.svelte`
**Size:** 4168 bytes

**Props:**
```typescript
{
  modifiers?: {
    temperature?: string[]
    noodleType?: string[]
    fryingDegree?: string[]
    brothType?: string[]
    spiceLevel?: string[]
  }
  selectedModifiers?: {
    temperature?: string
    noodleType?: string
    spiceLevel?: string
    // etc.
  }
}
```

**Description:** Read-only modifier display with visual badges.

---

#### `ModifierSelector.svelte`
**Location:** `src/lib/components/modifiers/ModifierSelector.svelte`
**Size:** 11874 bytes

**Props:**
```typescript
{
  modifiers: {
    temperature?: string[]
    noodleType?: string[]
    // etc.
  }
}
```

**Events:**
```typescript
on:select={(e) => {
  // e.detail: { temperature?: string, noodleType?: string, ... }
}}
```

**Description:** Interactive modifier picker with dropdowns/buttons.

---

### Order Components

#### `OrderCart.svelte`
**Location:** `src/lib/components/order/OrderCart.svelte`
**Size:** 8783 bytes

**Props:**
```typescript
{
  order: CustomerOrder | null
}
```

**Description:** Shopping cart with item list, quantity controls, totals.

---

#### `OrderReceipt.svelte`
**Location:** `src/lib/components/order/OrderReceipt.svelte`
**Size:** 7243 bytes

**Props:**
```typescript
{
  order: CustomerOrder
}
```

**Description:** Order confirmation receipt display.

---

### Admin Components

#### `ItemModifierEditor.svelte`
**Location:** `src/lib/components/admin/ItemModifierEditor.svelte`
**Size:** 12895 bytes

**Props:**
```typescript
{
  modifiers?: {...}
  dietaryTags?: string[]
  drinkOptions?: {...}
}
```

**Events:**
```typescript
on:update={(e) => {
  // e.detail: { modifiers?, dietaryTags?, drinkOptions? }
}}
```

**Description:** Comprehensive modifier and dietary tag configuration.

---

#### `DietaryTags.svelte`
**Location:** `src/lib/components/DietaryTags.svelte`

**Props:**
```typescript
{
  tags: string[]
}
```

**Description:** Visual dietary tag badges with emoji icons.

---

## Configuration

### Environment Variables

**Required:**
```bash
# Convex deployment URL
PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Convex deploy key (for npx convex deploy)
CONVEX_DEPLOY_KEY=prod:your-deploy-key
```

**Optional:**
```bash
# Node.js version (for Vercel)
NODE_VERSION=20
```

### Theme Configuration

**Location:** `src/lib/theme/defaults.ts`

**Structure:**
```typescript
{
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: string
    headingSize: string
    bodySize: string
  }
  layout: {
    maxWidth: string
    spacing: string
  }
  currency: {
    base: "CZK" | "EUR" | "USD" | "CNY"
    display: string[]
    rates: Record<string, number>
  }
}
```

---

## Development Guide

### Setup

1. **Clone repository**
```bash
git clone <repo-url>
cd fulala-live-menu
```

2. **Install dependencies**
```bash
npm install
```

3. **Start Convex dev backend**
```bash
npx convex dev
```

4. **Start SvelteKit dev server**
```bash
npm run dev
```

5. **Visit**
- App: http://localhost:5173
- Admin: http://localhost:5173/admin
- Convex dashboard: https://dashboard.convex.dev

---

### Testing

**Run Playwright tests:**
```bash
npx playwright test
```

**Run specific test:**
```bash
npx playwright test tests/currency-toggle.spec.ts
```

**Debug mode:**
```bash
npx playwright test --debug
```

---

### Deployment

**Deploy to Vercel:**
```bash
vercel deploy --prod
```

**Deploy Convex schema:**
```bash
npx convex deploy
```

---

## Data Flow

### Order Creation Flow

```
Customer adds item to cart
         │
         ▼
ModifierSelector emits selection
         │
         ▼
OrderCart calls api.orders.addItemToOrder
         │
         ▼
Convex mutation updates customerOrders table
         │
         ▼
Convex subscription pushes update to client
         │
         ▼
OrderCart re-renders with new items
```

### Layout Switching Flow

```
Admin selects layout on /admin/layout
         │
         ▼
Admin clicks "Set Active"
         │
         ▼
api.layouts.setActive mutation called
         │
         ▼
Convex deactivates old layout, activates new
         │
         ▼
Convex subscription pushes to ALL connected clients
         │
         ▼
Customer menu re-renders with new layout (<1s)
```

---

## Troubleshooting

### Common Issues

**Issue: Cart not persisting on reload**
- Check localStorage for sessionId
- Verify Convex query subscription is active
- Inspect browser console for errors

**Solution:**
```typescript
// Check sessionId
const sessionId = localStorage.getItem('orderSessionId')
console.log('SessionId:', sessionId)

// Verify Convex connection
import { useQuery } from 'convex/svelte'
const order = useQuery(api.orders.getActiveOrder, { sessionId })
console.log('Order:', $order)
```

---

**Issue: Images not loading**
- Verify imageUrl is valid HTTPS URL
- Check CORS headers on image host
- Test image URL in browser directly

**Solution:**
```typescript
// Test image loading
<img
  src={item.imageUrl}
  on:error={(e) => console.error('Image failed:', e)}
  on:load={() => console.log('Image loaded')}
/>
```

---

**Issue: Real-time updates not working**
- Check Convex connection status
- Verify query subscriptions are active
- Inspect network tab for WebSocket connection

**Solution:**
```bash
# Check Convex dashboard for connection status
# Verify no errors in browser console
# Test with simple mutation:
await client.mutation(api.test.ping)
```

---

**Issue: Modifier selection not saving**
- Verify modifier schema matches backend enums
- Check selectedModifiers object structure
- Ensure mutation includes modifier data

**Solution:**
```typescript
// Log modifier selection
const handleModifierSelect = (modifiers) => {
  console.log('Selected modifiers:', modifiers)
  // Verify structure matches schema
}
```

---

### Performance Issues

**Slow menu loading:**
- Reduce number of items per page
- Implement pagination (future enhancement)
- Optimize images (use CDN)

**Slow cart operations:**
- Check network latency to Convex
- Verify efficient queries (no N+1 issues)
- Consider caching frequently accessed data

---

### Database Issues

**Schema migration failed:**
```bash
# Reset development schema
npx convex dev --once --clear

# Re-deploy production schema
npx convex deploy
```

**Orphaned data (e.g., order references deleted menuItem):**
- Handle missing references in queries
- Add fallback UI for deleted items
- Implement cleanup jobs (future)

---

*Last Updated: January 22, 2026*
*Version: 0.2.0*
