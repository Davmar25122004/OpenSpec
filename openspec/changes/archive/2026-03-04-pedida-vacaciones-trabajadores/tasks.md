## 1. Database Schema

- [x] 1.1 Add `vacation_requests` table creation script to initialize or update the database schema
- [x] 1.2 Add methods to `UsersRepository.js` (or a backend equivalent) to insert, fetch, and update vacation requests

## 2. Backend API

- [x] 2.1 Create POST endpoint for workers to submit a vacation request
- [x] 2.2 Create GET endpoint to retrieve requests for a specific worker
- [x] 2.3 Create GET endpoint for admins to fetch all pending requests
- [x] 2.4 Update `api.yaml` outlining the new endpoints
- [x] 2.5 Create POST/PUT endpoints for admins to approve/reject a request
- [x] 2.6 Integrate approval logic to assign actual vacation days to the worker using existing vacation assigning logic

## 3. Frontend: Worker Interface

- [x] 3.1 Implement a date-picker / calendar component in the worker profile for selecting vacation dates
- [x] 3.2 Add a "Request" button to submit the selected dates to the backend API
- [x] 3.3 Add a section to display the worker's own request history (`pending`, `approved`, `rejected`)

## 4. Frontend: Admin Interface

- [x] 4.1 Build the vacation approval widget component for the admin dashboard
- [x] 4.2 Fetch pending requests on widget load and display them in a list
- [x] 4.3 Add "Approve" and "Reject" buttons for each item in the list
- [x] 4.4 Implement handlers to call the new API endpoints and remove the item from the pending list on success
- [x] 4.5 Ensure widget visually indicates when there are no more pending requests
