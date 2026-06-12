# Tasks: Display section composer

## 1. Atoms & section components

- [ ] 1.1 Extract atoms from existing TV components: `ItemPhoto`, `PriceTag`, `BilingualName`, `SectionTitle` (`src/lib/components/atoms/`); existing `Tv*` components consume them with zero visual change (Storybook stories per atom)
- [ ] 1.2 Section components (`src/lib/components/sections/`): `InfoCards`, `ExtrasList` (reads `extras` category), `CategoryPhotoGrid` (categoryId, columns, photoSize, showPrices, showChinese, maxItems; placeholder tile for missing photos), `TextBanner`
- [ ] 1.3 `SectionRenderer.svelte` + typed registry; unknown section types render nothing and log

## 2. Config backend

- [ ] 2.1 Section config storage per page slug (draft + published) with per-type props validators; save mutation rejects malformed configs
- [ ] 2.2 Default config constant reproducing today's tv-info exactly (absence of config = current behavior)
- [ ] 2.3 Publish appends to version history (`add-displays-control-center` pipeline, or fallback direct mode that still appends versions)

## 3. tv-info rebuild

- [ ] 3.1 `tv-info` renders from published section config via `SectionRenderer`; delete hardcoded extras/drinks arrays in the same PR as the default config
- [ ] 3.2 Side-by-side visual comparison (dev render vs current prod screenshot) — no unintended regressions before promotion

## 4. Drinks as data

- [ ] 4.1 Confirm drinks lineup/prices with owner (proposal: Wang Lao Ji 85, Lemonade 89, Tsingtao 79, Coffee 65, Kofola 65)
- [ ] 4.2 Seed `drinks` category + items with photos on dev; promote to prod with sign-off (fixes drinks being invisible to ordering/analytics)

## 5. Admin composer

- [ ] 5.1 Composer panel in `/admin/displays` per page: section list with up/down reorder, visibility toggle, add/remove, type swap
- [ ] 5.2 Per-section props editor (driven by the same validators) with live preview; photo-grid editor warns which items lack photos
- [ ] 5.3 Version history entry per publish; restore re-publishes an old composition

## 6. Verification

- [ ] 6.1 Unit tests: registry resolution, props validation, default-config equivalence
- [ ] 6.2 Playwright: compose page (add photo grid, reorder, hide section) → publish → TV route reflects it; stale/unknown config type renders page without crash
- [ ] 6.3 `npm run check` green; owner walkthrough; prod promotion (explicit) — verifies the extras price drift (79→69 Kč Pork) is fixed on the live TV
