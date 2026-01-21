# Proposal: Add Multi-Currency Support

## Summary

Add multi-currency display to the Fulala menu system, allowing prices to be shown in multiple currencies (CZK, EUR, USD, CNY) simultaneously or via toggle. Base prices stored in CZK or EUR with automatic conversion using configurable exchange rates.

## Motivation

- Restaurant serves international customers (tourists, business travelers)
- Quick price reference in familiar currency improves customer experience
- Prague location suggests CZK as base with EUR/USD/CNY for visitors
- Simple, flexible system that "just works" without complex setup

## User Stories

1. **As a customer**, I want to see prices in my preferred currency so I can quickly understand costs
2. **As a restaurant owner**, I want to set my base currency (CZK/EUR) and have other currencies auto-convert
3. **As an admin**, I want to configure which currencies to display and update exchange rates easily

## Proposed Solution

### Approach: Static Exchange Rates with Admin Override

Use **money.js** (1KB, zero dependencies) with manually-configured exchange rates stored in Convex. This avoids external API dependencies and rate limits while keeping the solution simple.

**Why not live rates?**
- Menu prices don't need real-time forex precision
- Avoids API keys, rate limits, and external dependencies
- Admin can update rates weekly/monthly as needed
- Simpler, more reliable, works offline

### Key Features

1. **Base Currency**: CZK or EUR (admin-configurable)
2. **Display Currencies**: Toggle CZK, EUR, USD, CNY on/off
3. **Exchange Rates**: Admin-editable in theme settings
4. **Display Modes**:
   - Single currency (current behavior)
   - Multi-currency (show 2-4 currencies per price)
   - Toggle (customer can switch via UI)
5. **Formatting**: Proper currency symbols and decimal places per locale

### Data Model Changes

```typescript
// Add to ThemeConfig.display
currency: {
  baseCurrency: "CZK" | "EUR";
  displayCurrencies: ("CZK" | "EUR" | "USD" | "CNY")[];
  displayMode: "single" | "multi" | "toggle";
  rates: {
    CZK: number;  // 1 if base, or conversion rate
    EUR: number;
    USD: number;
    CNY: number;
  };
  showSymbols: boolean;  // $ vs USD
  compactMode: boolean;  // 250 vs 250.00
}
```

### UI Changes

1. **PriceDisplay.svelte**: Enhanced to show multiple currencies
2. **Admin Theme Editor**: New "Currency" section with:
   - Base currency dropdown
   - Currency toggles (enable/disable each)
   - Exchange rate inputs
   - Display mode selector
3. **Optional**: Customer toggle button on menu views

## Scope

### In Scope
- Currency configuration in theme settings
- Multi-currency price display component
- Exchange rate management in admin
- Proper formatting per currency locale

### Out of Scope
- Live exchange rate API integration
- Per-item currency override
- Historical rate tracking
- Currency-based pricing tiers

## Technical Approach

### Dependencies
- **money.js** (~1KB) - lightweight currency math
- No external APIs required

### Files to Modify
1. `src/lib/theme/defaults.ts` - Add currency config to ThemeConfig
2. `src/lib/components/PriceDisplay.svelte` - Multi-currency rendering
3. `src/routes/admin/theme/+page.svelte` - Currency settings UI
4. `convex/settings.ts` - Currency defaults in theme

### Files to Create
1. `src/lib/currency/converter.ts` - money.js wrapper
2. `src/lib/currency/formats.ts` - Currency formatting helpers

## Alternatives Considered

1. **Live API rates (exchangeratesapi.io)**: Rejected - adds complexity, API keys, potential failures
2. **Dinero.js**: Rejected - overkill for display-only use case
3. **Intl.NumberFormat only**: Rejected - doesn't handle conversion math

## Success Criteria

- [ ] Prices display in configured currencies
- [ ] Admin can change base currency and rates
- [ ] Multi-currency display works on mobile and TV views
- [ ] No external API dependencies
- [ ] Works offline/cached
