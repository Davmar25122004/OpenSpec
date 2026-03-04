## Why

Workers currently must rely on the administrator to manually assign their vacation days. This change empowers workers to request specific vacation dates directly through their interface. It streamlines the approval process by automatically notifying administrators upon login, allowing them to review and approve/reject these requests, reducing manual communication and data entry overhead.

## What Changes

- Workers will have a calendar component in their interface to select days and a "Request" button to submit their vacation proposal.
- Administrators will see a new widget upon login displaying pending vacation requests from workers.
- An approval mechanism for the administrator to review, accept, or modify the requests.
- When an administrator accepts a request, the vacation days will be automatically assigned to the worker, integrating with the existing vacation assignment logic.

## Capabilities

### New Capabilities

- `vacation-requests`: Allows workers to submit vacation requests by picking dates from a calendar.
- `vacation-approval-widget`: An administrator dashboard widget to review, approve, and assign pending worker vacation requests.

### Modified Capabilities

None.

## Impact

- Frontend Worker Interface: Addition of a calendar and a form/button to request vacations.
- Frontend Admin Interface: Addition of an approval widget on the dashboard.
- Backend API: New endpoints for creating, retrieving, and updating vacation requests.
- Database: A new table to store vacation requests and their statuses (`pending`, `approved`, `rejected`).
- Business Logic: The logic to seamlessly map an "approved" request into assigned vacation mode for the worker.
