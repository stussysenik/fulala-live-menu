# Spec: Multi-Currency Display

## Overview

This specification defines the multi-currency display capability for the Fulala menu system, allowing prices to be shown in multiple currencies with configurable exchange rates.

---

## ADDED Requirements

### Requirement: Currency Configuration

The system SHALL support configurable currency settings as part of the theme, including base currency selection, display currency toggles, and exchange rate management.

#### Scenario: Admin configures base currency
- **Given** an admin is on the theme settings page
- **When** they select "EUR" as the base currency
- **Then** all prices are interpreted as EUR cents
- **And** conversion rates are calculated relative to EUR

#### Scenario: Admin enables multiple display currencies
- **Given** an admin is on the theme settings page
- **When** they enable CZK, EUR, and USD currencies
- **Then** prices display in all three currencies on menu views
- **And** the order matches the selection order

#### Scenario: Admin updates exchange rates
- **Given** an admin is on the theme settings page
- **When** they update the EUR rate to 0.041
- **Then** all EUR price displays update immediately
- **And** the rate persists after page refresh

---

### Requirement: Price Display Modes

The system SHALL support multiple display modes for showing currency information: single currency, multi-currency inline, and customer-selectable toggle.

#### Scenario: Single currency mode
- **Given** display mode is set to "single"
- **And** CZK is the first enabled currency
- **When** a price of 25000 cents is displayed
- **Then** only "250 Kč" is shown

#### Scenario: Multi-currency mode inline
- **Given** display mode is set to "multi"
- **And** CZK, EUR, USD are enabled
- **When** a price of 25000 cents (CZK base) is displayed
- **Then** "250 Kč · €10 · $11" is shown

#### Scenario: Toggle mode with customer selection
- **Given** display mode is set to "toggle"
- **And** customer has selected USD
- **When** a price is displayed
- **Then** only the USD equivalent is shown
- **And** a currency selector is visible in the header

---

### Requirement: Currency Formatting

The system SHALL format currencies according to locale conventions, with proper symbol placement, decimal handling, and spacing.

#### Scenario: CZK formatting
- **Given** a price to display in CZK
- **When** the amount is 250.00
- **Then** it displays as "250 Kč" (symbol after, no decimals)

#### Scenario: EUR formatting
- **Given** a price to display in EUR
- **When** the amount is 10.50
- **Then** it displays as "€10.50" (symbol before, 2 decimals)

#### Scenario: USD formatting
- **Given** a price to display in USD
- **When** the amount is 11.00
- **Then** it displays as "$11.00" (symbol before, 2 decimals)

#### Scenario: CNY formatting
- **Given** a price to display in CNY
- **When** the amount is 75.00
- **Then** it displays as "¥75" (symbol before, no decimals)

#### Scenario: Compact mode enabled
- **Given** compact mode is enabled
- **And** the price has no meaningful decimals
- **When** EUR amount is 10.00
- **Then** it displays as "€10" (no decimals)

---

### Requirement: Currency Conversion

The system SHALL accurately convert prices between supported currencies using configured exchange rates with appropriate rounding.

#### Scenario: CZK to EUR conversion
- **Given** base currency is CZK
- **And** EUR rate is 0.040
- **When** a price of 25000 cents is converted to EUR
- **Then** the result is 1000 cents (€10.00)

#### Scenario: EUR to CZK conversion
- **Given** base currency is EUR
- **And** CZK rate is 25.0
- **When** a price of 1000 cents is converted to CZK
- **Then** the result is 25000 cents (250 Kč)

#### Scenario: Rounding behavior
- **Given** a conversion results in 10.556
- **When** displaying in EUR (2 decimal currency)
- **Then** the result rounds to 10.56

---

### Requirement: Admin Currency UI

The system SHALL provide an intuitive admin interface for currency management within the theme editor, allowing configuration of all currency-related settings.

#### Scenario: Currency settings visible in theme editor
- **Given** an admin navigates to /admin/theme
- **When** they click the "Currency" tab (or section)
- **Then** they see base currency, display currencies, rates, and mode options

#### Scenario: Base currency selection
- **Given** an admin is in currency settings
- **When** they change base currency from CZK to EUR
- **Then** a warning displays about price interpretation change
- **And** the rates table inverts appropriately

#### Scenario: Exchange rate validation
- **Given** an admin enters a rate of 0 or negative
- **When** they try to save
- **Then** an error message appears
- **And** the save is prevented

---

## MODIFIED Requirements

### Requirement: Theme Configuration (from existing theme system)

The theme configuration SHALL include currency settings as part of the display options, with sensible defaults for new installations.

#### Scenario: Theme includes currency config
- **Given** a theme is loaded
- **When** currency settings are not present
- **Then** default currency config is used (CZK base, single mode)

#### Scenario: Theme preset includes currency
- **Given** an admin saves a theme preset
- **When** the preset is loaded later
- **Then** currency settings are restored

---

## Cross-References

- **Menu Display Spec**: PriceDisplay component uses currency config
- **Theme System Spec**: Currency config stored in theme settings
- **Admin Interface Spec**: Currency UI in theme editor
