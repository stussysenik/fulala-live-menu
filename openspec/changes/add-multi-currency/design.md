# Design: Multi-Currency Support

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Theme Settings                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ currency: {                                          │   │
│  │   baseCurrency: "CZK",                              │   │
│  │   displayCurrencies: ["CZK", "EUR", "USD"],         │   │
│  │   displayMode: "multi",                             │   │
│  │   rates: { CZK: 1, EUR: 0.04, USD: 0.044, CNY: 0.31}│   │
│  │ }                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Currency Converter                         │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │   money.js       │───▶│  converter.ts                │  │
│  │   (1KB library)  │    │  - convert(amount, from, to) │  │
│  └──────────────────┘    │  - setRates(rates)           │  │
│                          └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Currency Formatter                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  formats.ts                                          │  │
│  │  - formatCurrency(amount, currency, options)         │  │
│  │  - getCurrencySymbol(currency)                       │  │
│  │  - getLocaleForCurrency(currency)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PriceDisplay Component                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Props: price (cents), currency config from theme    │  │
│  │                                                       │  │
│  │  Single Mode:    "250 Kč"                            │  │
│  │  Multi Mode:     "250 Kč · €10 · $11"                │  │
│  │  Toggle Mode:    [CZK ▼] "250 Kč"                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Admin sets rates** → Saved to Convex `siteSettings.theme.currency`
2. **ThemeProvider loads** → Passes currency config via Svelte context
3. **PriceDisplay renders** → Converts and formats based on config
4. **Customer sees prices** → In their preferred currency format

## Currency Configuration Schema

```typescript
interface CurrencyConfig {
  // Base currency for all prices in database
  baseCurrency: "CZK" | "EUR";

  // Which currencies to display (order matters for multi-mode)
  displayCurrencies: Array<"CZK" | "EUR" | "USD" | "CNY">;

  // How to show multiple currencies
  displayMode: "single" | "multi" | "toggle";

  // Exchange rates relative to base currency
  // If baseCurrency is CZK: CZK=1, EUR=0.04 (1 CZK = 0.04 EUR)
  rates: {
    CZK: number;
    EUR: number;
    USD: number;
    CNY: number;
  };

  // Display options
  showSymbols: boolean;     // true: €10, false: 10 EUR
  compactMode: boolean;     // true: 250, false: 250.00
  showDecimals: boolean;    // false for CZK (250 Kč), true for EUR (€10.50)
}
```

## Default Exchange Rates

Based on approximate January 2025 rates:

| Base | CZK | EUR | USD | CNY |
|------|-----|-----|-----|-----|
| CZK  | 1   | 0.040 | 0.044 | 0.31 |
| EUR  | 25  | 1   | 1.10 | 7.80 |

## Currency Formatting Rules

| Currency | Symbol | Position | Decimals | Example |
|----------|--------|----------|----------|---------|
| CZK | Kč | after | 0 | 250 Kč |
| EUR | € | before | 2 | €10.50 |
| USD | $ | before | 2 | $11.00 |
| CNY | ¥ | before | 0 | ¥75 |

## Display Mode Examples

### Single Mode (default, current behavior)
```
Pork Gyoza (6pc)                    250 Kč
```

### Multi Mode (compact, inline)
```
Pork Gyoza (6pc)            250 Kč · €10 · $11
```

### Multi Mode (stacked, for TV)
```
Pork Gyoza (6pc)                    250 Kč
                                    €10.00
                                    $11.00
```

### Toggle Mode (customer selects)
```
[CZK ▼]  ← dropdown in header
Pork Gyoza (6pc)                    250 Kč
```

## Component Changes

### PriceDisplay.svelte (Enhanced)

```svelte
<script>
  export let price: number;  // in cents of base currency

  // Get from theme context
  const { currency } = getContext('theme');

  $: formattedPrices = currency.displayCurrencies.map(curr => ({
    currency: curr,
    amount: convert(price, currency.baseCurrency, curr),
    formatted: formatCurrency(amount, curr, currency)
  }));
</script>

{#if currency.displayMode === 'single'}
  <span class="price">{formattedPrices[0].formatted}</span>
{:else if currency.displayMode === 'multi'}
  <span class="price-multi">
    {#each formattedPrices as p, i}
      {#if i > 0}<span class="separator">·</span>{/if}
      <span class="price-{p.currency}">{p.formatted}</span>
    {/each}
  </span>
{/if}
```

## Admin UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ Currency Settings                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Base Currency                                               │
│ ┌─────────────────┐                                        │
│ │ CZK (Kč)      ▼ │  Prices in database are stored in     │
│ └─────────────────┘  this currency                         │
│                                                             │
│ Display Currencies                                          │
│ ☑ CZK (Czech Koruna)                                       │
│ ☑ EUR (Euro)                                               │
│ ☑ USD (US Dollar)                                          │
│ ☐ CNY (Chinese Yuan)                                       │
│                                                             │
│ Exchange Rates (per 1 CZK)                                 │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ EUR: [0.040  ]  │ USD: [0.044  ]  │ CNY: [0.31   ]  │   │
│ └──────────────────────────────────────────────────────┘   │
│ [Fetch Latest Rates]  Last updated: Jan 15, 2025          │
│                                                             │
│ Display Mode                                                │
│ ○ Single currency (show first selected only)               │
│ ● Multiple currencies (show all inline)                    │
│ ○ Customer toggle (let customers switch)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases

1. **Base currency change**: Requires price migration or clear warning
2. **Rate of 0**: Prevent in UI, show error
3. **Missing rate**: Fall back to base currency only
4. **Very small amounts**: Round appropriately per currency
5. **TV view spacing**: May need stacked vs inline based on column count

## Performance Considerations

- money.js is 1KB, loads instantly
- Conversion is pure math, no async
- Rates cached in theme context
- No external API calls in render path
