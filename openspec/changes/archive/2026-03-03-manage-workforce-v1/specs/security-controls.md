# Spec: Security Controls

## Overview

Defines the security requirements that MUST be implemented before any UI component is generated, as per the OpenSpec process: security specs are defined first.

---

## Security Requirements

### Requirement: Input Sanitization (Server-Side)

- **GIVEN** any incoming API request containing string fields
- **WHEN** the request is processed by the validation middleware
- **THEN** all strings are passed through `validator.escape()` to strip HTML entities and script fragments

### Requirement: Unique ID Enforcement

- **GIVEN** a `POST /api/workers` request
- **WHEN** the middleware checks the current worker list
- **THEN** if a worker with the same `id` already exists, the request is rejected with HTTP `400` before any write occurs

### Requirement: Required Field Enforcement

- **GIVEN** a `POST /api/workers` request
- **WHEN** `name` or `id` is missing or empty after trimming whitespace
- **THEN** the API returns HTTP `422` with a JSON body `{ "error": "Missing required field: <field>" }`

### Requirement: No Trusted Client Data

- **GIVEN** data received from the browser
- **WHEN** it is to be displayed back in the HTML
- **THEN** the frontend must use `textContent` (not `innerHTML`) to prevent XSS from stored data

### Requirement: Atomic Writes

- **GIVEN** any mutation to `db.json`
- **WHEN** the write is performed
- **THEN** data is written to a temp file first, then renamed to `db.json` to prevent file corruption on crash

---

## Acceptance Criteria

| ID     | Criterion                                                         |
| ------ | ----------------------------------------------------------------- |
| SEC-01 | `validator.escape()` applied to all string inputs before DB write |
| SEC-02 | Duplicate `id` on `POST /api/workers` returns `400`               |
| SEC-03 | Empty `name` or `id` returns `422`                                |
| SEC-04 | Frontend renders worker names via `textContent` only              |
| SEC-05 | DB writes use atomic temp-rename pattern                          |
