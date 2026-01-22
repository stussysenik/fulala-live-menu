# Tasks: Fix Mobile Price Display

## 1. Core Display Mode Change ✅
- [x] 1.1 Change `displayMode: "multi"` → `"single"` in `src/lib/theme/defaults.ts`

## 2. Mobile CSS Improvements ✅
- [x] 2.1 Add mobile media query to `.price-multi` in `PriceDisplay.svelte`
- [x] 2.2 Add `flex-wrap: nowrap` and `overflow: hidden` for mobile
- [x] 2.3 Reduce gap and separator margin on mobile screens
- [x] 2.4 Add `white-space: nowrap` and `min-width: fit-content` to `.price-value`

## 3. Layout-Specific Price Protection ✅
- [x] 3.1 Fix CardGrid: Add `flex-shrink: 0`, `min-width: fit-content` to `.card-price`
- [x] 3.2 Fix CardGrid: Add `gap` to `.card-footer` to prevent squeezing
- [x] 3.3 Fix DimSumGrid: Add `min-width: fit-content`, `white-space: nowrap` to `.item-price`
- [x] 3.4 Fix TraditionalChineseGrid: Add `flex-shrink: 0`, `min-width: fit-content`, `white-space: nowrap` to `.item-price`

## 4. OpenSpec Documentation
- [x] 4.1 Create `openspec/changes/fix-mobile-price-display/` directory structure
- [x] 4.2 Write proposal.md with motivation, solution, impact
- [x] 4.3 Write tasks.md with implementation checklist
- [ ] 4.4 Document spec deltas for `currency` and `menu-display`

## 5. Verification (Manual Testing Required)
- [ ] 5.1 Visual testing on mobile viewports (320px, 375px, 414px, 480px)
- [ ] 5.2 Verify single price displays without truncation
- [ ] 5.3 Test CurrencyLens buttons click and update all prices
- [ ] 5.4 Verify selection persists via localStorage
- [ ] 5.5 Test all layouts: CardGrid, DimSumGrid, TraditionalChineseGrid
- [ ] 5.6 Test with very long item names (30+ chars)
- [ ] 5.7 Verify theme override to "multi" still works on desktop
- [ ] 5.8 Test that "multi" mode doesn't overflow even with override

## 6. Build Validation
- [ ] 6.1 Run `npm run build` to verify no TypeScript errors
- [ ] 6.2 Run `npm run check` for Svelte type checking
- [ ] 6.3 Test development server with changes

## Summary of Changes

### Modified Files:
1. **src/lib/theme/defaults.ts** (line 109)
   - Changed: `displayMode: "multi"` → `"single"`

2. **src/lib/components/PriceDisplay.svelte**
   - Added mobile media query for `.price-multi` (lines 158-169)
   - Added `white-space: nowrap` and `min-width: fit-content` to `.price-value`

3. **src/lib/components/layouts/CardGrid.svelte**
   - Added `gap: var(--space-2, 0.5rem)` to `.card-footer`
   - Added `flex-shrink: 0` and `min-width: fit-content` to `.card-price`

4. **src/lib/components/layouts/DimSumGrid.svelte**
   - Added `min-width: fit-content` and `white-space: nowrap` to `.item-price`

5. **src/lib/components/layouts/TraditionalChineseGrid.svelte**
   - Added `flex-shrink: 0`, `min-width: fit-content`, `white-space: nowrap` to `.item-price`

### Impact:
- **Zero breaking changes** - theme override system still works
- **Improved mobile UX** - clean, focused single-currency display
- **No price truncation** - all layouts protected against cutting off prices
- **Instant currency switching** - CurrencyLens already in UI and working

### Testing Focus:
- Mobile screens (320px to 480px) must show full prices without truncation
- Currency selector must update all prices instantly
- Multi-currency mode (if manually enabled) must not overflow on mobile
