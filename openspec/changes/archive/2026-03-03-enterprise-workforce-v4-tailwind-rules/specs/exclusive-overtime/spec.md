## ADDED Requirements

### Requirement: Single Overtime Quota per Company Day

The system MUST enforce a rule where only one employee per company can log overtime hours on any specific day.

#### Scenario: Logging overtime on a taken day

- **WHEN** a user submits overtime hours for a date where another employee in the same company has already logged overtime
- **THEN** the backend rejects the submission.
- **AND** the UI indicates that the overtime quota for that day is already filled.

#### Scenario: Logging overtime on an open day

- **WHEN** a user submits overtime hours for a date where no other employee in the same company has logged overtime
- **THEN** the backend accepts the entry.
