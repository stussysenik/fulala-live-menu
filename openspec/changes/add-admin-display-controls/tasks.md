## 1. Backend (Convex, dev sandbox only)

- [x] 1.1 Add `PageSettings` interface + `getPageSettings` query + `updatePageSetting` merge-patch mutation to `convex/settings.ts` (key `page-settings`, no schema change)
- [x] 1.2 Deploy functions to dev sandbox (`bunx convex dev --once`) and smoke-test query/mutation via HTTP API

## 2. TV display wiring

- [x] 2.1 Add optional `showImages` / `showChinese` / `showAllergens` props (default `true`) to `TvMenuItem.svelte` and gate image, Chinese name, and allergen-badge rendering
- [x] 2.2 Pass the three props through `TvCategory.svelte`
- [x] 2.3 Subscribe to `settings.getPageSettings` in `tv-dumplings/+page.svelte` and apply slug `tv-dumplings`
- [x] 2.4 Same for `tv-noodles/+page.svelte` (slug `tv-noodles`)
- [x] 2.5 Apply applicable settings to `tv-info/+page.svelte` (slug `tv-info`; images toggle gates the drinks images)

## 3. Admin Displays hub

- [x] 3.1 Create `/admin/displays/+page.svelte` with a `MANAGED_PAGES` constant (tv-dumplings, tv-noodles, tv-info, home) and one card per page
- [x] 3.2 Each card: toggle switches for Show images / Show Chinese / Show allergens wired to `updatePageSetting` (instant, optimistic via live query)
- [x] 3.3 Each card: "Open page" link (new tab) and "Edit items" link to `/admin/menu` (with category context where it applies)

## 4. Admin IA + safety

- [x] 4.1 Reorganize `admin/+layout.svelte` nav into groups: Manage (Dashboard, Menu Items, Displays), Configure (Layout, Theme, Schedule, Events), Tools (Live Preview, Print, Analytics) — adds missing Layout entry and new Displays entry
- [x] 4.2 Add environment banner to admin layout: amber `SANDBOX` when `VITE_CONVEX_URL` is the dev deployment, red `PRODUCTION` otherwise; always visible

## 5. Verification (localhost, sandbox)

- [x] 5.1 With no saved settings: screenshot `/tv-dumplings` and confirm rendering is unchanged (images visible)
- [x] 5.2 Toggle "Show images" off for `tv-dumplings` in `/admin/displays`; confirm the TV page drops images live (no reload) and other pages are unaffected
- [x] 5.3 Toggle back on; confirm restoration. Verify Chinese-name and allergen toggles likewise
- [x] 5.4 Confirm admin banner reads SANDBOX against `focused-giraffe-228` and nav groups render with all 10 entries
- [x] 5.5 `bun run check` passes (svelte-check) with no new errors
- [x] 5.6 Confirm zero writes to prod: prod `siteSettings` has no `page-settings` row (read-only query)
