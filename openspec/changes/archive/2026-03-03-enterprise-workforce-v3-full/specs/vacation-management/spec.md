## ADDED Requirements

### Requirement: Vacation Request Interface

The system SHALL include a vacation request module powered by the jQuery Datepicker component.

#### Scenario: User requests a vacation

- **WHEN** the user opens the vacation booking form
- **THEN** they can select their start and end dates using a jQuery Datepicker widget

### Requirement: Vacation Collision Prevention

The system SHALL prevent two or more members of the same company from booking overlapping vacation dates.

#### Scenario: User overlap attempt

- **WHEN** a user requests a vacation period that overlaps with an existing approved vacation within their company
- **THEN** the system rejects the request and displays a collision error message
