# Change: Admin display controls — per-page settings, Displays hub, safety banner

## Why

The TV pages (`/tv-info`, `/tv-dumplings`, `/tv-noodles`) render directly from `menu.getFullMenu` and ignore every existing config surface (theme `display.showImages`, `displayLayouts` config). There is no way to hide images on one screen, tweak a single section, or manage the displays "on the go" — and the admin gives no signal about which Convex deployment (sandbox vs production) an edit will hit, which the owner explicitly requires before trusting the tool.

## What Changes

- Add per-page display settings stored in `siteSettings` (key `page-settings`, map of route slug → `{ showImages, showChinese, showAllergens }`) with `settings.getPageSettings` query and `settings.updatePageSetting` mutation (merge-patch semantics, one slug at a time).
- Thread the settings through `TvCategory`/`TvMenuItem` and read them in each `(tv-portrait)` page; all flags default to `true` so unconfigured pages render exactly as today (no visual regression).
- Add a new admin hub at `/admin/displays`: one card per managed display page (`tv-dumplings`, `tv-noodles`, `tv-info`, home `/`) with instant toggle switches, an "open page" link, and a jump to that page's menu section for item-level edits.
- Reorganize the admin sidebar nav into utilitarian groups (Manage / Configure / Tools) and add the missing `/admin/layout` entry plus the new `/admin/displays` entry.
- Add an always-visible environment banner in the admin layout derived from the Convex URL: amber "SANDBOX" for the dev deployment, red "PRODUCTION" otherwise — so a write can never be misdirected unknowingly.
- Workflow constraint (process, not code): local development targets the dev deployment (`focused-giraffe-228`) only; production (`cheery-setter-27`) is changed solely via an explicit, user-triggered promotion step.

## Impact

- Affected specs: `menu-display` (TV pages now respect per-page settings — ADDED requirements), new capability `display-management` (admin hub, environment banner).
- Affected code:
  - `convex/settings.ts` — new query/mutation (no schema change; reuses `siteSettings` key/value idiom)
  - `src/lib/components/tv/TvMenuItem.svelte`, `TvCategory.svelte` — optional props, default-on
  - `src/routes/(tv-portrait)/tv-dumplings|tv-noodles|tv-info/+page.svelte` — read settings
  - `src/routes/admin/displays/+page.svelte` — new hub page
  - `src/routes/admin/+layout.svelte` — grouped nav + environment banner
- No breaking changes; defaults preserve current rendering byte-for-byte when no settings exist.
