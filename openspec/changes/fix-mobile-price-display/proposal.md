# Proposal: Fix Mobile Price Display and Simplify Default

## Summary

Change default price display mode from `multi` to `single` currency to improve mobile responsiveness and reduce visual clutter. The existing CurrencyLens component allows users to globally switch between currencies, providing a cleaner, more focused mobile experience.

## Motivation

- **Mobile responsiveness issues**: Multi-currency display (e.g., "200 Kč · €8 · $9") clutters small screens and can wrap awkwardly
- **User feedback**: Screenshots show prices overflowing or breaking across lines on mobile devices (< 480px)
- **Better UX**: Single price with global currency selector is cleaner and more intuitive than showing all prices simultaneously
- **Mobile-first principle**: Most customers view menus on mobile devices; default should optimize for this

## User Stories

1. **As a mobile user**, I want to see one clean price without clutter so I can quickly scan menu items
2. **As a customer**, I want to easily switch currencies globally using the currency selector buttons
3. **As a restaurant owner**, I want my menu to look professional on all screen sizes without overflow issues

## Current State

**Before this change:**
- Default `displayMode: "multi"` shows all currencies: "200 Kč · €8 · $9"
- CurrencyLens component exists but prices show multiple currencies by default
- Mobile screens can experience overflow and awkward wrapping

**After this change:**
- Default `displayMode: "single"` shows primary currency: "200 Kč"
- CurrencyLens buttons (already in UI) let users switch currencies globally
- Clean, focused mobile experience with instant currency switching

## Proposed Solution

### Single Code Change
**File**: `src/lib/theme/defaults.ts` (line 109)

```typescript
// Before
displayMode: "multi",

// After
displayMode: "single",
```

### Mobile CSS Improvements (Defensive)
**File**: `src/lib/components/PriceDisplay.svelte`

Add mobile optimization for cases where admin theme overrides still use multi-currency mode:

```css
@media (max-width: 480px) {
  .price-multi {
    flex-wrap: nowrap;
    overflow: hidden;
    gap: 0.125rem;
    max-width: 100%;
  }
}
```

This prevents overflow even if multi-currency mode is manually enabled via theme override.

## Scope

### In Scope
- Change default display mode to "single"
- Add mobile CSS safeguards for multi-currency override cases
- Update OpenSpec documentation for mobile-first requirements

### Out of Scope
- Changing exchange rate logic
- Adding new currencies beyond CZK/EUR/USD
- Modifying CurrencyLens component (already works perfectly)
- Admin theme editor UI (already supports all modes)
- TV display mode (uses different breakpoints)

## Impact Assessment

### Code Changes
- `src/lib/theme/defaults.ts`: 1 line change
- `src/lib/components/PriceDisplay.svelte`: Add ~10 lines mobile CSS

### Breaking Changes
**None** - Theme override system still allows admins to set `displayMode: "multi"` or `"toggle"`

### User-Facing Changes
- Default menu view shows single currency
- CurrencyLens selector buttons remain visible and functional
- Clicking currency button updates all prices instantly
- Selection persists via localStorage

### Affected Specs
- `currency/spec.md`: Add mobile-first requirement
- `menu-display/spec.md`: Add responsive price display requirement

## Alternatives Considered

1. **Keep multi-currency default, hide on mobile only**: Rejected - inconsistent behavior across devices
2. **Auto-detect device and switch modes**: Rejected - adds complexity, prefer explicit default
3. **Remove multi-currency mode entirely**: Rejected - useful for some contexts (TV mode, tablets)

## Success Criteria

- ✓ Default `displayMode` changed from "multi" to "single"
- ✓ Only one price shows by default on all screen sizes
- ✓ CurrencyLens visible and functional at top of menu
- ✓ Clicking currency updates all prices < 100ms
- ✓ No price overflow or wrapping on mobile (320px+)
- ✓ Selection persists via localStorage
- ✓ OpenSpec validation passes
- ✓ No regression in existing layouts (DimSumGrid, CardGrid, TraditionalChineseGrid)

## Testing Plan

### Visual Testing (Manual)
- Test viewports: 320px, 375px, 414px, 480px, 768px
- Verify single price displays cleanly (no wrapping)
- Check CurrencyLens buttons visible and styled correctly
- Confirm price color/font consistent across layouts

### Functional Testing
- Click each currency button (Kč, €, $)
- Verify all prices update to selected currency immediately
- Refresh page → selection persists
- Switch between layouts → prices remain in selected currency

### Edge Cases
- Very long item names (30+ chars) don't push price off-screen
- Currency selector disappears if only 1 currency configured
- Theme override to "multi" still works on desktop
- Mobile CSS prevents overflow even with theme override

## Rollback Plan

If issues arise, revert `src/lib/theme/defaults.ts` line 109:
```typescript
displayMode: "multi",
```

Theme override system ensures no data loss or migration needed.
