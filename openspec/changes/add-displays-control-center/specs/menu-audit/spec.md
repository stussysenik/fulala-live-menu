# Delta — menu-audit

## ADDED Requirements

### Requirement: Menu Change Audit Feed

The admin SHALL present a chronological feed of menu content changes derived from the menu archive, showing for each change the item, change type (created/updated/deleted), timestamp, and the relevant before/after values (at minimum price and availability).

#### Scenario: Recent change appears in the feed
- **WHEN** a menu item's price is changed in the admin
- **THEN** the History page lists that change with the item name, old and new price, and the time of change

### Requirement: Historical Menu Snapshots

The admin SHALL allow viewing the full menu as it existed on any date for which a daily snapshot exists.

#### Scenario: Viewing a past menu
- **WHEN** the owner selects a date with a stored snapshot
- **THEN** the History page renders the categories, items, and prices exactly as captured in that date's snapshot

### Requirement: Snapshot Diff Between Dates

The system SHALL compute and display the differences between any two daily snapshots, grouped into items added, items removed, price changes, and availability changes.

#### Scenario: Price drift between two dates
- **WHEN** the owner diffs date D1 against date D2 and an item's price changed between them
- **THEN** the diff lists that item under price changes with both values

#### Scenario: Missing snapshot is reported
- **WHEN** the owner selects a date without a stored snapshot
- **THEN** the system states that no snapshot exists for that date instead of showing an empty menu
