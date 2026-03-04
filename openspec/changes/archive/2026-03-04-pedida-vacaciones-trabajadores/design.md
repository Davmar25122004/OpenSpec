## Context

Currently, the vacation assignment system requires the administrator to manually select dates for workers. There is no automated workflow for a worker to request dates and have an administrator review and approve those dates. Stakeholders want to empower workers to request vacations themselves, easing the admin's workload.

## Goals / Non-Goals

**Goals:**

- Allow workers to select dates on a calendar and submit a vacation request.
- Provide a dashboard widget for administrators to view, approve, and reject vacation requests.
- Integrate the approved requests into the existing vacation system.

**Non-Goals:**

- Complex HR workflows like multi-level approvals.
- Creating an email or push notification system alerting administrators (in-app widget notification only).

## Decisions

- **Store requests in a new Database Table `vacation_requests`**: Create a new table with fields `id`, `user_id`, `start_date`, `end_date`, `status` (`pending`, `approved`, `rejected`), and `created_at`.
  - _Alternative_: Add a pending column to the existing vacation assignment table.
  - _Rationale_: A dedicated table clearly separates the workflow of a request vs an actual assigned vacation, reducing risk of regressions in existing features that rely on the vacation assignments.
- **Admin Widget Architecture**: We will build an independent UI widget that polling/fetches pending requests on dashboard load. Approving a request will invoke the existing API logic used by the admin to manually apply a vacation.
- **Worker Calendar Component**: We will use standard HTML5 date inputs or integrate a minimal calendar library for date picking to ensure cross-device compatibility.

## Risks / Trade-offs

- **Risk: Overlapping / Conflicting Dates**: Workers requesting overlapping dates.
  - **Mitigation**: Ensure validation both on the UI (calendar constraints) and the Backend API to prevent requests over already approved vacation times.
- **Risk: Admin UI Clutter**: Many pending requests could overwhelm the UI.
  - **Mitigation**: Use a localized scrolling widget component.
