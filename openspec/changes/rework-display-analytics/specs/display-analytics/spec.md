# Delta — display-analytics

## ADDED Requirements

### Requirement: Event-Based Traffic Capture

The system SHALL capture display traffic as append-only events of a closed type set: `pageview` (route, session, viewport), `heartbeat` (route, session; emitted by always-on TV displays at a fixed interval), and `item_view` (route, session, menu item; emitted on visitor item interaction). Events MUST NOT contain personal data; session identifiers SHALL be ephemeral per page load.

#### Scenario: TV emits heartbeats
- **WHEN** a TV display page is open
- **THEN** a heartbeat event with that page's route is recorded approximately every 60 seconds

#### Scenario: Visitor item interaction is captured
- **WHEN** a visitor on the mobile menu expands a menu item
- **THEN** an item_view event referencing that menu item is recorded

#### Scenario: Admin and preview traffic is excluded
- **WHEN** a page is rendered inside the admin or with the draft-preview parameter
- **THEN** no traffic events are emitted

### Requirement: Run-Time Dated Aggregation

Daily aggregation SHALL compute its target date at execution time, defaulting to the previous UTC day, with an optional explicit date argument for backfills. Aggregation MUST be idempotent for a given date.

#### Scenario: Cron aggregates yesterday
- **WHEN** the daily aggregation job runs on date D
- **THEN** it aggregates events from date D−1, regardless of when the code was deployed

#### Scenario: Re-running a date is safe
- **WHEN** aggregation runs twice for the same date
- **THEN** the stored aggregates for that date are identical to a single run

### Requirement: Honest Display Metrics

The system SHALL report: TV screen uptime per day per route derived from heartbeat coverage; visitor pageviews and unique sessions per route per day with hourly distribution; and menu item view counts per day. The admin dashboard MUST label each metric with what it measures and MUST NOT present item views as orders or popularity of purchases.

#### Scenario: Uptime reflects heartbeat coverage
- **WHEN** a TV emitted heartbeats covering 10 hours of a day
- **THEN** that day's uptime for the screen's route reports approximately 600 minutes

#### Scenario: Top viewed items
- **WHEN** the owner opens the analytics dashboard
- **THEN** menu items are ranked by visitor view events, labeled as visitor views

### Requirement: Raw Event Retention

Raw traffic events SHALL be retained for 30 days and then deleted by a scheduled job; daily aggregates SHALL be retained indefinitely.

#### Scenario: Old events are pruned
- **WHEN** the retention job runs
- **THEN** events older than 30 days are deleted while all aggregates remain

### Requirement: Analysis Export

The system SHALL provide an HTTP export of raw events and aggregates for a requested date range in CSV and NDJSON formats consumable directly by DuckDB, protected by an access token.

#### Scenario: Exporting a date range
- **WHEN** the owner requests the export for a from/to range with a valid token
- **THEN** the response streams the matching events and aggregates in the requested format

#### Scenario: Invalid token is rejected
- **WHEN** an export request carries a missing or wrong token
- **THEN** the request is rejected without data
