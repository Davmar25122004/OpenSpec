## Tasks

### Task: Implement Company Selection Landing Page

- Build the entry landing page using Bootstrap 5.
- Add a dropdown for company selection.
- Implement authentication/session logic tying the user strictly to the selected company.

### Task: Setup Data Isolation logic in Backend

- Modify backend controllers to filter all requests (workers, schedules, records) by the user's `companyId`.
- Ensure new registrations correctly save the associated `companyId` to `db.json`.

### Task: Implement jQuery Datepicker Vacation Module

- Include jQuery and jQuery UI Datepicker in the frontend.
- Build the frontend form for requesting vacations using the Datepicker.
- Create the backend endpoint to receive vacation requests.

### Task: Implement Vacation Collision Validation (Backend)

- Write a JSDoc-commented validation function to check for overlapping vacation dates.
- Function should query `db.json` for approved vacations within the same `companyId`.
- Return a 400 Bad Request if a collision is detected.

### Task: Implement Additional Hours Module

- Build the frontend form to request Overtime and Complementary Hours.
- Create the backend endpoint to handle these requests.
- Add a JSDoc-commented validation function to check that requested hours do not overlap with the user's standard working schedule.

### Task: Refactor UI with Bootstrap 5 and CSS Transitions

- Apply Bootstrap 5 layout grid and utilities to all screens (Landing, Workforce Panel, Forms).
- Add CSS rules for micro-interactions (e.g., `transform: scale(1.02)`, `filter: brightness(1.1)`, `transition: all 0.2s ease`) on interactive elements like buttons and employee cards.
