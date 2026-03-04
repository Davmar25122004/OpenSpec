## ADDED Requirements

### Requirement: Worker vacation request submission

The system SHALL allow workers to submit a vacation request specifying a start date and an end date.

#### Scenario: Successful request submission

- **WHEN** a worker selects a valid, non-overlapping date range and clicks "Request"
- **THEN** a new vacation request is created with a "pending" status for that worker

### Requirement: Worker views their requests

The system SHALL display the worker's pending, approved, and rejected vacation requests.

#### Scenario: Viewing request status

- **WHEN** a worker navigates to their profile/vacation sections
- **THEN** they see visually distinct indicators for requests that are pending versus approved or rejected
