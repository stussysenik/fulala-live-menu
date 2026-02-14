## ADDED Requirements

### Requirement: Admin Price Tier Editing
The admin panel SHALL provide inline editing of price tiers for each menu item. Each tier SHALL have a quantity label (string) and a price (number in CZK). Tiers SHALL be addable and removable dynamically. The editor SHALL offer quick-add preset buttons for common quantities (1ks, 2ks, 3ks, 6ks, 9ks, 12ks, 18ks, 24ks) plus a custom tier option. Changes to tiers SHALL persist to Convex immediately via the existing updateMenuItem mutation and reflect on TV displays in real-time.

#### Scenario: Admin adds a price tier via preset button
- **WHEN** the admin clicks a preset button (e.g., "6ks") in the PriceTierEditor
- **THEN** a new tier row appears pre-filled with "6ks" as the quantity label
- **AND** the price field is set to 0 for manual entry
- **AND** the preset button for "6ks" is no longer shown (already added)

#### Scenario: Admin adds a custom price tier
- **WHEN** the admin clicks "+ Custom Tier" in the PriceTierEditor
- **THEN** a new tier row appears with empty quantity and price fields
- **AND** the admin can type any quantity label (e.g., "5ks", "family pack")

#### Scenario: Admin removes a price tier
- **WHEN** the admin clicks the remove button on a tier row
- **THEN** that tier is removed from the list
- **AND** the corresponding preset button reappears if it matches a standard quantity

#### Scenario: Price tiers display on admin list
- **WHEN** a menu item has priceTiers populated
- **THEN** the admin menu list shows all tiers inline (e.g., "6ks: 179 Kc | 12ks: 349 Kc")
- **AND** items without priceTiers show the single price and quantity as before

### Requirement: Quick Image Swap
The admin panel SHALL allow quick image changes from the menu item list view without entering the full edit form. Clicking an item's thumbnail SHALL open an image picker popover that immediately updates the image via Convex mutation.

#### Scenario: Admin clicks thumbnail to swap image
- **GIVEN** a menu item has an image displayed in the admin list
- **WHEN** the admin clicks the item's thumbnail image
- **THEN** an image picker popover appears below the thumbnail
- **AND** selecting a new image immediately calls the updateMenuItem mutation
- **AND** the TV displays update within 1-2 seconds via Convex real-time subscriptions

#### Scenario: Admin adds image to item without one
- **GIVEN** a menu item has no imageUrl set
- **WHEN** the admin clicks the placeholder icon in the item row
- **THEN** the image picker popover appears
- **AND** selecting an image saves it directly to the item

### Requirement: Consolidated TV Live Preview
The admin panel SHALL provide a consolidated preview page at /admin/preview showing all TV display routes simultaneously in scaled iframe panels.

#### Scenario: Admin views all TV displays together
- **GIVEN** the admin navigates to /admin/preview
- **WHEN** the page loads
- **THEN** three iframe panels display the dumplings, noodles, and info TV pages
- **AND** the iframes auto-update when menu data changes in Convex

#### Scenario: Admin toggles between regular and Valentine theme
- **GIVEN** the admin is on /admin/preview
- **WHEN** the admin toggles the theme selector
- **THEN** the iframe sources switch between regular portrait routes and Valentine routes
