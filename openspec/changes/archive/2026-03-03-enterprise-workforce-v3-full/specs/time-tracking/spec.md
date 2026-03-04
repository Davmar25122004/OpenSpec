## ADDED Requirements

### Requirement: Additional Hours Request

The system SHALL allow users to request Overtime and Complementary Hours.

#### Scenario: User submits overtime request

- **WHEN** the user fills out the additional hours request form with valid times
- **THEN** the system records the request for processing

### Requirement: Standard Hours Collision Detection

The system SHALL validate that requested additional hours do not overlap with the standard work schedule of the user.

#### Scenario: User requests overtime during standard hours

- **WHEN** a user requests extra hours that intersect with their registered standard working hours in the backend
- **THEN** the backend rejects the submission and returns a scheduling validation error
