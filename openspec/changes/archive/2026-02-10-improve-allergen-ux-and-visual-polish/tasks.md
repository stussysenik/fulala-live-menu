## 1. Allergen Data Layer
- [x] 1.1 Enrich `getAllergenByCode()` to return `subTypeCZ` alongside `subType`
- [x] 1.2 Add `getAllergenDisplayName(code, lang)` helper that resolves a code to its localized name

## 2. Allergen Badge Tooltip
- [x] 2.1 Add CSS-only tooltip (`::after` pseudo-element with `data-tooltip` attribute) to `AllergenBadge.svelte`
- [x] 2.2 Tooltip shows allergen name in current language on hover/focus
- [x] 2.3 Keep `title` attribute as accessibility fallback

## 3. Inline Allergen Summary on Menu Items
- [x] 3.1 Compute `allergenSummary` reactive string from `item.allergenCodes` using `getAllergenDisplayName()`
- [x] 3.2 Render summary as comma-separated muted text below allergen badges
- [x] 3.3 Style with small font size, muted color, matching item description aesthetics

## 4. Sub-Allergens in Legend
- [x] 4.1 Add nested `{#each allergen.subTypes}` loop in `AllergenLegend.svelte`
- [x] 4.2 Show sub-type code, primary name, and secondary name in both languages
- [x] 4.3 Style sub-type rows with indent and smaller font

## 5. Visual Cohesion
- [x] 5.1 Remove `border-top` separator from `CustomerInfo.svelte`
- [x] 5.2 Remove `border-top` separator from `AllergenLegend.svelte`
- [x] 5.3 Verify `.top-info` wrapper provides unified spacing via flexbox gap

## 6. Verification
- [x] 6.1 `npx svelte-check` passes with 0 errors
- [x] 6.2 Hover allergen badge → tooltip shows localized name
- [x] 6.3 Menu items show inline allergen names below badges
- [x] 6.4 AllergenLegend shows sub-allergens (1a Wheat, 1b Rye, 1c Barley, 1d Oats)
- [x] 6.5 Info + allergen sections have no jarring border separators
