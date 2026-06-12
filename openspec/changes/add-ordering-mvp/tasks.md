# Tasks: Self-checkout ordering MVP

## 0. Pre-work

- [ ] 0.1 Commit pending `add-admin-display-controls` work (code + spec) so this change starts from a clean tree
- [ ] 0.2 Create `src/lib/domain/` with `pricing.ts`, `orderStateMachine.ts`, `optionValidation.ts` (pure TS + vitest unit tests; no Convex imports)

## 1. Menu options correctness

- [ ] 1.1 Schema: per-item option config — `menuItems.optionGroups` (group key, allowed values, required flag) superseding loose `modifiers`/`drinkOptions` reads; keep legacy fields readable
- [ ] 1.2 `optionValidation.ts`: selection-vs-config validation (unknown group, unknown value, missing required)
- [ ] 1.3 `convex/orders.ts`: validate selections in `addItemToOrder`; reject submission with missing required options
- [ ] 1.4 `ItemModifierEditor.svelte`: required/optional toggle per group, values editor, live validation preview
- [ ] 1.5 `ModifierSelector.svelte`: render required groups first, block add-to-cart until required groups picked
- [ ] 1.6 Audit all 23 prod items' option configs with owner; seed correct configs (dev first, promote with sign-off)

## 2. QR self-checkout

- [ ] 2.1 Schema + CRUD for `tables` registry (number, label, isActive); counter = table 0
- [ ] 2.2 `/order?table=N`: validate against registry, stamp `tableNumber` on active order, show table badge in cart
- [ ] 2.3 Submission: assign daily `orderNumber` (Europe/Prague day key), set `source: "qr"`, `fulfillment: "dine-in"`
- [ ] 2.4 `/order/status` page: live order status (submitted → preparing → ready) by sessionId, shows order number + ETA-free messaging
- [ ] 2.5 Admin QR poster sheet: per-table QR (client-side generation) on printable A4, plus per-table links list
- [ ] 2.6 Playwright e2e: scan-link → add items with required options → submit → status page updates on transition

## 3. Kiosk self-order mode

- [ ] 3.1 `/kiosk` route shell: fullscreen layout, attract screen ("Tap to start"), eat-in/takeaway choice upfront, ≥60px touch targets, persistent Back, explicit scroll affordances
- [ ] 3.2 Menu browse: category rail + item grid reusing menu queries and `LayoutRenderer` where sensible; modifier sheet enforcing required groups
- [ ] 3.3 Persistent bottom cart bar; submit sets `source: "kiosk"`, chosen `fulfillment`, daily order number as pickup locator
- [ ] 3.4 Confirmation screen: large order number + "pay at counter" instruction; sessionId rotates after each order
- [ ] 3.5 Idle reset: 45s inactivity → 15s warning overlay → clear cart, return to attract screen
- [ ] 3.6 Playwright e2e: attract → takeaway order with required options → confirmation number; idle-timer reset path

## 4. Order management (POS board, table map, history/analytics)

- [ ] 4.1 Schema: extend `customerOrders` with `status` superset, `source`, `fulfillment`, `orderNumber`, `dayKey`; indexes `by_status`, `by_day`
- [ ] 4.2 `transitionOrder` mutation gated by `orderStateMachine.ts`; remove `completeOrder`; cancellation requires reason note
- [ ] 4.3 `/admin/orders` live board: status columns (submitted / preparing / ready); cards show order number, source badge, locator (table or pickup #), fulfillment, items+options, notes, age timer with green/yellow/red aging at 5/8 min; new-order beep + flash; bump-to-advance, Recall last, item-line strikethrough toggle
- [ ] 4.4 Table map view: fixed grid of tiles from `tables` registry — state (empty/open), elapsed time, check total; tap tile → that table's orders; color aging
- [ ] 4.5 Manual staff order entry: item picker (reuses menu + option validation), table or takeout, submits as `source: "staff"`
- [ ] 4.6 History view: day/week/month/custom range + source/fulfillment filters; rollup cards (revenue, orders, avg ticket, top 5 items) for today / 7d / 30d, live-updating; cancelled excluded from revenue
- [ ] 4.7 `convex/http.ts`: CSV/NDJSON order export (date range), token-protected
- [ ] 4.8 VAT config (`siteSettings: vat-config`) applied via `pricing.ts`; admin field in settings
- [ ] 4.9 Unit tests (state machine, pricing, rollups) + Playwright: submit (qr + kiosk) → appears on board with correct badge → transition → history reflects

## 5. Receipt printing

- [ ] 5.1 Confirm printer model/interface with owner; document in `tools/print-agent/README.md`
- [ ] 5.2 Schema: `printJobs` table (orderId, kind: kitchen|receipt, status: pending|printed|failed, attempts)
- [ ] 5.3 Enqueue kitchen ticket job on submission; Reprint/receipt button on board enqueues receipt job
- [ ] 5.4 `tools/print-agent/`: Node service — Convex subscription on pending jobs, ESC/POS rendering (kitchen ticket: big order #, source + fulfillment, table/pickup locator, items+options; receipt: prices, VAT breakdown, totals), retry w/ backoff, graceful printer-offline queueing
- [ ] 5.5 Agent ops: `.env` config (deployment URL, printer), systemd/launchd unit example, heartbeat row so admin board shows agent online/offline
- [ ] 5.6 End-to-end test with real printer in shop (owner-assisted)

## 6. Display layout templates

- [ ] 6.1 Schema: `displayLayouts.pageSlug` (optional); resolution: slug match → pageType default → standard-list
- [ ] 6.2 `convex/layouts.ts`: `getLayoutForPage(slug)` query + `assignLayoutToPage` mutation
- [ ] 6.3 Template gallery in `/admin/displays`: visual cards (mini preview per layout type) per display page, current assignment highlighted
- [ ] 6.4 Wire TV pages + home + order page through `getLayoutForPage` (dev sandbox only until sign-off)
- [ ] 6.5 Playwright: assign template to a page → page renders that layout

## 7. Verification & release

- [ ] 7.1 `npm run check` + unit + e2e suites green
- [ ] 7.2 Full-loop demo on dev: QR and kiosk orders → board (badges, aging, bump) → print job → completed → history rollups correct
- [ ] 7.3 Owner walkthrough; collect go/no-go for prod promotion
- [ ] 7.4 Prod promotion (explicit step): deploy code, seed tables registry + option configs, verify TVs unchanged visually
