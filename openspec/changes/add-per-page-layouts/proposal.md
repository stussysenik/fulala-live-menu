# Change: Per-Page Layout Configuration (v0.3.0)

## Why

Different pages in the menu system have different use cases. The TV display needs a visually striking layout for passive viewing, while the order page benefits from a compact, selection-focused design. Previously, one layout configuration applied to all pages, limiting customization options.

## What Changes

- **ADDED** pageType field to displayLayouts schema (values: "display" | "order")
- **ADDED** Traditional Chinese layout type with classic dim sum order sheet styling
- **ADDED** Color scheme options for Traditional Chinese layout (classic-red, jade-green, gold)
- **ADDED** CurrencyConfigEditor admin component for currency display settings
- **ADDED** Page type tabs in /admin/layout for switching between display/order configs
- **ADDED** Build-time environment validation to prevent broken deployments
- **MODIFIED** Layout queries to accept pageType parameter
- **MODIFIED** LayoutRenderer component to accept pageType prop

## Impact

- Affected specs: display-layouts (new capability)
- Affected code:
  - `convex/schema.ts` - Added pageType field
  - `convex/layouts.ts` - Updated queries for per-page support
  - `src/lib/components/layouts/LayoutRenderer.svelte` - Added pageType prop
  - `src/lib/components/layouts/TraditionalChineseGrid.svelte` - New component
  - `src/lib/components/admin/CurrencyConfigEditor.svelte` - New component
  - `src/routes/admin/layout/+page.svelte` - Added page type tabs
  - `scripts/validate-env.cjs` - New build validation script
