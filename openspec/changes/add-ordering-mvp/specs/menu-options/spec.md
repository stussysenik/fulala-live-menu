# menu-options — delta

## ADDED Requirements

### Requirement: Authoritative Per-Item Option Configuration

Each menu item SHALL declare its option groups (e.g., noodle type, spice level, drink add-ons) with the allowed values and a required/optional flag, and this configuration SHALL be the single source of truth for what customers can select.

#### Scenario: Admin configures option groups for an item
- **WHEN** an admin edits an item's options in the modifier editor
- **THEN** the admin can enable/disable each option group, edit its allowed values, and mark it required or optional
- **AND** the configuration persists on the menu item

#### Scenario: Item without configured groups shows no option UI
- **WHEN** a customer views an item that has no option groups configured
- **THEN** no option selector is shown and the item can be added directly to the cart

### Requirement: Option Selection Validation

The system SHALL reject option selections that are not part of an item's configuration, both client-side and in order mutations.

#### Scenario: Unknown option value rejected
- **WHEN** an add-to-cart request includes a value not in the item's configured allowed values
- **THEN** the mutation rejects the request with a descriptive error
- **AND** the cart is unchanged

#### Scenario: Required option enforced before add-to-cart
- **GIVEN** an item with a required option group (e.g., noodle type)
- **WHEN** the customer attempts to add the item without selecting a value for that group
- **THEN** the UI blocks the action and highlights the missing group

#### Scenario: Required options enforced at submission
- **WHEN** an order is submitted containing a line item missing a required option (e.g., added before config changed)
- **THEN** submission is rejected with the offending line item identified
