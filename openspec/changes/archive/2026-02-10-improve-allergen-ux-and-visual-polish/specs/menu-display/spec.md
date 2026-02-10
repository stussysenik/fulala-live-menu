## ADDED Requirements

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
