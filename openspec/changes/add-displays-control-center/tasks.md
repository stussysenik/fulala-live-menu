# Tasks — add-displays-control-center

## 1. Foundation (depends on add-admin-display-controls being committed & deployed to dev)

- [ ] 1.1 Add `displayVersions` table to `convex/schema.ts` (slug, settings, version, publishedAt, note?, index by_slug)
- [ ] 1.2 `convex/settings.ts`: draft read/write (`getDraftPageSettings`, `updateDraftPageSetting` with merge-patch), keep one shared `PageSettings` interface (now incl. `isLive`, `fontScale`, `density`)
- [ ] 1.3 `convex/settings.ts`: `publishPageSettings(slug, note?)` — copy draft slug → published, insert next `displayVersions` row atomically
- [ ] 1.4 `convex/settings.ts`: `getVersions(slug)`, `rollbackPageSettings(slug, versionId)` (re-publish as new version)
- [ ] 1.5 `convex/settings.ts`: `getAdminNav` / `updateAdminNav` (siteSettings key `admin-nav`: map of nav entry id → visible boolean, default all visible)
- [ ] 1.6 `convex/archive.ts`: `diffSnapshots(dateA, dateB)` — items added/removed, price/availability/name changes by item id
- [ ] 1.7 Deploy to dev sandbox and smoke-test functions via `bunx convex dev --once` + dashboard

## 2. TV pages

- [ ] 2.1 TV routes + home: read `?preview=draft` (client-side) and subscribe to draft settings when set
- [ ] 2.2 Standby screen component (branded, bilingual) rendered when published `isLive === false`
- [ ] 2.3 Apply `fontScale`/`density` to existing `--tv-*` CSS custom properties; clamp to bounds in one shared helper

## 3. Admin — Displays hub (single responsibility: page publishing & appearance)

- [ ] 3.1 Hub cards edit the DRAFT (toggles + fontScale slider + density control), never published state directly
- [ ] 3.2 "Unpublished changes" badge per page (deep-compare draft vs published)
- [ ] 3.3 Publish / Discard draft / per-page Live–Standby toggle (publish confirmation states target deployment from env banner)
- [ ] 3.4 Scaled iframe preview of the real route with `?preview=draft`
- [ ] 3.5 Version history panel per page: list versions, view settings, one-click rollback

## 4. Admin — History page (single responsibility: audit trail)

- [ ] 4.1 `/admin/history`: recent-changes feed from `menuArchive` (item, change type, time, before/after price & availability)
- [ ] 4.2 Snapshot browser: pick a date from `getSnapshotDates`, render the menu as of that date
- [ ] 4.3 Diff view: pick two dates → render `diffSnapshots` result grouped by change kind

## 5. Admin — nav visibility & SRP cleanup

- [ ] 5.1 Audit existing admin sections; one job per section (Dashboard=overview, Menu=content CRUD, Displays=publishing/appearance, History=audit, Theme/Layout/Schedule=configure, Analytics/Print/Preview=tools); move/merge anything violating SRP
- [ ] 5.2 Nav visibility editor (small "Customize sidebar" panel): checkbox per nav entry, persisted via `admin-nav` settings; hidden entries remain routable by URL
- [ ] 5.3 `admin/+layout.svelte`: render grouped nav filtered by `admin-nav`; Dashboard and the customize panel are never hideable
- [ ] 5.4 Notion-style collapsible groups: sidebar groups and dashboard sections collapse to parent title; persist collapse state in `localStorage` (per device, no server round-trip)

## 6. Verification

- [ ] 6.1 Playwright: draft edit does NOT change TV page without publish; publish applies it; rollback restores
- [ ] 6.2 Playwright: standby toggle renders standby screen; flipping back restores menu instantly
- [ ] 6.3 Playwright: history page shows a seeded change and a two-date diff
- [ ] 6.4 Playwright: hiding a nav entry removes it from sidebar; direct URL still works
- [ ] 6.5 Visual check on real viewport (1080×1920) for fontScale/density bounds
- [ ] 6.6 `openspec validate add-displays-control-center --strict --no-interactive`
