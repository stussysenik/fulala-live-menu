# Spec: Event Management Capabilities

## ADDED Requirements

### Requirement: Event Packages

The system SHALL support event packages with guest count ranges, per-person pricing, deposits, and included menu items.

#### Scenario: Create event package
- **GIVEN** admin is on `/admin/events` page, Event Packages tab
- **WHEN** admin enters name "Wedding Banquet", min guests 50, max guests 200, price per person $45, deposit $500
- **AND** selects included menu items (e.g., 10 dishes)
- **AND** clicks "Create Package"
- **THEN** event package is created in database
- **AND** package appears in active packages list

#### Scenario: Display event package with guest range
- **GIVEN** event package has minGuests: 50, maxGuests: 200
- **WHEN** package is displayed on event listing page
- **THEN** guest range shows "50-200 guests"
- **AND** pricing shows "$45 per person"

#### Scenario: Calculate package total for guest count
- **GIVEN** event package costs $45 per person
- **WHEN** customer selects 100 guests
- **THEN** total displays $4,500 (45 * 100)
- **AND** deposit of $500 is shown separately

#### Scenario: Event package includes menu items
- **GIVEN** event package has includedItems: [item1, item2, item3]
- **WHEN** package details are displayed
- **THEN** all included menu items are listed with names and descriptions
- **AND** items are linked to menu (click to view full item details)

#### Scenario: Deactivate event package
- **GIVEN** event package is active
- **WHEN** admin toggles isActive to false
- **THEN** package no longer appears in customer-facing listings
- **AND** package remains in database for historical records

---

### Requirement: Catering Menus

The system SHALL support catering menus with minimum order amounts, delivery radius, and selectable items.

#### Scenario: Create catering menu
- **GIVEN** admin is on `/admin/events` page, Catering tab
- **WHEN** admin enters name "Office Lunch Catering", min order $200, delivery radius 10km
- **AND** selects available items (e.g., 15 menu items)
- **AND** clicks "Create Catering Menu"
- **THEN** catering menu is created in database
- **AND** menu appears in active catering listings

#### Scenario: Display minimum order amount
- **GIVEN** catering menu has minOrderAmount: 20000 (cents, $200)
- **WHEN** menu is displayed
- **THEN** minimum order shows "$200 minimum"
- **AND** customer cannot proceed with order below this amount

#### Scenario: Display delivery radius
- **GIVEN** catering menu has deliveryRadius: 10 (km)
- **WHEN** menu is displayed
- **THEN** delivery info shows "Delivery within 10km"
- **AND** customer can verify eligibility

#### Scenario: Catering menu without delivery radius
- **GIVEN** catering menu has deliveryRadius: undefined
- **WHEN** menu is displayed
- **THEN** delivery info shows "Pickup only" or "Contact for delivery"

#### Scenario: Select items from catering menu
- **GIVEN** catering menu has items: [item1, item2, item3]
- **WHEN** customer views catering menu
- **THEN** all available items are listed
- **AND** customer can select quantities per item
- **AND** total updates based on selections

---

### Requirement: School Meals

The system SHALL support weekly school meal schedules with day-of-week planning and per-meal pricing.

#### Scenario: Create school meal schedule
- **GIVEN** admin is on `/admin/events` page, School Meals tab
- **WHEN** admin selects year 2026, week 5, day "monday"
- **AND** selects meal items (e.g., main dish, side, drink)
- **AND** sets price per meal $8.50
- **AND** clicks "Create School Meal"
- **THEN** school meal is created in database
- **AND** meal appears in weekly schedule grid

#### Scenario: View weekly school meal schedule
- **GIVEN** school meals exist for week 5 of 2026
- **WHEN** admin or parent views school meal calendar
- **THEN** meals display in grid format (Mon-Fri columns)
- **AND** each day shows menu items and pricing

#### Scenario: School meal pricing
- **GIVEN** school meal has pricePerMeal: 850 (cents, $8.50)
- **WHEN** meal is displayed
- **THEN** price shows "$8.50 per meal"
- **AND** weekly total shows "$42.50" (5 days * $8.50)

#### Scenario: School meal for specific day
- **GIVEN** school meal for Monday of week 5
- **WHEN** meal is displayed
- **THEN** day shows "Monday" label
- **AND** meal items are listed
- **AND** dietary tags are visible for allergen awareness

#### Scenario: Update school meal schedule
- **GIVEN** school meal exists for Tuesday, week 5
- **WHEN** admin changes items or price
- **AND** saves changes
- **THEN** school meal is updated in database
- **AND** changes appear immediately in schedule view

#### Scenario: Deactivate past school meals
- **GIVEN** school meals for week 1 of 2026 (past week)
- **WHEN** admin toggles isActive to false
- **THEN** meals no longer appear in current schedule
- **AND** meals remain in database for records

---

### Requirement: Event Management Admin UI

The system SHALL provide a unified admin interface for managing all event types (packages, catering, school meals) with tab navigation.

#### Scenario: Navigate between event types
- **GIVEN** admin is on `/admin/events` page
- **WHEN** admin clicks "Event Packages" tab
- **THEN** event packages list and form are displayed
- **WHEN** admin clicks "Catering" tab
- **THEN** catering menus list and form are displayed
- **WHEN** admin clicks "School Meals" tab
- **THEN** school meals calendar and form are displayed

#### Scenario: Create event of each type
- **GIVEN** admin is on `/admin/events` page
- **WHEN** admin completes form for any event type
- **AND** clicks create button
- **THEN** event is created in respective table (eventPackages, cateringMenus, or schoolMeals)
- **AND** form resets for next entry

#### Scenario: Edit existing event
- **GIVEN** admin views list of existing events
- **WHEN** admin clicks "Edit" on an event
- **THEN** form populates with current values
- **AND** admin can modify fields
- **AND** save updates the database

#### Scenario: Delete event
- **GIVEN** admin views list of existing events
- **WHEN** admin clicks "Delete" on an event
- **AND** confirms deletion
- **THEN** event is removed from database
- **AND** event no longer appears in listings

---

### Requirement: Event Package Pricing Calculation

The system SHALL calculate total event costs based on guest count and per-person pricing.

#### Scenario: Calculate package total for minimum guests
- **GIVEN** package has minGuests: 50, pricePerPerson: 4500 (cents, $45)
- **WHEN** customer selects 50 guests
- **THEN** total displays $2,250 (50 * $45)
- **AND** deposit of $500 is shown

#### Scenario: Calculate package total for maximum guests
- **GIVEN** package has maxGuests: 200, pricePerPerson: 4500
- **WHEN** customer selects 200 guests
- **THEN** total displays $9,000 (200 * $45)

#### Scenario: Prevent booking below minimum guests
- **GIVEN** package has minGuests: 50
- **WHEN** customer attempts to book for 30 guests
- **THEN** system shows error "Minimum 50 guests required"
- **AND** booking is not allowed

#### Scenario: Prevent booking above maximum guests
- **GIVEN** package has maxGuests: 200
- **WHEN** customer attempts to book for 250 guests
- **THEN** system shows error "Maximum 200 guests allowed"
- **AND** customer is prompted to contact restaurant for custom quote

---

### Requirement: Catering Order Validation

The system SHALL enforce minimum order amounts for catering menus.

#### Scenario: Validate catering order meets minimum
- **GIVEN** catering menu has minOrderAmount: 20000 ($200)
- **WHEN** customer selects items totaling $250
- **THEN** order is valid
- **AND** "Proceed to Checkout" button is enabled

#### Scenario: Block catering order below minimum
- **GIVEN** catering menu has minOrderAmount: 20000 ($200)
- **WHEN** customer selects items totaling $150
- **THEN** order is invalid
- **AND** message shows "Minimum order $200 (current: $150)"
- **AND** checkout button is disabled

#### Scenario: Display remaining amount to reach minimum
- **GIVEN** catering menu has minOrderAmount: 20000 ($200)
- **WHEN** customer has $180 in cart
- **THEN** message shows "Add $20 more to reach minimum order"

---

### Requirement: School Meal Weekly Organization

The system SHALL organize school meals by year and week number with day-of-week granularity.

#### Scenario: Query meals by week
- **GIVEN** database contains school meals for multiple weeks
- **WHEN** admin queries for year 2026, week 5
- **THEN** only meals for that specific week are returned
- **AND** meals are ordered by day of week (Monday → Friday)

#### Scenario: Display meals in calendar grid
- **GIVEN** school meals exist for week 5 (Mon-Fri)
- **WHEN** calendar view is rendered
- **THEN** grid shows 5 columns (one per weekday)
- **AND** each cell shows meal items and price

#### Scenario: Handle missing meal days
- **GIVEN** school meals exist for Mon, Wed, Fri of week 5
- **WHEN** calendar is displayed
- **THEN** Tue and Thu show as empty cells
- **AND** empty cells allow admin to click "Add Meal"

#### Scenario: Week number calculation
- **GIVEN** admin selects date January 27, 2026
- **WHEN** creating school meal
- **THEN** week number is calculated as week 5 of 2026
- **AND** year and weekNumber fields are auto-populated

---

### Requirement: Event Item References

The system SHALL maintain referential integrity between events and menu items, ensuring included items exist and are valid.

#### Scenario: Include menu items in event package
- **GIVEN** admin is creating event package
- **WHEN** admin selects menu items from dropdown
- **THEN** only active, available menu items appear in dropdown
- **AND** selected items are stored as array of menuItem IDs

#### Scenario: Display included items with details
- **GIVEN** event package has includedItems: [id1, id2, id3]
- **WHEN** package details are displayed
- **THEN** system fetches full menu item details (name, description, price, dietary tags)
- **AND** items display with all relevant info

#### Scenario: Handle deleted menu item in event
- **GIVEN** event package includes menu item that is later deleted
- **WHEN** package is displayed
- **THEN** deleted item shows placeholder (e.g., "[Item no longer available]")
- **AND** other items display normally

#### Scenario: Update event when menu item changes
- **GIVEN** event package includes menu item "Spring Rolls"
- **WHEN** "Spring Rolls" name is changed to "Vegetable Rolls"
- **THEN** event package automatically reflects new name
- **AND** event ID reference remains unchanged

---

## Cross-References

**Related Specs:**
- `menu-display` - Event packages reference menu items with dietary tags and modifiers
- `customer-ordering` - Future integration for booking event packages and catering orders
- `currency` - Event pricing must respect active currency settings

**Dependencies:**
- Requires `eventPackages`, `cateringMenus`, `schoolMeals` tables
- Requires `menuItems` table for item references
- Requires Convex queries for fetching related menu items
- Requires admin UI at `/admin/events` route
- Requires date/week number calculations for school meals
