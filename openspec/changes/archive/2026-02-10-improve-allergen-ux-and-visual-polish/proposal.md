# Change: Improve allergen UX and visual polish

## Why
Allergen badges on menu items currently show only numeric codes (e.g., "1a", "6"), requiring users to cross-reference a separate legend table. EU sub-allergens like "1a" (Wheat) are missing from the legend entirely. The allergen information must be instantaneously recognizable for customer safety and convenience.

Additionally, the visual presentation of the info/allergen sections needs cohesion improvements — removing jarring separator borders and tightening spacing so the content reads as a unified block.

## What Changes
- Add CSS tooltip on allergen badge hover showing the allergen name in the current language
- Add inline allergen name summary text below badges on each menu item (e.g., "Pšenice, Vejce, Sója")
- Show sub-allergens (1a–1d for Cereals) in the AllergenLegend table
- Enrich `getAllergenByCode()` return type with `subTypeCZ` for bilingual tooltip support
- Add `getAllergenDisplayName()` utility for resolving code → localized name
- Remove hard `border-top` separators from CustomerInfo and AllergenLegend sections

## Impact
- Affected specs: `menu-display` (allergen display behavior)
- Affected code:
  - `src/lib/allergens/index.ts` — new helper + enriched return type
  - `src/lib/components/AllergenBadge.svelte` — CSS tooltip
  - `src/lib/components/AllergenLegend.svelte` — sub-allergen rows, remove border
  - `src/lib/components/MenuItem.svelte` — inline allergen summary
  - `src/lib/components/CustomerInfo.svelte` — remove border
