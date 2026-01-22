# Change: Fix Currency Toggle Instantaneous Highlighting

## Why
The currency toggle (CurrencyLens component) sometimes doesn't immediately highlight the selected button when clicked. The `isSelected()` function is not reactive and may not update synchronously with the Svelte store change, causing a visual delay.

## What Changes
- Replace function-based selection check with reactive statement
- Ensure `class:active` binding updates immediately on click
- Add explicit test for instantaneous visual feedback

## Impact
- Affected specs: currency
- Affected code: `src/lib/components/CurrencyLens.svelte`, `tests/currency.spec.ts`
