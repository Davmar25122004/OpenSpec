## ADDED Requirements

### Requirement: Admin dashboard widget for requests

The system SHALL provide a widget on the administrator dashboard displaying all "pending" vacation requests from workers.

#### Scenario: Viewing pending requests

- **WHEN** an administrator logs in and views the dashboard
- **THEN** they see a list containing pending vacation requests, showing the worker's name and requested dates

### Requirement: Admin approves a request

The system SHALL allow an administrator to approve a pending vacation request.

#### Scenario: Approving a request

- **WHEN** an administrator clicks "Approve" on a pending request
- **THEN** the request status changes to "approved" AND the vacation dates are assigned to the worker in the existing vacation system
- **THEN** the request is removed from the pending widget

### Requirement: Admin rejects a request

The system SHALL allow an administrator to reject a pending vacation request.

#### Scenario: Rejecting a request

- **WHEN** an administrator clicks "Reject" on a pending request
- **THEN** the request status changes to "rejected"
- **THEN** the request is removed from the pending widget
