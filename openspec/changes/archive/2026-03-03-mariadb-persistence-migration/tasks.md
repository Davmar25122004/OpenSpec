# Tasks: MariaDB Persistence Migration

## Phase 1 — Infrastructure & Schema

- [x] Add MariaDB dependencies to project manifest (`mariadb`, `js-yaml`, `glob`, `dotenv`)
- [x] Create `schema.sql` with tables: `changes`, `tasks`, `specs`, `artifacts` (foreign keys, indexes, JSON columns, audit columns)
- [x] Create `.env.example` documenting all required environment variables (`MARIADB_HOST`, `MARIADB_PORT`, `MARIADB_USER`, `MARIADB_PASS`, `MARIADB_DB`, `MARIADB_POOL_SIZE`)
- [ ] Apply `schema.sql` against a local MariaDB 10.6+ instance to validate syntax

## Phase 2 — Connection Pool & DAO Layer

- [x] Create `db/pool.js` — singleton MariaDB connection pool (configurable size via env, timeout and retry settings)
- [x] Create `db/ChangesRepository.js` — CRUD methods: `findById`, `create`, `updateStatus`, `list`, `archive` (all using prepared statements)
- [x] Create `db/TasksRepository.js` — methods: `getByChange`, `getPending`, `markDone`, `markSkipped`, `create`, `bulkCreate`
- [x] Create `db/SpecsRepository.js` — methods: `upsert`, `getByChange`, `findByKey`
- [x] Create `db/ArtifactsRepository.js` — methods: `upsertArtifact`, `getByChange`, `markDone`
- [x] Add graceful error handling: wrap all DAO methods in try/finally to always release pool connections; surface actionable errors (e.g. connection refused → remind user to set env vars)
- [ ] Write unit tests for each Repository using a test MariaDB schema (or mock pool)

## Phase 3 — Engine Integration

- [ ] Identify all file I/O call sites in the OpenSpec engine (search for `readFile`, `writeFile`, `fs.`, JSON parse/stringify on `.openspec/*.json`)
- [ ] Replace each call site with the corresponding DAO method
- [ ] Ensure `openspec status`, `openspec new change`, `openspec instructions`, and `/opsx:apply` all pass through the DAO layer
- [ ] Update `openspec status --json` output: data now sourced from SQL `SELECT` queries
- [ ] Verify that the CLI startup sequence initialises the pool before any command is processed

## Phase 4 — Migration Script

- [x] Create `scripts/migrate.js` — scans `.openspec/changes/` and `openspec/changes/archive/`
- [x] Parse `.openspec.yaml` per change folder; map fields to `changes` table columns
- [x] Parse `tasks.md` checkboxes (`- [x]` done, `- [ ]` pending) → bulk upsert into `tasks`
- [x] Parse `specs/**/*.md` files → upsert into `specs` with `spec_key` derived from subfolder/filename
- [x] Parse `proposal.md`, `design.md` → upsert into `artifacts` with correct `status`
- [x] Implement idempotency: use `INSERT … ON DUPLICATE KEY UPDATE` for all upserts
- [x] Add dry-run mode (`--dry-run` flag) that logs SQL without executing
- [ ] Test migration against a copy of the existing `.openspec/` data; validate row counts

## Phase 5 — Validation & Hardening

- [ ] Run full integration test suite against seeded MariaDB instance
- [ ] Stress-test connection pool with 10 concurrent `/opsx:apply` calls
- [ ] Verify that `ON DELETE CASCADE` on `tasks`, `specs`, and `artifacts` correctly removes child rows when a change is hard-deleted
- [ ] Add monitoring hook: log pool utilisation (active / idle / queue length) to `MARIADB_POOL_LOG=true` opt-in
- [ ] Update `README.md` / `CONTRIBUTING.md` with MariaDB setup instructions and `migrate.js` usage

## Phase 6 — Cleanup

- [ ] Remove all legacy file-I/O adapter code once integration tests pass
- [ ] Archive or delete `.openspec/*.json` files (provide a backup script)
- [ ] Tag release with migration note in changelog
