## 1. Frontend Setup & Tailwind Migration

- [x] 1.1 Add Tailwind CSS via CDN or build step to `index.html`.
- [x] 1.2 Refactor the main layout from Bootstrap to Tailwind utility classes.
- [x] 1.3 Convert existing tables to Tailwind-styled Cards.

## 2. Backend Validation: Vacations

- [x] 2.1 Update `app/server/routes/vacations.js` to assert `companyId` and `date` uniqueness.
- [x] 2.2 Add JSDoc comments to the new validation functions.
- [x] 2.3 Modify the frontend calendar to handle and visualize rejected/blocked vacation dates.

## 3. Backend Validation: Overtime

- [x] 3.1 Update `app/server/routes/hours.js` to restrict overtime to one user per company per day.
- [x] 3.2 Add JSDoc to the overtime validation logic.
- [x] 3.3 Ensure the frontend overtime form properly handles quota-exceeded errors.

## 4. Employee Profiles & Feedback UI

- [x] 4.1 Update the employee Card component to display individual vacation and overtime counters.
- [x] 4.2 Develop a Tailwind Toast component for validation feedback.
- [x] 4.3 Integrate the Toast component into the frontend error handling flow.
- [x] 4.4 Update `PROJECT_LOG.md` to document these new exclusivity rules and the Tailwind migration.
