# Spec: Schedule Management

## Overview

Defines the requirements for viewing and modifying worker schedules.

---

## Functional Requirements

### Requirement: View Worker Schedule

- **GIVEN** a worker exists in the system
- **WHEN** the operator selects the worker and opens the schedule panel
- **THEN** the current weekly schedule is displayed (days and time ranges)

### Requirement: Edit Schedule

- **GIVEN** the operator opens a worker's schedule editor
- **WHEN** they modify one or more day-shift entries and save
- **THEN** the updated schedule is sent to `PUT /api/workers/:id/schedule` and persisted

### Requirement: Validate Schedule Format

- **GIVEN** the operator submits a schedule update
- **WHEN** any time entry is not in `HH:MM-HH:MM` format or the day is not a valid weekday
- **THEN** the API returns `422` and the UI shows a format error; no data is saved

### Requirement: Empty Schedule Allowed

- **GIVEN** a worker is created
- **WHEN** no schedule is assigned yet
- **THEN** the system stores an empty schedule object `{}` and the UI shows "No schedule assigned"

---

## Non-Functional Requirements

- Schedule updates must persist atomically (write-temp-then-rename).
- No schedule can reference a worker that does not exist.
- Valid weekdays are: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`.
