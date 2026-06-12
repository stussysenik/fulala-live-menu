# order-management — delta

## ADDED Requirements

### Requirement: Order Source and Fulfillment Taxonomy

Every order SHALL carry two orthogonal fields — `source` (`qr | kiosk | staff`: where the order entered) and `fulfillment` (`dine-in | takeout`: how it leaves) — with a locator of table number for dine-in and daily order number for takeout/kiosk pickup.

#### Scenario: Sources converge on one queue
- **WHEN** orders are submitted via QR, kiosk, and staff entry
- **THEN** all appear in the same realtime board queue, each card showing a source badge and its locator

#### Scenario: Taxonomy drives the kitchen ticket
- **WHEN** a kitchen ticket prints
- **THEN** it prominently shows fulfillment type and locator (table # for dine-in, pickup # otherwise)

### Requirement: Live Order Board

The system SHALL provide a staff order board at `/admin/orders` showing all open orders in real time as KDS-style card columns (submitted / preparing / ready) with bump-style transitions.

#### Scenario: New order appears live
- **GIVEN** the board is open
- **WHEN** a customer submits an order
- **THEN** the order appears in the "submitted" column within 2 seconds with an audible beep and visual flash
- **AND** the card shows daily order number, source badge, locator, fulfillment, items with selected options, notes, and an age timer

#### Scenario: Card age coloring
- **WHEN** an open order's age crosses 5 and 8 minutes
- **THEN** its card header shifts green → yellow → red respectively

#### Scenario: Bump and recall
- **WHEN** staff taps the bump action on an order card
- **THEN** the order advances one status (submitted→preparing→ready→completed)
- **AND** a "Recall last" action restores the most recently bumped order to its prior status

#### Scenario: Item-level progress marker
- **WHEN** staff taps an item line on a card
- **THEN** the line toggles a strikethrough prep marker without changing order status

#### Scenario: Board recovers after reload
- **WHEN** the board page is reloaded
- **THEN** all open orders render in their current statuses from the database

### Requirement: Table Map View

The board SHALL include a table map: a fixed grid of tiles generated from the tables registry showing each table's live state.

#### Scenario: Tile states
- **WHEN** the table map renders
- **THEN** each active table tile shows empty or open-order state, and open tiles show elapsed time since submission and check total with age coloring

#### Scenario: Tap-through to orders
- **WHEN** staff taps a table tile with an open order
- **THEN** that table's orders are shown with the same transition actions as the board

### Requirement: Manual Staff Order Entry

Staff SHALL be able to create orders on behalf of guests from the admin board, using the same menu, options, and validation as self-checkout.

#### Scenario: Staff creates a sit-in order
- **WHEN** staff opens "New order", picks items (with required options enforced), assigns a table, and submits
- **THEN** the order is created with `source: "staff"` and `fulfillment: "dine-in"`, receives a daily order number, and enters the submitted column

#### Scenario: Staff orders share the lifecycle
- **GIVEN** a staff-entered order exists
- **WHEN** staff advances or cancels it
- **THEN** the same state machine and history rules apply as for QR and kiosk orders

### Requirement: Order History and Rollups

The system SHALL retain all orders indefinitely and provide a history view with date-range, source, and fulfillment filters plus live-updating rollups.

#### Scenario: Filter history
- **WHEN** staff selects day, week, month, or a custom range, optionally filtered by source or fulfillment
- **THEN** matching submitted-and-later orders are listed with number, time, source, locator, items, totals, and status

#### Scenario: Rollup cards
- **WHEN** the history view is open
- **THEN** rollups for today, past 7 days, and past 30 days show revenue, order count, average ticket, and top 5 items by quantity
- **AND** rollups update live as orders complete
- **AND** cancelled orders are excluded from revenue and average ticket

#### Scenario: Export for analysis
- **WHEN** an authorized request hits the order export endpoint with a date range
- **THEN** orders stream as CSV or NDJSON suitable for DuckDB/Postgres ingestion

### Requirement: Configurable VAT

Order pricing SHALL apply a VAT rate from configuration rather than code.

#### Scenario: VAT rate change
- **WHEN** an admin updates the VAT rate in settings
- **THEN** subsequently calculated orders use the new rate
- **AND** previously stored order totals are not retroactively modified
