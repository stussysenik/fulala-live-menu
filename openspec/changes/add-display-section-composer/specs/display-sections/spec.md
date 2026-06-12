# display-sections — delta

## ADDED Requirements

### Requirement: Data-Driven Page Sections

Display pages SHALL render an ordered list of section instances (`id`, `type`, `props`, `visible`) from versioned configuration, resolved through a typed section registry, with no menu content hardcoded in page components.

#### Scenario: Page renders from published config
- **WHEN** a display page with a published section config loads
- **THEN** sections render in configured order, hidden sections are skipped, and all menu-derived content (extras, category items, prices) comes from the database

#### Scenario: Missing config falls back to default
- **GIVEN** a page slug with no stored section config
- **WHEN** the page loads
- **THEN** a built-in default configuration reproduces the page's previous layout exactly

#### Scenario: Unknown section type never breaks a TV
- **GIVEN** a config containing a section type the deployed code does not know
- **WHEN** the page renders
- **THEN** that section renders nothing, an error is logged, and all other sections render normally

#### Scenario: Malformed config rejected at write time
- **WHEN** a save is attempted with props that fail the section type's validator
- **THEN** the mutation rejects with a descriptive error and the stored config is unchanged

### Requirement: Category Photo Grid Section

The system SHALL provide a `category-photo-grid` section type rendering an image-forward grid of a chosen category's available items — photo, bilingual name, optional price — with configurable columns, photo size, and item limit.

#### Scenario: Photo grid renders a category
- **WHEN** a photo grid section is configured for the dumplings category with 3 columns
- **THEN** available dumpling items render as photo tiles with names and prices in a 3-column grid

#### Scenario: Missing photos degrade gracefully
- **GIVEN** a category item without a photo
- **WHEN** the grid renders
- **THEN** the item shows a branded placeholder tile preserving grid rhythm
- **AND** the admin composer lists which items lack photos

### Requirement: Admin Section Composer

Admins SHALL compose each display page from `/admin/displays`: add, remove, reorder (deterministic up/down), swap type, edit props with live preview, and toggle visibility of sections.

#### Scenario: Compose and publish
- **WHEN** an admin adds a photo grid section, moves it above the extras list, and publishes
- **THEN** the display page reflects the new composition
- **AND** the previous composition is preserved in version history

#### Scenario: Restore a previous composition
- **GIVEN** version history contains an earlier composition
- **WHEN** the admin restores it
- **THEN** it is re-published as a new version (history is append-only, never rewritten)

### Requirement: Composition History

Every published composition change SHALL be recorded so the on-screen state of any display page at any past time is reconstructable.

#### Scenario: Answering "what did the screen show?"
- **WHEN** an admin opens a page's composition history
- **THEN** versions are listed with timestamps and the composition of each version is viewable
