## Context

The enterprise workforce application currently relies on Bootstrap 5 and has basic functionality for vacation and overtime logging. To meet new enterprise requirements, the UI needs a more premium, modern feel, and the backend needs strict multi-tenant validation to ensure operational coverage (e.g., no two people from the same company can take vacations or log overtime on the same day).

## Goals / Non-Goals

**Goals:**

- Completely migrate the frontend from Bootstrap 5 to Tailwind CSS.
- Implement highly restrictive backend validations for vacations and overtime, scoped by `companyId`.
- Enhance UX with Tailwind-native Toasts to provide clear feedback when validation fails.
- Display individual employee counters (vacation days and overtime hours) on the new employee Cards.

grity even if the frontend validation is bypassed.
- **Frontend State / Feedback**: We will use a Toast notification system built with Tailwind. When the API returns an error regarding availability, the frontend will intercept it and display a Toast (e.g., "Día no disponible: Ya asignado a otro compañero").

## Risks / Trade-offs

- **Risk: Frontend Migration Complexity** -> Mitigation: We will replace components incrementally, starting with layout, then Cards, then forms.
- **Ri**Non-Goals:**

- Changing the underlying database technology (continuing to use the existing JSON-based or lightweight DB strategy).
- Adding complex role-based access control beyond the existing `companyId` isolation.

## Decisions

- **Styling Framework**: Tailwind CSS via CDN (or build step if already configured) to enable rapid, utility-first styling without writing custom CSS classes from scratch. We chose Tailwind over custom CSS for maintenance and speed.
- **Backend Validation Logic**: The backend will handle the exclusivity checks. Before saving a vacation or overtime entry, it will query existing entries for the same `companyId` on the given date. If a match exists for a _different_ user, the insert is rejected with an appropriate error. This ensures data intesk: Strict Validations Blocking Users** -> Mitigation: The UX must be crystal clear about _why_ a day is blocked to prevent user frustration. The calendar should ideally pre-fetch blocked dates to disable them visually before the user even tries to submit.
