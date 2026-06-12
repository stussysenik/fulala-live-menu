# Tasks — rework-display-analytics

## 1. Quick fix (ships independently, first)

- [ ] 1.1 Fix `convex/crons.ts` static-date bug: make `aggregateDaily` date arg optional, computed at run time (yesterday UTC)
- [ ] 1.2 Backfill aggregates for any salvageable stored sessions

## 2. Capture

- [ ] 2.1 Schema: `trafficEvents` table (type, route, sessionId, ts, viewport?, itemId?) with `by_ts`, `by_type_ts` indexes
- [ ] 2.2 `convex/analytics.ts`: `track` mutation (validated closed union of event types)
- [ ] 2.3 Client `track()` helper: no-op on SSR, in admin context, and when `preview=draft` is set; ephemeral random sessionId per load
- [ ] 2.4 TV layout: heartbeat every 60s with route; mobile/home layout: pageview on mount
- [ ] 2.5 `MenuItem.svelte`: `item_view` beacon on expand/tap (mobile/home only)

## 3. Aggregation & retention

- [ ] 3.1 Reshape `analyticsAggregates`: per date × route (pageviews, uniqueSessions, peakHour, tvUptimeMinutes) + per date × item (views)
- [ ] 3.2 Rewrite `aggregateDaily` over `trafficEvents`; idempotent upserts
- [ ] 3.3 Prune cron: delete raw events older than 30 days
- [ ] 3.4 Migrate or drop legacy `displayAnalytics` rows (owner decision; default: counts into `legacy` bucket)

## 4. Export & dashboard

- [ ] 4.1 Convex HTTP action `/export/analytics?from&to&format=csv|ndjson&token=…` streaming raw events and aggregates
- [ ] 4.2 Rebuild `/admin/analytics`: screen uptime per day, pageviews by route & hour, top viewed items, each with a "what this measures" note
- [ ] 4.3 Document DuckDB one-liners (read_csv_auto / read_json_auto examples) in the Analytics page

## 5. Verification

- [ ] 5.1 Unit-test aggregation (fixed event fixtures → expected aggregates, incl. date-at-runtime behavior)
- [ ] 5.2 Playwright: TV page emits heartbeats; mobile emits pageview + item_view; admin/preview emits nothing
- [ ] 5.3 Verify cron runs on dev across a real midnight boundary aggregates the correct date
- [ ] 5.4 Export a day of dev data and run the documented DuckDB query against it
- [ ] 5.5 `openspec validate rework-display-analytics --strict --no-interactive`
