# Change: Displays control center — draft/publish, version history, live toggle, menu audit trail

## Why

Edits from `/admin/displays` apply to live TVs instantly with no draft layer, no record of what was published when, and no way to take a screen offline. Separately, the owner needs a defensible audit trail ("on June 3rd the menu said X at price Y") for customer disputes — the backend for this exists (`menuArchive`, `dailySnapshots`) but has zero admin UI and no diff capability.

## What Changes

- **Draft → preview → publish lifecycle** for per-page display settings: edits in `/admin/displays` write to a draft document (`siteSettings` key `page-settings:draft`); TVs keep rendering the published `page-settings` until an explicit per-page Publish. TV routes accept `?preview=draft` so the admin can preview the draft on the real page (scaled iframe in the hub).
- **Version history with rollback**: every publish appends an immutable row to a new `displayVersions` table (slug, settings snapshot, monotonic version, timestamp, optional note). Rollback re-publishes an old version as a new version (publish-forward, never destructive).
- **Live/standby toggle per page**: new `isLive` flag in `PageSettings` (default `true`). When `false`, the TV route renders a branded standby screen instead of menu content — "manage whether they're live" without touching deploys or DNS.
- **Bounded appearance parameters** (reflow-safe, no freeform positioning): `fontScale` (0.85–1.3) and `density` (`compact` | `comfortable` | `spacious`) added to `PageSettings`, applied via existing CSS custom properties on TV pages. Sliders/segmented controls in the hub, visible in draft preview before publish.
- **Admin SRP cleanup + customizable, collapsible navigation**: each admin section keeps exactly one responsibility (Displays = publishing/appearance, History = audit, Menu = content CRUD); a new `admin-nav` setting toggles which nav entries are shown (hidden entries stay URL-reachable; Dashboard never hideable); sidebar groups and dashboard sections collapse Notion-style to their parent title with per-device persisted state.
- **Menu audit trail UI** at `/admin/history`: recent-changes feed from `menuArchive`, snapshot browser over `dailySnapshots` (view the full menu as of any date), and a computed diff between any two snapshot dates (items added/removed, price changes, availability changes) via a new `archive.diffSnapshots` query.

## Impact

- Affected specs: `display-management` (ADDED requirements — builds on pending `add-admin-display-controls`, which MUST ship first), new capability `menu-audit`.
- Affected code:
  - `convex/schema.ts` — new `displayVersions` table (append-only)
  - `convex/settings.ts` — draft read/write, `publishPageSettings`, `rollbackPageSettings`, version queries
  - `convex/archive.ts` — `diffSnapshots` query
  - `src/routes/(tv-portrait)/*/+page.svelte` + `src/routes/+page.svelte` — draft-preview param, standby screen, fontScale/density CSS vars
  - `src/routes/admin/displays/+page.svelte` — draft editing, publish/rollback UI, live toggle, scaled preview iframe
  - `src/routes/admin/history/+page.svelte` — new audit trail page
- Depends on: `add-admin-display-controls` (uncommitted in working tree) being committed and deployed first.
- No breaking changes: absent draft/version data ⇒ current behavior; `isLive` defaults `true`.
