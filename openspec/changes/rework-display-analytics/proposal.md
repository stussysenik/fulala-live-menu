# Change: Rework display analytics — trustworthy capture, honest metrics, DuckDB-ready export

## Why

The current analytics cannot be trusted, for concrete reasons: (1) the daily aggregation cron in `convex/crons.ts` passes `{ date: new Date(...) }` as a static argument evaluated at deploy time, so it re-aggregates one frozen date forever; (2) wall-mounted TVs never fire `endSession`, so all duration metrics are fiction; (3) the only dimension is `displayType` ("mobile"/"tv") — there is no per-page/route breakdown and no item-level signal, so "which menu items are popular" is unanswerable today.

## What Changes

- **Replace session start/end with event capture** suited to each surface:
  - TVs (always-on): heartbeat ping every 60s per route → the meaningful metric is **uptime per screen per day** (was the display up?), not "sessions".
  - Mobile/home (visitors): `pageview` events with route + viewport, plus `item_view` events when a visitor expands/taps a menu item — the only honest popularity signal available without a POS/ordering integration.
- **Fix the aggregation cron**: date computed inside the internal mutation at run time (arg optional, defaults to "yesterday"); backfill aggregates for stored raw data where possible.
- **New aggregate shape**: per date × route — pageviews, unique sessions, peak hour, TV uptime minutes; per date × item — view counts. Raw events pruned after 30 days by cron; aggregates kept forever.
- **DuckDB-ready export**: a Convex HTTP action serving raw events and aggregates as CSV/NDJSON for a date range (`/export/analytics?from&to&format`). Analysis happens locally with vanilla DuckDB (`duckdb -c "SELECT ... FROM read_csv_auto('export.csv')"`) — no embedded analytics engine, no new infrastructure. Documented one-liners in the admin Analytics page.
- **Admin Analytics page rebuilt** around the honest metrics: screen uptime per day, visitor pageviews by route and hour, top viewed items — with an explicit note on what the data can and cannot claim.
- **BREAKING** (internal only): `analytics.startSession`/`endSession` mutations and the `displayAnalytics` session model are replaced by the event model; old rows are migrated into events or archived.

## Impact

- Affected specs: new capability `display-analytics`.
- Affected code:
  - `convex/schema.ts` — new `trafficEvents` table + reshaped `analyticsAggregates`
  - `convex/analytics.ts` — event ingestion, fixed `aggregateDaily`, pruning, summary queries
  - `convex/crons.ts` — fix static-date bug, add pruning job
  - `convex/http.ts` (new) — export HTTP action
  - `src/routes/+layout.svelte` / TV layout — heartbeat + pageview beacons
  - `src/lib/components/MenuItem.svelte` — item_view beacon on expand
  - `src/routes/admin/analytics/+page.svelte` — rebuilt dashboard
- Out of scope: order-based popularity (needs active ordering flow), embedded DuckDB-WASM dashboards (revisit only if local DuckDB one-liners prove insufficient).
