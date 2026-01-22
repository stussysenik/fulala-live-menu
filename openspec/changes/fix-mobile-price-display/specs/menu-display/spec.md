# menu-display Specification (Delta)

## ADDED Requirements

### Requirement: Responsive Price Display

Price components SHALL prevent truncation and overflow on all screen sizes through CSS flex properties and white-space controls.

#### Scenario: Price never truncates in any layout
- **GIVEN** menu item with price displayed in any layout (CardGrid, DimSumGrid, TraditionalChineseGrid)
- **WHEN** viewport width is between 320px and 2560px
- **THEN** full price value is visible (no truncation)
- **AND** price does not wrap to multiple lines
- **AND** price maintains proper spacing from adjacent elements
- **AND** currency symbol (if shown) is not separated from amount

#### Scenario: Price withstands layout pressure
- **GIVEN** menu item with very long name (30+ characters)
- **WHEN** displayed in narrow container (< 375px)
- **THEN** item name may wrap or truncate
- **BUT** price remains fully visible and unaffected
- **AND** price does not get squeezed by flex layout

#### Scenario: CardGrid layout price protection
- **GIVEN** CardGrid layout with price in `.card-footer`
- **WHEN** footer contains both price and "+ Add" button
- **THEN** price has `flex-shrink: 0` to prevent compression
- **AND** price has `min-width: fit-content` to maintain full width
- **AND** footer has gap spacing to prevent elements touching
- **AND** price displays fully even on 320px width screens

#### Scenario: DimSumGrid layout price protection
- **GIVEN** DimSumGrid layout with price in `.item-price`
- **WHEN** item row contains checkbox, item info, and price
- **THEN** price has `flex-shrink: 0` to prevent compression
- **AND** price has `min-width: fit-content` and `white-space: nowrap`
- **AND** item info flexes/wraps while price stays intact

#### Scenario: TraditionalChineseGrid layout price protection
- **GIVEN** TraditionalChineseGrid layout with price in `.item-price`
- **WHEN** item contains number, name, and price in flex row
- **THEN** price has `flex-shrink: 0`, `min-width: fit-content`, `white-space: nowrap`
- **AND** item name flexes while price remains at fixed width
- **AND** price displays fully in monospace font without truncation

### Requirement: Multi-Currency Mobile Optimization

When multi-currency display mode is active (via theme override), mobile screens SHALL gracefully handle multiple price values without overflow.

#### Scenario: Multi-currency no-wrap on mobile
- **GIVEN** theme configured with `displayMode: "multi"`
- **WHEN** viewport width < 480px
- **THEN** `.price-multi` uses `flex-wrap: nowrap`
- **AND** overflow is hidden to prevent layout break
- **AND** gap between currencies is reduced to `0.125rem`
- **AND** separator margins are reduced to `0.0625rem`

#### Scenario: Multi-currency graceful overflow
- **GIVEN** menu with 3+ currencies displayed
- **WHEN** combined width exceeds container on 320px screen
- **THEN** prices do not wrap to multiple lines
- **AND** overflow is hidden (not visible scrolling)
- **AND** at least primary currency is always visible
- **AND** layout does not break or shift

## Rationale

**Why explicit price protection is needed:**
- Flex layouts can squeeze or truncate prices when space is limited
- Prices are critical information that must never be partially hidden
- Different layouts have different flex hierarchies requiring specific fixes
- Mobile screens amplify these issues due to limited width

**CSS properties used:**
- `flex-shrink: 0` - Prevents flex container from compressing price
- `min-width: fit-content` - Ensures price takes full natural width
- `white-space: nowrap` - Prevents price from wrapping across lines
- `gap` in flex containers - Prevents elements from touching/overlapping

**Layout-specific considerations:**
- **CardGrid**: Price competes with "+ Add" button in horizontal footer
- **DimSumGrid**: Price competes with checkboxes, tags, and quantity controls
- **TraditionalChineseGrid**: Price in flex row with item number and long Chinese names

**Mobile-first approach:**
- Start with single currency to avoid overflow entirely
- Provide mobile-specific CSS for multi-currency override cases
- Reduce spacing/gaps on mobile without losing readability
- Prioritize showing at least one complete price over showing partial multiple prices
