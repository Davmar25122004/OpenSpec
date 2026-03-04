# Tasks: Workforce Management System v1

## 1. Project Setup

- [x] 1.1 Create directory structure: `server/`, `server/routes/`, `server/middleware/`, `server/data/`, `client/`
- [x] 1.2 Initialize Node.js project (`npm init -y`) in `server/`
- [x] 1.3 Install dependencies: `express`, `validator`, `cors`
- [x] 1.4 Create `server/data/db.json` with initial empty structure `{ "workers": [] }`

## 2. Security Middleware (SEC specs — implement first)

- [x] 2.1 Create `server/middleware/validate.js` with `sanitizeInput()` helper using `validator.escape()`
- [x] 2.2 Implement `validateWorker()` middleware: required fields check, unique ID check, returns `400`/`422`
- [x] 2.3 Implement `validateSchedule()` middleware: day name and `HH:MM-HH:MM` format validation, returns `422`
- [x] 2.4 Write unit test assertions for each validation rule (manual test cases documented in comments)

## 3. Backend — Persistence Layer

- [x] 3.1 Create `server/db.js`: `readDB()` and `writeDB()` using atomic write-temp-then-rename pattern
- [x] 3.2 Handle `ENOENT` (missing db.json) gracefully by returning empty `{ "workers\": [] }`

## 4. Backend — Worker Routes

- [x] 4.1 Create `server/routes/workers.js`
- [x] 4.2 `GET /api/workers` — return full worker list from `db.json`
- [x] 4.3 `POST /api/workers` — apply `validateWorker` middleware, save new worker, return `201`
- [x] 4.4 `DELETE /api/workers/:id` — find and remove worker + schedule, return `200` or `404`

## 5. Backend — Schedule Routes

- [x] 5.1 Create `server/routes/schedules.js`
- [x] 5.2 `GET /api/workers/:id/schedule` — return worker schedule or `404` if worker not found
- [x] 5.3 `PUT /api/workers/:id/schedule` — apply `validateSchedule` middleware, update and persist schedule

## 6. Backend — Server Entry Point

- [x] 6.1 Create `server/index.js`: mount routes, enable CORS, JSON body parsing
- [x] 6.2 Verify server starts on `PORT=3000` and returns correct responses on all endpoints

## 7. Frontend — HTML Structure

- [x] 7.1 Create `client/index.html` with semantic HTML5 (`<header>`, `<main>`, `<section>`, `<dialog>`)
- [x] 7.2 Worker list section: CSS Grid layout, each card shows name, ID, department, remove button
- [x] 7.3 "Add Worker" form: `name`, `id`, `department` inputs with `required` attributes
- [x] 7.4 Schedule editor `<dialog>`: weekday rows with time-range inputs per worker

## 8. Frontend — CSS Styling

- [x] 8.1 Create `client/styles.css` with CSS Custom Properties (colors, spacing, radius, font)
- [x] 8.2 Implement CSS Grid layout for worker card list (responsive: 1→2→3 columns)
- [x] 8.3 Style add-worker form, schedule dialog, error/success banners
- [x] 8.4 Add smooth transitions for card add/remove and dialog open/close

## 9. Frontend — JavaScript Logic

- [x] 9.1 Create `client/app.js`: `fetchWorkers()` on load, render cards using `textContent` (no `innerHTML` for data)
- [x] 9.2 Implement `addWorker()`: POST with form data, handle `400`/`422` errors, refresh list
- [x] 9.3 Implement `removeWorker(id)`: DELETE request, confirmation prompt, remove card from DOM
- [x] 9.4 Implement `openSchedule(id)`: GET schedule, populate dialog inputs, open `<dialog>`
- [x] 9.5 Implement `saveSchedule(id)`: PUT request with dialog form data, handle validation errors

## 10. Integration & Verification

- [x] 10.1 Manual end-to-end test: add worker → assign schedule → modify schedule → remove worker
- [x] 10.2 Verify SEC-01: submit `<script>` in name field — confirm it is escaped in DB
- [x] 10.3 Verify SEC-02: add duplicate `id` — confirm `400` response and no duplicate in DB
- [x] 10.4 Verify SEC-03: submit empty `name` — confirm `422` response
- [x] 10.5 Verify SEC-04: stored name with special chars rendered safely in DOM
- [x] 10.6 Verify SEC-05: kill server mid-write (manual) — confirm `db.json` not corrupted
- [x] 10.7 Restart server and confirm all workers/schedules persisted correctly
