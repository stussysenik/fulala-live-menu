# Display Layouts Capability

## ADDED Requirements

### Requirement: Per-Page Layout Configuration

The system SHALL support independent layout configurations for different page types. Each page type (display, order) MUST be able to have its own active layout.

#### Scenario: Display page uses display layout
- **WHEN** the home page or TV page renders
- **THEN** the system SHALL use the active layout for pageType="display"

#### Scenario: Order page uses order layout
- **WHEN** the order page renders
- **THEN** the system SHALL use the active layout for pageType="order"

#### Scenario: Admin can switch between page type layouts
- **WHEN** the admin visits /admin/layout
- **THEN** tabs for "Display Pages" and "Order Page" SHALL be available
- **AND** selecting a tab SHALL filter layouts to that page type

---

### Requirement: Traditional Chinese Layout

The system SHALL provide a traditional Chinese dim sum order sheet style layout with ornamental styling and classic typography.

#### Scenario: Traditional layout renders with sections
- **WHEN** the traditional-chinese layout is active
- **THEN** the menu SHALL display with:
  - Ornamental header with Chinese decorative elements
  - Category sections with styled borders
  - Grid layout with item code, name, and price columns
  - Optional quantity input fields

#### Scenario: Color scheme selection
- **WHEN** the admin configures a traditional-chinese layout
- **THEN** color scheme options SHALL include:
  - classic-red (default): Red and cream traditional colors
  - jade-green: Elegant green tones
  - gold: Luxurious gold accents

---

### Requirement: Build-Time Environment Validation

The system SHALL validate required environment variables before build succeeds to prevent broken deployments.

#### Scenario: Build fails without VITE_CONVEX_URL
- **WHEN** npm run build is executed
- **AND** VITE_CONVEX_URL is not set
- **THEN** the build SHALL fail with an error message indicating the missing variable

#### Scenario: Build succeeds with required variables
- **WHEN** npm run build is executed
- **AND** VITE_CONVEX_URL is set (via .env.local or environment)
- **THEN** the validation SHALL pass and build SHALL proceed

---

## MODIFIED Requirements

### Requirement: Layout Schema

The displayLayouts schema SHALL include a pageType field to distinguish between layout configurations for different pages.

#### Scenario: Layout document structure
- **WHEN** a layout document is created
- **THEN** it SHALL include:
  - layoutType: One of "standard-list", "dim-sum-grid", "card-grid", "traditional-chinese"
  - pageType: One of "display", "order"
  - isActive: Boolean indicating if this is the active layout for its pageType
  - config: Object containing layout-specific options

---

### Requirement: Layout Queries

The getActiveLayout query SHALL accept a pageType parameter to return the appropriate layout.

#### Scenario: Query active display layout
- **WHEN** getActiveLayout is called with pageType="display"
- **THEN** the active layout for display pages SHALL be returned

#### Scenario: Query active order layout
- **WHEN** getActiveLayout is called with pageType="order"
- **THEN** the active layout for order pages SHALL be returned

#### Scenario: Fallback for missing layout
- **WHEN** no active layout exists for a pageType
- **THEN** the query SHALL return null
- **AND** the frontend SHALL use default layout values
