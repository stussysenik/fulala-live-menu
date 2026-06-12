## ADDED Requirements

### Requirement: Admin Displays Hub

The admin SHALL provide a `/admin/displays` page listing every managed display page (`tv-dumplings`, `tv-noodles`, `tv-info`, `home`) as a card with: toggle switches for Show images / Show Chinese names / Show allergens wired to `settings.updatePageSetting`, a link to open the live page in a new tab, and a link to edit the page's menu items in `/admin/menu`.

#### Scenario: Toggle applies instantly

- **WHEN** the admin switches "Show images" off on the `tv-dumplings` card
- **THEN** `updatePageSetting` is called with `{ slug: "tv-dumplings", patch: { showImages: false } }` and the switch reflects the saved state from the live `getPageSettings` subscription

#### Scenario: Unconfigured page shows defaults

- **WHEN** a managed page has no saved settings
- **THEN** its card shows all toggles in the on position

### Requirement: Grouped Admin Navigation

The admin sidebar SHALL group navigation into three labeled sections — Manage (Dashboard, Menu Items, Displays), Configure (Layout, Theme, Schedule, Events), and Tools (Live Preview, Print Menu, Analytics) — with the current page highlighted.

#### Scenario: All destinations reachable

- **WHEN** the admin views any admin page
- **THEN** the sidebar shows all ten destinations under their group labels, including the previously missing Layout entry and the new Displays entry

### Requirement: Environment Safety Banner

The admin layout SHALL always display which Convex deployment the client writes to, derived from the configured Convex URL: an amber `SANDBOX` badge for the dev deployment and a red `PRODUCTION` badge otherwise. The badge MUST be visible on every admin page without user action.

#### Scenario: Sandbox indication

- **WHEN** the app is configured with the dev deployment URL (`focused-giraffe-228`)
- **THEN** every admin page shows the amber `SANDBOX` badge

#### Scenario: Production warning

- **WHEN** the app is configured with any other Convex URL
- **THEN** every admin page shows the red `PRODUCTION` badge
