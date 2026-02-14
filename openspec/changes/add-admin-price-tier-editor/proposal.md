# Change: Add Admin Price Tier Editor + Quick Image Swap + Live Preview

## Why
Menu items (especially dumplings) have multi-tier pricing in the Convex schema and TV display, but the admin UI has no way to view or edit price tiers. Staff must update tiers through the Convex dashboard or seed scripts. Additionally, there's no consolidated view of all TV displays and image changes require entering full edit mode.

## What Changes
- New `PriceTierEditor.svelte` component for managing priceTiers array with quick-add preset buttons
- `MenuItemEditor.svelte` loads and saves priceTiers
- Admin menu list shows tier pricing inline
- Quick image swap: clickable thumbnails in admin list with popover picker, Convex-backed
- `ImagePicker.svelte` gains custom URL input and clear button
- New `/admin/preview` route with consolidated iframe view of all TV pages
- Admin sidebar gains Preview and Events navigation links
- One-time dumpling price migration to 6ks/12ks tiers

## Impact
- Affected specs: menu-display
- Affected code:
  - `src/lib/components/admin/MenuItemEditor.svelte`
  - `src/lib/components/admin/ImagePicker.svelte`
  - `src/routes/admin/menu/+page.svelte`
  - `src/routes/admin/+layout.svelte`
  - `convex/seed.ts`
- New files:
  - `src/lib/components/admin/PriceTierEditor.svelte`
  - `src/routes/admin/preview/+page.svelte`
- No schema or backend changes needed
