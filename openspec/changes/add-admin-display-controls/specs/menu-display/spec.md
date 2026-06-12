## ADDED Requirements

### Requirement: Per-Page Display Settings

The system SHALL store per-page display settings in `siteSettings` under the key `page-settings` as a map of route slug (`tv-dumplings`, `tv-noodles`, `tv-info`, `home`) to `{ showImages?, showChinese?, showAllergens? }`. A `settings.getPageSettings` query SHALL return the full map and a `settings.updatePageSetting` mutation SHALL merge-patch a single slug's settings, preserving all unspecified fields and all other slugs.

#### Scenario: Patch one flag for one page

- **WHEN** `updatePageSetting({ slug: "tv-dumplings", patch: { showImages: false } })` is called and `tv-dumplings` already has `{ showChinese: false }`
- **THEN** the stored value for `tv-dumplings` becomes `{ showChinese: false, showImages: false }` and every other slug's settings are unchanged

#### Scenario: First write creates the settings document

- **WHEN** `updatePageSetting` is called and no `page-settings` row exists
- **THEN** the row is created containing only the patched slug

### Requirement: TV Pages Respect Per-Page Settings

Each TV display page SHALL subscribe to `settings.getPageSettings` and apply its own slug's settings to rendering: `showImages` gates item photos, `showChinese` gates Chinese-character names, `showAllergens` gates allergen badges. Every flag SHALL default to `true` when absent, so unconfigured pages render exactly as before this change.

#### Scenario: Hide images on one TV page only

- **WHEN** `tv-dumplings` has `showImages: false` and `tv-noodles` has no saved settings
- **THEN** `/tv-dumplings` renders items without photos while `/tv-noodles` continues to show photos

#### Scenario: Live update without reload

- **WHEN** an admin toggles `showImages` while a TV page is open
- **THEN** the TV page updates within the Convex subscription latency without a page reload

#### Scenario: No settings, no regression

- **WHEN** no `page-settings` document exists
- **THEN** all TV pages render identically to the behavior before this change
