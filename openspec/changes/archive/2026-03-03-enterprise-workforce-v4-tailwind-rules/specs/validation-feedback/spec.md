## ADDED Requirements

### Requirement: User-Friendly Validation Feedback

The system MUST provide clear, non-intrusive feedback when a user action is blocked by a validation rule.

#### Scenario: Receiving a validation error

- **WHEN** the backend returns a 409 Conflict or 400 Bad Request due to exclusivity rules
- **THEN** the frontend displays a Tailwind-styled Toast or integrated Alert.
- **AND** the message clearly explains the reason (e.g., "Día no disponible: Ya asignado a otro compañero").
