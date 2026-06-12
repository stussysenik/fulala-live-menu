# customer-ordering — delta

## ADDED Requirements

### Requirement: QR Table Entry

The system SHALL support per-table QR codes that open the order page with the table pre-assigned, backed by a registry of active tables.

#### Scenario: Customer scans a table QR code
- **WHEN** a customer opens `/order?table=N` for an active table N
- **THEN** the active order is stamped with table N
- **AND** the cart UI shows the table badge

#### Scenario: Invalid table parameter
- **WHEN** the `table` parameter does not match an active table in the registry
- **THEN** the order page loads without a table assignment and shows a neutral hint to ask staff

#### Scenario: Admin prints QR posters
- **WHEN** an admin opens the QR poster view
- **THEN** a printable sheet renders one QR code per active table (plus counter) with stable URLs

### Requirement: Kiosk Self-Order Mode

The system SHALL provide a fullscreen kiosk flow at `/kiosk` for a counter tablet, distinct from QR table ordering, recording `source: "kiosk"` and the customer's chosen fulfillment.

#### Scenario: Kiosk order happy path
- **WHEN** a customer taps the attract screen, chooses eat-in or takeaway, adds items (required option groups enforced via the modifier sheet), and submits from the persistent cart bar
- **THEN** the order is created with `source: "kiosk"`, the chosen `fulfillment`, and a daily order number
- **AND** a confirmation screen shows the order number large with a "pay at counter" instruction

#### Scenario: Idle timeout resets the kiosk
- **GIVEN** a kiosk session with items in the cart
- **WHEN** there is no interaction for 45 seconds
- **THEN** a warning overlay offers 15 more seconds
- **AND** if still untouched, the cart is cleared and the attract screen returns

#### Scenario: Sessions never bleed between customers
- **WHEN** a kiosk order completes or the kiosk resets
- **THEN** a fresh sessionId is issued so the next customer starts with an empty cart

#### Scenario: Kiosk touch ergonomics
- **WHEN** the kiosk flow renders
- **THEN** interactive targets are at least 60px, a Back control is always visible, and scrollable areas show explicit affordances

### Requirement: Order Status Tracking Page

After submission, customers SHALL see a live status page for their order without authentication.

#### Scenario: Status updates in real time
- **GIVEN** a customer submitted an order with daily number #42
- **WHEN** staff transitions the order to `preparing` and later `ready`
- **THEN** the customer's status page reflects each transition within 2 seconds without reload

#### Scenario: Returning to status from a closed tab
- **WHEN** the customer reopens the site with the same sessionId while their order is open
- **THEN** they can reach the status page for that order

## MODIFIED Requirements

### Requirement: Order Submission

The system SHALL allow customers to submit orders, transitioning them from active to submitted status, assigning a sequential daily order number plus source and fulfillment fields, and validating that all required option groups are satisfied.

#### Scenario: Submit order with table number
- **GIVEN** cart contains at least one item
- **WHEN** customer submits with table number "12" (entered or pre-assigned via QR)
- **THEN** order status changes from active to submitted
- **AND** order cannot be modified further
- **AND** the order receives the next daily order number (per Europe/Prague calendar day)
- **AND** `source` is recorded as `qr` with `fulfillment: "dine-in"` (kiosk flow records `kiosk` + chosen fulfillment)
- **AND** customer is redirected to the live order status page

#### Scenario: Submit order with notes
- **GIVEN** cart contains items
- **WHEN** customer enters notes "No onions, extra spicy" and submits
- **THEN** order is submitted with notes field populated
- **AND** notes appear on the order status page, kitchen ticket, and receipt

#### Scenario: Submit order without table number
- **GIVEN** cart contains items and no table assignment
- **WHEN** customer submits
- **THEN** order is submitted successfully
- **AND** tableNumber field is undefined in database

#### Scenario: Submit blocked while required options missing
- **GIVEN** a cart line is missing a value for a required option group
- **WHEN** customer attempts to submit
- **THEN** submission is rejected and the offending line is identified to the customer

#### Scenario: Cannot submit empty cart
- **GIVEN** cart is empty
- **WHEN** customer attempts to click "Submit Order"
- **THEN** submit button is disabled
- **AND** customer sees message "Cart is empty"

### Requirement: Order Lifecycle States

The system SHALL manage orders through the lifecycle `active → submitted → preparing → ready → completed`, with `cancelled` reachable from `submitted`, `preparing`, or `ready`. Transitions SHALL be validated by a single state machine shared between backend and UI.

#### Scenario: Create order in active state
- **GIVEN** customer has no existing active order
- **WHEN** customer adds first item to cart
- **THEN** new order is created with status: "active"
- **AND** order appears in database with active status

#### Scenario: Transition to submitted state
- **GIVEN** order is in active state
- **WHEN** customer submits the order
- **THEN** order status changes to "submitted"
- **AND** order timestamp is recorded
- **AND** order is immutable from customer perspective

#### Scenario: Staff advances order through kitchen states
- **GIVEN** order is in submitted state
- **WHEN** staff transitions it on the order board
- **THEN** allowed transitions are submitted→preparing, preparing→ready, ready→completed
- **AND** each transition is timestamped
- **AND** completed orders appear in order history

#### Scenario: Invalid transition rejected
- **WHEN** a transition not allowed by the state machine is attempted (e.g., completed→preparing)
- **THEN** the mutation rejects it with a descriptive error

#### Scenario: Cancellation requires a reason
- **GIVEN** order is in submitted, preparing, or ready state
- **WHEN** staff cancels the order
- **THEN** a cancellation reason note is required and stored
- **AND** the order is excluded from revenue rollups

#### Scenario: Cannot modify submitted order
- **GIVEN** order is in submitted state
- **WHEN** customer attempts to add/remove items
- **THEN** modification is rejected
- **AND** customer sees message "Order already submitted"

#### Scenario: Legacy orders remain valid
- **GIVEN** orders stored before this change (statuses active/submitted/completed, no source/fulfillment)
- **WHEN** they are read by queries or the history view
- **THEN** they are treated as valid, with `source` defaulting to `qr` and `fulfillment` to `dine-in`
