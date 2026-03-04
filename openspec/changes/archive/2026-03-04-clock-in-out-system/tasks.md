# Tasks: Implement Clock-in-Out System

## 1. Database Layer

- [x] Create MariaDB migration to add `clock_events` table. <!-- id: 101 -->
- [x] Implement `ClockEventsRepository` in `openspec-mariadb-adapter/db/` to handle persistence. <!-- id: 102 -->
- [x] Add `getLastEventForUser(userId)` method to the repository for state checking. <!-- id: 103 -->

## 2. Backend Logic

- [x] Implement `ClockingService` with `registerEntry` and `registerExit` methods. <!-- id: 201 -->
- [x] Add state logic validation: verify that an entry is only allowed if the last event was an exit. <!-- id: 202 -->
- [x] Ensure `device_id` and `location_coords` are validated before insertion. <!-- id: 203 -->

## 3. API Integration

- [x] Create Express routes for `POST /api/clocking/entry` and `POST /api/clocking/exit`. <!-- id: 301 -->
- [x] Connect routes to the `ClockingService`. <!-- id: 302 -->
- [x] Implement proper error handling for 409 (Double Entry) and 403 (Invalid Exit). <!-- id: 303 -->

## 4. Verification

- [x] Create unit tests for `ClockingService` logic. <!-- id: 401 -->
- [x] Test edge cases: first-time entry, entry after exit, double entry. <!-- id: 402 -->
- [x] Verify database record integrity through a test script. <!-- id: 403 -->
