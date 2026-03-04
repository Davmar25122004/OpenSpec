## ADDED Requirements

### Requirement: Company Selection Landing Page

The system SHALL display a landing page acting as a mandatory filter where users must select their company before entering the main panel.

#### Scenario: User visits the system without selection

- **WHEN** the user visits the root application URL without an active session
- **THEN** they are presented with a company selection interface and blocked from accessing the main workforce panel

### Requirement: Company-linked Registration

The system SHALL link all new user registrations strictly to the selected company.

#### Scenario: User registers for a company

- **WHEN** a user fills out the registration form after selecting "Company A"
- **THEN** their new account is created with an association to "Company A" in the backend

### Requirement: Strict Data Isolation

The system SHALL isolate all views (workers, schedules, records) so users only see data belonging to their company.

#### Scenario: User views the workforce panel

- **WHEN** an authenticated user loads the employee dashboard
- **THEN** the backend only returns data for the company the user is associated with
