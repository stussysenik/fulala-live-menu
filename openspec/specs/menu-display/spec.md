# menu-display Specification

## Purpose
TBD - created by archiving change add-menu-item-images. Update Purpose after archive.
## Requirements
### Requirement: Menu Item Images

The system SHALL display menu item images when an imageUrl is present, with responsive sizing and graceful degradation for missing or broken images.

*(This requirement was added in `add-menu-item-images` change and is being extended with new layout capabilities)*

#### Scenario: Display image when available
- **GIVEN** a menu item has an imageUrl field populated
- **WHEN** the item is rendered in any layout
- **THEN** the image displays at the appropriate size for the layout type
- **AND** the image uses lazy loading to optimize performance

#### Scenario: Handle missing image gracefully
- **GIVEN** a menu item has no imageUrl field
- **WHEN** the item is rendered in a layout with showImages enabled
- **THEN** no broken image placeholder appears
- **AND** the layout gracefully adjusts spacing

#### Scenario: Handle broken image URL
- **GIVEN** a menu item has an imageUrl that returns 404
- **WHEN** the image fails to load
- **THEN** a fallback placeholder or hidden image area is shown
- **AND** the item name and description remain visible

### Requirement: Image Performance

The system SHALL optimize image loading to prevent performance degradation on both mobile and TV displays.

*(This requirement was added in `add-menu-item-images` change and is being extended with new layout capabilities)*

#### Scenario: Lazy loading on mobile
- **GIVEN** user scrolls through menu on mobile device
- **WHEN** images come into viewport
- **THEN** images load on-demand (not all at once)
- **AND** scroll performance remains smooth

#### Scenario: Image sizing for TV display
- **GIVEN** menu is displayed on TV in full-screen mode
- **WHEN** layout includes images (card-grid or standard-list with images enabled)
- **THEN** images scale to appropriate resolution without pixelation
- **AND** layout maintains visual hierarchy

---

### Requirement: Display Layout Switching

The system SHALL support multiple display layout types (standard-list, dim-sum-grid, card-grid) with real-time switching between layouts without page reload.

#### Scenario: Admin activates new layout
- **GIVEN** admin is on `/admin/layout` page
- **WHEN** admin selects a layout and clicks "Set Active"
- **THEN** the layout becomes active in the database
- **AND** all connected customer displays update instantly via Convex reactivity
- **AND** the previously active layout is deactivated

#### Scenario: Customer views active layout
- **GIVEN** a display layout is marked active in the database
- **WHEN** customer navigates to the menu page (`/` or `/tv`)
- **THEN** the menu renders using the active layout configuration
- **AND** the layout matches the admin's selection

#### Scenario: Real-time layout change
- **GIVEN** customer is viewing the menu on their device
- **WHEN** admin changes the active layout
- **THEN** customer's view updates to the new layout within 1 second
- **AND** customer's scroll position and view state are preserved where possible

#### Scenario: Fallback to default layout
- **GIVEN** no layout is marked active in the database
- **WHEN** customer views the menu
- **THEN** the system falls back to standard-list layout
- **AND** a default configuration is used (all features enabled)

---

### Requirement: Standard List Layout

The system SHALL provide a standard vertical list layout suitable for general restaurant menus.

#### Scenario: Standard list with images
- **GIVEN** standard-list layout is active with showImages: true
- **WHEN** menu is rendered
- **THEN** items display in vertical list with thumbnail images on the left
- **AND** item name, description, and price are right-aligned
- **AND** dietary tags appear below the description

#### Scenario: Standard list without images
- **GIVEN** standard-list layout is active with showImages: false
- **WHEN** menu is rendered
- **THEN** items display in vertical list without images
- **AND** layout uses full width for text content

#### Scenario: Category headers in standard list
- **GIVEN** standard-list layout with categoryStyle: "header"
- **WHEN** menu is rendered
- **THEN** categories display as bold section headers
- **AND** items are grouped under their category headers

---

### Requirement: Dim Sum Grid Layout

The system SHALL provide a 2-column grid layout with checkboxes and item codes, styled for dim sum restaurants.

#### Scenario: 2-column dim sum grid
- **GIVEN** dim-sum-grid layout is active with columnsPerRow: 2
- **WHEN** menu is rendered
- **THEN** items display in a 2-column grid
- **AND** each item shows a checkbox on the left (visual only, non-functional in display mode)
- **AND** item codes (e.g., "S1", "F2") display prominently

#### Scenario: Dim sum item codes
- **GIVEN** menu items have itemCode field populated
- **WHEN** rendered in dim-sum-grid layout with showItemNumbers: true
- **THEN** item codes display before item names
- **AND** codes are styled distinctly (e.g., bold, colored background)

#### Scenario: Dim sum without checkboxes
- **GIVEN** dim-sum-grid layout with showCheckboxes: false
- **WHEN** menu is rendered
- **THEN** checkboxes are hidden
- **AND** layout adjusts spacing accordingly

---

### Requirement: Card Grid Layout

The system SHALL provide a responsive card-based grid layout with large images suitable for visual menus.

#### Scenario: Responsive card grid
- **GIVEN** card-grid layout is active
- **WHEN** menu is rendered on different screen sizes
- **THEN** cards arrange in responsive grid (1-4 columns based on viewport)
- **AND** each card displays a large image, name, description, and price

#### Scenario: Card grid with images
- **GIVEN** card-grid layout is active
- **WHEN** items have imageUrl populated
- **THEN** images display at the top of each card
- **AND** images maintain consistent aspect ratio across cards

#### Scenario: Card grid without images
- **GIVEN** card-grid layout is active
- **WHEN** items have no imageUrl
- **THEN** cards display with colored header instead of image
- **AND** layout remains visually consistent

---

### Requirement: Item Modifiers

The system SHALL support 7 types of item modifiers (temperature, noodleType, fryingDegree, brothType, spiceLevel, drinkOptions, add-ons) with admin configuration and customer-facing display.

#### Scenario: Display available modifiers on menu
- **GIVEN** a menu item has modifiers configured
- **WHEN** item is rendered in any layout
- **THEN** modifier availability badges are displayed (e.g., "🌡️ Hot/Cold", "🍜 7 Noodle Types")
- **AND** badges are styled distinctly from dietary tags

#### Scenario: Hide modifiers when none configured
- **GIVEN** a menu item has no modifiers configured
- **WHEN** item is rendered
- **THEN** no modifier badges appear
- **AND** layout does not reserve space for empty modifiers

#### Scenario: Temperature modifier display
- **GIVEN** item has temperature modifier with values ["hot", "cold"]
- **WHEN** rendered on menu
- **THEN** badge shows "🌡️ Hot/Cold/Room Temp" (whichever are available)

#### Scenario: Noodle type modifier display
- **GIVEN** item has noodleType modifier with multiple values
- **WHEN** rendered on menu
- **THEN** badge shows "🍜 [N] Noodle Types" where N is the count
- **AND** clicking/hovering shows full list (thin, flat, thick, hand-pulled, rice, glass, egg)

#### Scenario: Spice level modifier display
- **GIVEN** item has spiceLevel modifier
- **WHEN** rendered on menu
- **THEN** badge shows "🌶️ Mild/Medium/Hot/Extra-Hot" (whichever are available)

#### Scenario: Drink options display
- **GIVEN** item has drinkOptions configured (temperatures, sugar levels, add-ons)
- **WHEN** rendered on menu
- **THEN** badge shows "☕ Customizable" or similar indicator
- **AND** available options are listed (e.g., "Hot/Iced, Sugar 0-100%, +Boba +Honey")

---

### Requirement: Dietary Tags Display

The system SHALL display dietary tags with emoji icons for quick visual identification of dietary restrictions and allergens.

#### Scenario: Display multiple dietary tags
- **GIVEN** item has dietaryTags: ["vegan", "gluten-free"]
- **WHEN** item is rendered
- **THEN** both tags display with emoji icons (🌱 Vegan, GF Gluten-Free)
- **AND** tags are visually distinct from modifiers

#### Scenario: Protein type tags
- **GIVEN** item has dietaryTags: ["contains-pork", "contains-seafood"]
- **WHEN** item is rendered
- **THEN** tags display with emoji icons (🐷 Contains Pork, 🦐 Contains Seafood)

#### Scenario: Religious dietary tags
- **GIVEN** item has dietaryTags: ["halal", "kosher"]
- **WHEN** item is rendered
- **THEN** tags display with emoji icons (☪️ Halal, ✡️ Kosher)

#### Scenario: Allergen tags
- **GIVEN** item has dietaryTags: ["contains-nuts"]
- **WHEN** item is rendered
- **THEN** tag displays prominently with warning styling (🥜 Contains Nuts)

#### Scenario: Hide dietary tags when none configured
- **GIVEN** item has no dietaryTags
- **WHEN** item is rendered
- **THEN** no dietary tag section appears
- **AND** layout does not reserve space for empty tags

---

### Requirement: Item Code Display

The system SHALL support item codes (e.g., dim sum numbering like "S1", "F2") with optional display in layouts.

#### Scenario: Item code in dim sum layout
- **GIVEN** item has itemCode "S1"
- **WHEN** rendered in dim-sum-grid layout with showItemNumbers: true
- **THEN** code displays before item name
- **AND** code is styled with distinct background color

#### Scenario: Item code in other layouts
- **GIVEN** item has itemCode "F3"
- **WHEN** rendered in standard-list or card-grid layout
- **THEN** code displays only if layout config has showItemNumbers: true
- **AND** code styling is consistent with dim-sum-grid

#### Scenario: Hide item codes when not configured
- **GIVEN** item has no itemCode field
- **WHEN** rendered in any layout
- **THEN** no code appears
- **AND** layout adjusts spacing for missing code

---

### Requirement: Allergen Badge Tooltip
The system SHALL display a visible CSS tooltip on allergen badge hover showing the allergen name in the user's current language.

#### Scenario: Hover shows localized allergen name
- **GIVEN** a menu item has allergen code "1a"
- **AND** the current language is Czech
- **WHEN** user hovers over the "1a" badge
- **THEN** a tooltip appears showing "Pšenice"

#### Scenario: English tooltip
- **GIVEN** a menu item has allergen code "6"
- **AND** the current language is English
- **WHEN** user hovers over the "6" badge
- **THEN** a tooltip appears showing "Soybeans"

#### Scenario: Accessibility fallback
- **GIVEN** a menu item has allergen code "3"
- **WHEN** the badge is rendered
- **THEN** the HTML `title` attribute contains the English allergen name
- **AND** `aria-label` is set for screen readers

---

### Requirement: Inline Allergen Name Summary
The system SHALL display a comma-separated text summary of allergen names below the allergen badges on each menu item, providing instant recognition without cross-referencing the legend.

#### Scenario: Display allergen names in Czech
- **GIVEN** a menu item has allergen codes ["1a", "3", "6"]
- **AND** the current language is Czech
- **WHEN** the item is rendered
- **THEN** text "Pšenice, Vejce, Sója" appears below the allergen badges

#### Scenario: Display allergen names in English
- **GIVEN** a menu item has allergen codes ["1a", "3", "6"]
- **AND** the current language is English
- **WHEN** the item is rendered
- **THEN** text "Wheat, Eggs, Soybeans" appears below the allergen badges

#### Scenario: No allergens
- **GIVEN** a menu item has no allergen codes
- **WHEN** the item is rendered
- **THEN** no allergen summary text appears

---

### Requirement: Sub-Allergen Legend Display
The system SHALL display sub-allergens (e.g., 1a Wheat, 1b Rye) in the allergen legend table, nested under their parent allergen, so that all codes used on menu items are findable in the legend.

#### Scenario: Gluten sub-types shown
- **GIVEN** allergen 1 (Cereals containing gluten) has sub-types 1a–1d
- **WHEN** the allergen legend is rendered
- **THEN** sub-types appear indented below allergen 1
- **AND** each shows code, primary name, and secondary language name

#### Scenario: Allergens without sub-types
- **GIVEN** allergen 3 (Eggs) has no sub-types
- **WHEN** the allergen legend is rendered
- **THEN** only the main allergen row appears with no nested rows

