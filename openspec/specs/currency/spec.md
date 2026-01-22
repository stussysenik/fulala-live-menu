# currency Specification

## Purpose
TBD - created by archiving change fix-currency-toggle-reactivity. Update Purpose after archive.
## Requirements
### Requirement: Currency Toggle UI Responsiveness

The currency toggle (CurrencyLens) SHALL provide instantaneous visual feedback when a currency button is clicked, with the active state highlighting occurring synchronously with the click event.

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

