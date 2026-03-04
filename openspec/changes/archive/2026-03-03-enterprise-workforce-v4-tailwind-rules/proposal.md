## Why

This change evolves the enterprise workforce application by introducing a high-end, professional UI framework combined with strict, cross-user business validations. The transition to Tailwind CSS upgrades the visual experience, while the unique-per-company rules for vacations and overtime ensure operational control over workforce availability.

## What Changes

- **Framework Estético (Tailwind CSS)**: Migrate the entire frontend interface to Tailwind CSS, designing a dashboard with a minimalist aesthetic, clear typography, and a professional color palette. Basic tables are replaced with dynamic Cards featuring shadows and smooth transitions.
- **Validación de Vacaciones Únicas**: Backend restriction preventing multiple users from the _same company_ from booking vacations on the exact same date. The frontend calendar will visually block dates assigned to other colleagues.
- **Validación de Horas Extra Exclusivas**: "Single quota" rule for overtime. If an employee registers extra hours on a specific day, it blocks any other employee from the _same company_ from doing so.
- **UX de Feedback**: Modern Tailwind-based components (Toasts/Alerts) to provide clear user feedback when an action is blocked due to cross-validation (e.g., 'Día no disponible: Ya asignado a otro compañero').
- **Módulo de Usuario**: Employee profile Cards will display individual counters for used vacations and logged extra hours.
- **Calidad Técnica**: Strict adherence to multitenancy (`companyId` isolation), JSDoc documentation for new validation functions, and updating `PROJECT_LOG.md` with these exclusivity rules.

## Capabilities

### New Capabilities

- `tailwind-ui`: Complete refactor of visual styling and interaction components.
- `exclusive-vacations`: Validation rules and calendar blocking for single-vacation-per-company-day logic.
- `exclusive-overtime`: Validation rules for single-overtime-per-company-day logic.

### Modified Capabilities

- `user-profile`: Display updates for employee cards to include individual vacation and extra hours counters.
- `validation-feedback`: Transition from basic browser alerts to integrated UI Toasts for validation blocking.

## Impact

- Frontend HTML/CSS/JS (`index.html`, `app.js`, `styles.css`) heavily impacted due to Tailwind migration.
- Backend APIs (`vacations.js`, `hours.js`) require data-query extensions to assert uniqueness based on `companyId` before insertions.
- Database reads/writes will involve cross-referencing other users within the same `companyId`.
