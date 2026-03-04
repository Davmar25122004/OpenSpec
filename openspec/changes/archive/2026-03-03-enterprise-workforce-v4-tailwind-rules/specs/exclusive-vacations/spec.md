## ADDED Requirements

### Requirement: Exclusive Vacation Days per Company

The system MUST NOT allow multiple users from the same company to have approved vacations on the exact same date.

#### Scenario: Requesting an unavailable vacation date

- **WHEN** a user attempts to book a vacation on a date that is already assigned to a colleague in the same company
- **THEN** the backend rejects the request with a conflict error.
- **AND** the Calendar UI blocks the date from being selected.

#### Scenario: Requesting an available vacation date

- **WHEN** a user requests a vacation on a date where no other colleague in the same company has a vacation assigned
- **THEN** the backend approves and saves the vacation.
