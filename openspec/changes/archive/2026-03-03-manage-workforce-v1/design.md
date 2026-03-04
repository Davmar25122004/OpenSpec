# Design: Workforce Management System v1

## Context

The system needs to manage company workers and their weekly schedules. Currently no tooling exists. This design describes how to implement backend persistence, a REST API, and an HTML5 frontend while enforcing security at every write operation.

## Goals

1. Persist workers and schedules across server restarts.
2. Expose a RESTful API for CRUD operations on workers and schedules.
3. Enforce security: sanitize all inputs, enforce unique worker IDs, and reject invalid payloads before any write is committed.
4. Deliver a clean HTML5 UI with semantic markup, CSS Grid layout, and CSS Custom Properties.

## Architecture

```
[ Browser HTML5 UI ]  ←HTTP/JSON→  [ Express REST API ]  ←→  [ JSON / SQLite Store ]
```

### Backend (Node.js + Express)

- **Entry point**: `server/index.js`
- **Routes**:
  - `GET /api/workers` — list all workers
  - `POST /api/workers` — add a worker (validated + sanitized)
  - `DELETE /api/workers/:id` — remove a worker
  - `GET /api/workers/:id/schedule` — get schedule for a worker
  - `PUT /api/workers/:id/schedule` — update schedule for a worker (validated)
- **Persistence**: `server/data/db.json` — updated atomically on every write.
- **Validation middleware** (`server/middleware/validate.js`):
  - Strip HTML/script tags from all string fields.
  - Enforce required fields (`name`, `id`).
  - Reject duplicate `id` on creation.
  - Validate schedule format (day names, time ranges).
- **Structure**:
  ```
  server/
    index.js
    routes/
      workers.js
      schedules.js
    middleware/
      validate.js
    data/
      db.json
  ```

### Frontend (HTML5 / Vanilla CSS + JS)

- **Entry point**: `client/index.html` (single HTML file)
- **Stylesheet**: `client/styles.css` (CSS Custom Properties, CSS Grid, responsive)
- **Script**: `client/app.js` (fetch API, DOM manipulation, no framework)
- **Key views**:
  - Worker list panel (CSS Grid)
  - Add/Remove worker form (with client-side pre-validation)
  - Schedule editor modal (per-worker weekly schedule)

## Security Design

Security is defined here first, before any UI or task is generated:

| Control              | Description                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| Input sanitization   | All string inputs stripped of HTML tags server-side via `validator.escape()` |
| Unique ID check      | Server returns `400` if a worker with the same `id` already exists           |
| Required field check | `name` and `id` are mandatory; empty values are rejected with `422`          |
| Schedule validation  | Each day entry must be a valid weekday and time range (`HH:MM-HH:MM`)        |
| No inline scripts    | Frontend uses no `eval()` or `innerHTML` with untrusted data                 |

## Data Model

```json
{
  "workers": [
    {
      "id": "emp-001",
      "name": "Ana García",
      "department": "Operations",
      "schedule": {
        "monday": "09:00-17:00",
        "tuesday": "09:00-17:00",
        "wednesday": "09:00-17:00",
        "thursday": "09:00-17:00",
        "friday": "09:00-14:00"
      }
    }
  ]
}
```

## Tech Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| Backend runtime    | Node.js (≥18 LTS)                                 |
| Backend framework  | Express 4                                         |
| Validation library | `validator` npm package                           |
| Persistence        | JSON flat-file (`fs.writeFileSync` atomic writes) |
| Frontend markup    | HTML5 semantic elements                           |
| Frontend styling   | Vanilla CSS (Custom Properties, CSS Grid)         |
| Frontend scripting | Vanilla JS (Fetch API)                            |

## Risks / Trade-offs

| Risk                          | Mitigation                                                |
| ----------------------------- | --------------------------------------------------------- |
| JSON file corruption on crash | Use write-to-temp-then-rename pattern                     |
| No authentication             | Acceptable for v1 (local/internal use); noted as v2 scope |
| Concurrent writes             | Single-process node; no race condition in practice        |
