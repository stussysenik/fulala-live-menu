# currency Specification (Delta)

## MODIFIED Requirements

### Requirement: Currency Toggle UI Responsiveness

The currency toggle (CurrencyLens) SHALL provide instantaneous visual feedback when a currency button is clicked, with the active state highlighting occurring synchronously with the click event. **Default display mode SHALL be "single" to optimize for mobile-first UX.**

#### Scenario: Instantaneous toggle activation
- **WHEN** user clicks a currency button in the toggle
- **THEN** the button receives the active styling immediately (within the same frame)
- **AND** the previously active button loses active styling immediately
- **AND** aria-pressed attribute updates to match visual state

#### Scenario: No visual delay on selection
- **GIVEN** user rapidly clicks between different currency buttons
- **WHEN** each button is clicked
- **THEN** only the clicked button shows active state at any given time
- **AND** there is no perceptible delay between click and visual update

#### **NEW** Scenario: Mobile-first single currency display
- **GIVEN** the theme config uses default settings
- **WHEN** menu loads on any device
- **THEN** prices display in single currency mode (primary currency only)
- **AND** CurrencyLens buttons are visible at top of menu
- **AND** clicking a currency button updates all prices globally
- **AND** selected currency persists via localStorage

## ADDED Requirements

### Requirement: Mobile-First Price Display

Price components SHALL default to single-currency display mode to optimize mobile readability and prevent overflow on small screens.

#### Scenario: Single currency on mobile
- **GIVEN** viewport width < 480px
- **WHEN** menu loads with default theme
- **THEN** each price shows only the selected currency
- **AND** no price text wraps to multiple lines
- **AND** no price text is truncated or cut off
- **AND** prices remain fully visible with item names up to 50 characters

#### Scenario: Global currency switching
- **GIVEN** menu is displayed with single-currency mode
- **WHEN** user clicks a currency button in CurrencyLens
- **THEN** all prices on page update to selected currency within 100ms
- **AND** no price temporarily shows multiple currencies during transition
- **AND** selection persists across page refresh

#### Scenario: Multi-currency override still available
- **GIVEN** admin configures theme with `displayMode: "multi"`
- **WHEN** menu loads on mobile (< 480px width)
- **THEN** multi-currency prices display without overflow
- **AND** prices use `flex-wrap: nowrap` to stay on single line
- **AND** overflow is hidden gracefully without text cutoff
- **AND** all currency values remain readable

## Rationale

**Why change from "multi" to "single" default:**
- Mobile devices represent majority of traffic
- Multi-currency display clutters small screens (e.g., "200 Kč · €8 · $9")
- Single currency with global selector provides cleaner UX
- CurrencyLens component already implemented and functional
- Maintains backward compatibility via theme override

**Mobile-first principle:**
- Screens < 480px need focused content
- Multiple prices can wrap awkwardly or overflow
- Users prefer scanning single prices vs. comparing multiple
- Global currency selector is more intuitive than inline toggle per item
