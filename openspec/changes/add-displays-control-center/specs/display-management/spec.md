# Delta — display-management

## ADDED Requirements

### Requirement: Draft and Publish Lifecycle

The system SHALL maintain separate draft and published per-page display settings. Admin edits SHALL write only to the draft; live display pages SHALL render only published settings until the owner explicitly publishes a page's draft.

#### Scenario: Draft edit does not affect live displays
- **WHEN** the owner changes a setting for `tv-dumplings` in the Displays hub
- **THEN** the draft document is updated and the live `/tv-dumplings` page continues rendering its published settings unchanged

#### Scenario: Publishing applies the draft
- **WHEN** the owner clicks Publish for `tv-dumplings`
- **THEN** the draft settings for that slug become the published settings and all subscribed displays update in real time

#### Scenario: Unpublished changes are visible in the hub
- **WHEN** a page's draft differs from its published settings
- **THEN** the Displays hub shows an "unpublished changes" indicator for that page

### Requirement: Draft Preview on Real Routes

Display routes SHALL render draft settings instead of published settings when a `preview=draft` query parameter is present, so the owner can preview pending changes on the real page.

#### Scenario: Preview shows the draft
- **WHEN** `/tv-dumplings?preview=draft` is opened and a draft exists
- **THEN** the page renders using draft settings while the parameter-free route keeps rendering published settings

### Requirement: Display Version History

Every publish SHALL append an immutable version record (slug, settings snapshot, monotonic version number, timestamp, optional note). The system SHALL allow restoring any prior version by re-publishing it as a new version; version records MUST never be mutated or deleted by application code.

#### Scenario: Publish creates a version
- **WHEN** the owner publishes settings for a page
- **THEN** a new version record with the next version number is stored for that page

#### Scenario: Rollback re-publishes an old version
- **WHEN** the owner restores version N of a page that is currently at version M (M > N)
- **THEN** the settings of version N become published as a new version M+1 and the history still contains versions 1..M

### Requirement: Per-Page Live and Standby State

Each managed display page SHALL have an `isLive` flag (default true). When false, the display route SHALL render a branded standby screen instead of menu content, and SHALL resume rendering menu content immediately when set back to true.

#### Scenario: Taking a page to standby
- **WHEN** the owner sets `tv-noodles` to standby and publishes
- **THEN** the live `/tv-noodles` page replaces menu content with the standby screen without a reload or deploy

#### Scenario: Default is live
- **WHEN** a page has no saved `isLive` value
- **THEN** the page renders menu content as if `isLive` were true

### Requirement: Bounded Appearance Parameters

Per-page settings SHALL include `fontScale` (clamped to 0.85–1.3, default 1.0) and `density` (`compact` | `comfortable` | `spacious`, default `comfortable`), applied through CSS custom properties. The system MUST NOT offer freeform element positioning; all appearance controls MUST be reflow-safe.

#### Scenario: Font scale applies within bounds
- **WHEN** the owner sets fontScale 1.2 on a page and publishes
- **THEN** the page's typography scales by 1.2 while layout reflows without clipping or overlap

#### Scenario: Out-of-range values are clamped
- **WHEN** a stored fontScale value is outside 0.85–1.3
- **THEN** the rendering page clamps it to the nearest bound

### Requirement: Admin Navigation Visibility

The admin SHALL provide settings to toggle the visibility of individual admin navigation entries. Hidden entries SHALL be removed from the sidebar but remain accessible by direct URL. The Dashboard entry and the visibility settings themselves MUST NOT be hideable.

#### Scenario: Hiding an unused section
- **WHEN** the owner hides the "Events" nav entry
- **THEN** the sidebar no longer lists Events, while `/admin/events` still loads when visited directly

#### Scenario: Defaults show everything
- **WHEN** no nav visibility settings are saved
- **THEN** all nav entries are visible in their groups

### Requirement: Collapsible Admin Organization

Admin navigation groups and dashboard sections SHALL be collapsible to their parent title (Notion-style toggles) to reduce vertical clutter. Collapse state SHALL persist per device across sessions, and all content MUST remain reachable when expanded.

#### Scenario: Collapsing a nav group
- **WHEN** the owner collapses the "Configure" group in the sidebar
- **THEN** only the group title remains visible, and expanding it restores its entries

#### Scenario: Collapse state persists
- **WHEN** the owner collapses a group and reloads the admin
- **THEN** the group remains collapsed on that device

### Requirement: Single-Responsibility Admin Sections

Each admin section SHALL have exactly one responsibility: Displays manages page publishing and appearance; History presents the audit trail; Menu manages menu content; configuration and tools sections remain distinct. A section MUST NOT duplicate another section's controls.

#### Scenario: Publishing lives only in Displays
- **WHEN** the owner needs to publish or roll back page settings
- **THEN** those controls exist in the Displays hub and nowhere else in the admin
