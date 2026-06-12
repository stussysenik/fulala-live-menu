# Change: Self-checkout ordering MVP — QR ordering, live order board, receipt printing, display layout templates

## Why

The menu is live (data now matches the June 2026 print menu) but the restaurant still takes every order by hand. The cart/order backend exists (`customerOrders`, `/order` page) yet there is no way for a customer to start an order from a table QR code, no staff view of incoming orders, no receipts, and item options are configured loosely enough that invalid orders can be submitted. Closing this loop gives Fulala first-hand order data (the direct pipeline for menu iteration) and removes the single biggest operational bottleneck.

## What Changes

- **Menu options correctness**: per-item option configuration becomes authoritative — admins mark which option groups apply to an item and whether each is required; the order pipeline rejects selections that aren't configured for the item and refuses submission while required options are missing. `ItemModifierEditor` gains required/optional control per group.
- **QR self-checkout**: tables (and a "counter" pseudo-table) get stable QR codes pointing at `/order?table=N`. The order page stamps `tableNumber` on the active order (source `qr`, fulfillment `dine-in`), and after submission the customer lands on a live order-status page (`/order/status`) that tracks submitted → preparing → ready in real time. Admin gets a printable QR poster sheet.
- **Kiosk self-order mode**: a dedicated fullscreen `/kiosk` route for a counter tablet, following established kiosk patterns — attract screen → eat-in/takeaway choice → category-rail menu with oversized touch targets → modifier sheet → persistent cart bar → big order-number confirmation. 45s idle timeout with a 15s "still there?" warning resets the session. Kiosk orders record source `kiosk` with the chosen fulfillment and a pickup number as locator.
- **Order taxonomy + lifecycle + live order board (POS)**: orders carry two orthogonal fields — `source` (`qr | kiosk | staff`) and `fulfillment` (`dine-in | takeout`) — plus a human-friendly daily `orderNumber` as locator; `customerOrders.status` extends to `active | submitted | preparing | ready | completed | cancelled`. New `/admin/orders` is the POS: a realtime KDS-style board (cards with source badge, locator, timer; green/yellow/red aging at 5/8 min; new-order beep; bump-to-advance and recall-last), a **table map** — fixed grid of table tiles showing empty/open state, elapsed time and check total, tap-to-open (Toast/Square pattern, no freeform canvas) — manual staff order entry for sit-in guests, and a past-orders view. **BREAKING** for `convex/orders.ts` consumers: `completeOrder` is replaced by a general `transitionOrder` mutation.
- **Order history & analytics**: every order is queryable forever — `/admin/orders` history view filters by day/week/month/custom range and order type, with rollups (revenue, order count, average ticket, top items) computed for today, past 7 days, and past 30 days, live-updating as orders complete. A CSV/NDJSON export endpoint makes the data DuckDB/Postgres-ready (first-hand data pipeline for menu iteration).
- **Receipt printing**: a small standalone Node print agent (in `tools/print-agent/`) subscribes to the orders feed via the Convex client and prints a kitchen ticket on submission and a customer receipt on demand to an ESC/POS thermal printer; admin board gets a Reprint button. The agent queues while the printer is offline and never blocks order flow.
- **Display layout templates**: the `/admin/displays` hub gains a per-page layout template picker — visual template cards (Standard List, Card Grid, Dim Sum Grid, Traditional Chinese) backed by the existing `displayLayouts` table, extended with a per-page-slug assignment so each display page can run a different template, previewed before it goes live.
- **Domain core**: order pricing, status transitions, and option validation live in pure TypeScript modules under `src/lib/domain/` (unit-testable, persistence-agnostic); Convex functions stay thin adapters.

## Non-Goals

- Online card payments (v1 is pay-at-counter; an `add-online-payments` change will follow once order flow is proven).
- Free-form drag-and-drop layout editing (template-based only; bounded appearance controls are covered by `add-displays-control-center`).
- Multi-restaurant/SaaS tenancy.
- Kitchen display system beyond the order board.

## Impact

- Affected specs: NEW `menu-options`, `order-management`, `receipt-printing`; MODIFIED `customer-ordering`; ADDED requirement in `display-layouts`.
- Affected code:
  - `convex/schema.ts` — `customerOrders` status/source/fulfillment/orderNumber fields; `displayLayouts.pageSlug`; `tables` registry (number, label, isActive)
  - `convex/orders.ts` — option validation on add/submit, `transitionOrder`, board/history queries, daily order numbers
  - `convex/menu.ts` / `convex/layouts.ts` — option-group config persistence; per-slug layout assignment queries
  - `src/lib/domain/` — NEW pure modules: `orderStateMachine.ts`, `pricing.ts`, `optionValidation.ts`
  - `src/routes/order/` — table param handling, `/order/status/+page.svelte`
  - `src/routes/kiosk/+page.svelte` — NEW fullscreen kiosk flow
  - `src/routes/admin/orders/+page.svelte` — NEW POS: live board + table map + history
  - `src/routes/admin/displays/+page.svelte` — template picker cards
  - `src/lib/components/admin/ItemModifierEditor.svelte` — required/optional per group
  - `tools/print-agent/` — NEW standalone Node service (ESC/POS)
- Relationship to pending changes: independent of `add-displays-control-center` (publish/live-toggle) and `rework-display-analytics`; the template picker composes with the control center's draft/publish flow if that ships first. `add-admin-display-controls` (complete, uncommitted) should be committed before this work starts.
- Deployment: all work happens against the dev sandbox (`focused-giraffe-228`); promotion to prod (`cheery-setter-27`) is a separate explicit step. No prod code deploys without owner sign-off.
