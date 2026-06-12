# display-layouts — delta

## ADDED Requirements

### Requirement: Per-Page Layout Template Assignment

The system SHALL allow each display page (tv-dumplings, tv-noodles, tv-info, home, order) to be assigned one of the available layout templates via a visual template gallery, resolved at render time.

#### Scenario: Assign a template from the gallery
- **WHEN** an admin opens the template gallery in `/admin/displays` for a page and selects a template card (e.g., Card Grid)
- **THEN** the assignment is saved for that page slug
- **AND** the page renders with that template on next data push

#### Scenario: Resolution falls back sensibly
- **GIVEN** a page has no slug-specific assignment
- **WHEN** the page resolves its layout
- **THEN** it uses the pageType default layout, and standard-list if none exists

#### Scenario: Gallery shows current state
- **WHEN** the gallery renders
- **THEN** each page shows its currently assigned template highlighted, with a mini visual preview per available template
