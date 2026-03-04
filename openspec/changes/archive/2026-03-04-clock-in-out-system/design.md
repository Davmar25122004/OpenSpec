# Design: Clock-in-Out System

## Architecture Overview

The system will be implemented as a new service layer in the backend, utilizing MariaDB for persistent storage of clocking events.

## Data Schema (MariaDB)

### Table: `clock_events`

| Column         | Type                  | Description                                  |
| :------------- | :-------------------- | :------------------------------------------- |
| `id`           | INT AUTO_INCREMENT    | Private Key                                  |
| `user_id`      | INT                   | Reference to the user                        |
| `event_type`   | ENUM('ENTRY', 'EXIT') | Type of action                               |
| `timestamp`    | DATETIME              | The `timestamp_entry` (or exit) as requested |
| `device_id`    | VARCHAR(255)          | Unique ID of the device used                 |
| `location_lat` | DECIMAL(10, 8)        | Latitude from `location_coords`              |
| `location_lng` | DECIMAL(11, 8)        | Longitude from `location_coords`             |

## State Logic

The system enforces a strict state machine per user:

1. **NO_SESSION / CLOSED**: The user is currently not working.
2. **ACTIVE_SESSION**: The user has clocked in but not yet clocked out.

### State Transitions:

- **ENTRY Action**:
  - Allowed only if the user's last event was `EXIT` or if no events exist.
  - If the last event was `ENTRY`, the request is rejected with `409 Conflict`.
- **EXIT Action**:
  - Allowed only if the user's last event was `ENTRY`.
  - If the last event was `EXIT` (or no events exist), the request is rejected with `403 Forbidden`.

## API Endpoints

### `POST /api/clocking/entry`

**Payload**:

```json
{
  "device_id": "string",
  "location_coords": {
    "lat": number,
    "lng": number
  }
}
```

**Behavior**: Checks state, captures `user_id` from session, generates server-side `timestamp`, and persists as `ENTRY`.

### `POST /api/clocking/exit`

**Payload**: Similar to entry.
**Behavior**: Checks state, persists as `EXIT`.

## Security & Integrity

- **GPS Verification**: Location coordinates are mandatory.
- **Server-side Timestamps**: To prevent users from spoofing their clocking time by changing their device clock.
