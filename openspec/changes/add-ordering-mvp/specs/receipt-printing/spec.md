# receipt-printing — delta

## ADDED Requirements

### Requirement: Print Job Queue

The system SHALL represent every print request as a persistent job (kitchen ticket or customer receipt) so printing is decoupled from order flow.

#### Scenario: Kitchen ticket enqueued on submission
- **WHEN** an order transitions to submitted
- **THEN** a pending kitchen-ticket print job is created for it

#### Scenario: Receipt on demand
- **WHEN** staff taps Print receipt / Reprint on an order card
- **THEN** a pending receipt print job is created for that order

#### Scenario: Printing never blocks orders
- **GIVEN** no print agent is connected
- **WHEN** orders are submitted and transitioned
- **THEN** order flow proceeds normally and jobs accumulate as pending

### Requirement: Print Agent

A standalone print agent (Node service on shop hardware) SHALL subscribe to pending print jobs and print them to an ESC/POS thermal printer, with retry and offline tolerance.

#### Scenario: Agent prints a kitchen ticket
- **GIVEN** the agent is running and the printer is online
- **WHEN** a pending kitchen-ticket job appears
- **THEN** the agent prints order number (large), fulfillment type, locator (table # or pickup #), source badge, items with options and notes, and timestamp
- **AND** marks the job printed

#### Scenario: Receipt content
- **WHEN** a receipt job prints
- **THEN** it includes items with unit prices, option add-on prices, subtotal, VAT breakdown, total, order number, and timestamp

#### Scenario: Printer offline retry
- **GIVEN** the printer is unreachable
- **WHEN** the agent attempts a job
- **THEN** the job stays pending/failed with attempt count and is retried with backoff once the printer returns

#### Scenario: Agent presence visible to staff
- **WHEN** the agent heartbeat is stale
- **THEN** the admin order board shows a printer-offline indicator
