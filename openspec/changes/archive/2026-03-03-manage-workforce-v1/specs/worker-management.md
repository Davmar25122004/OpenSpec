# Spec: Worker Management

## Overview

Defines the requirements for adding, listing, and removing workers in the system.

---

## Functional Requirements

### Requirement: List Workers

- **GIVEN** the operator opens the system
- **WHEN** the page loads
- **THEN** all registered workers are displayed in a grid with name, ID, and department

### Requirement: Add Worker

- **GIVEN** the operator fills in the "Add Worker" form
- **WHEN** they submit with a unique ID, non-empty name, and valid department
- **THEN** the worker is saved to the backend and appears in the list

### Requirement: Reject Duplicate Worker

- **GIVEN** the operator submits a worker form
- **WHEN** the provided `id` already exists in the backend
- **THEN** the API returns `400` and the UI displays an error message; no record is created

### Requirement: Reject Invalid Input

- **GIVEN** the operator submits a worker form
- **WHEN** any required field (`name`, `id`) is empty or contains HTML/script content
- **THEN** the API returns `422` with a descriptive error; the UI shows the validation message

### Requirement: Remove Worker

- **GIVEN** a worker is listed
- **WHEN** the operator clicks "Remove" and confirms the action
- **THEN** the worker and their schedule are deleted from the backend and removed from the UI

---

## Non-Functional Requirements

- All write operations must sanitize string inputs before persisting.
- The backend must persist data across server restarts (`db.json`).
- The API must return JSON with appropriate HTTP status codes.
