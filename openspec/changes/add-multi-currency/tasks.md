# Tasks: Add Multi-Currency Support

## 1. Core Currency Infrastructure
- [ ] 1.1 Install money.js dependency (`npm install money`)
- [ ] 1.2 Create `src/lib/currency/converter.ts` with money.js wrapper
- [ ] 1.3 Create `src/lib/currency/formats.ts` with currency formatting helpers
- [ ] 1.4 Add currency types to `src/lib/theme/defaults.ts`

## 2. Theme Configuration Update
- [ ] 2.1 Extend `ThemeConfig` interface with `currency` settings
- [ ] 2.2 Add default currency config (CZK base, EUR/USD/CNY enabled)
- [ ] 2.3 Update `themeToCssVars` if needed for currency display
- [ ] 2.4 Update theme presets with currency defaults

## 3. PriceDisplay Component Enhancement
- [ ] 3.1 Update `PriceDisplay.svelte` to accept currency config from theme
- [ ] 3.2 Implement single-currency display mode
- [ ] 3.3 Implement multi-currency display mode (stacked or inline)
- [ ] 3.4 Add proper locale formatting (CZK: 250 Kč, EUR: €10.50, USD: $11.00, CNY: ¥75)
- [ ] 3.5 Handle compact mode (no decimals for whole numbers)

## 4. Admin Currency Settings UI
- [ ] 4.1 Add "Currency" tab to theme editor (`/admin/theme`)
- [ ] 4.2 Create base currency selector dropdown
- [ ] 4.3 Create display currencies multi-select (checkboxes)
- [ ] 4.4 Create exchange rate input fields with current rate display
- [ ] 4.5 Create display mode selector (single/multi/toggle)
- [ ] 4.6 Add "Fetch Latest Rates" helper button (optional, uses free API)

## 5. Integration & Polish
- [ ] 5.1 Update MenuItem.svelte to pass currency context to PriceDisplay
- [ ] 5.2 Ensure TV view scales multi-currency display properly
- [ ] 5.3 Test with all currency combinations
- [ ] 5.4 Add accessibility labels for screen readers

## 6. Verification
- [ ] 6.1 Verify CZK base currency displays correctly
- [ ] 6.2 Verify EUR base currency displays correctly
- [ ] 6.3 Verify multi-currency mode on mobile view
- [ ] 6.4 Verify multi-currency mode on TV view
- [ ] 6.5 Verify exchange rate updates apply immediately
- [ ] 6.6 Verify theme save/load preserves currency settings
