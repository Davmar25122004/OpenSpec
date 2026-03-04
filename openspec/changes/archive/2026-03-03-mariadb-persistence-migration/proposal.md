# Proposal: MariaDB Persistence Migration

## Problem Statement

The current OpenSpec engine relies on local JSON files (`.openspec/*.json`) for persisting changes, tasks, and specs. This approach presents hard limitations in environments with multiple concurrent agents, long-running workflows, or CI/CD pipelines that require transactional guarantees. File-based storage is prone to race conditions during concurrent writes, lacks query capabilities, cannot enforce referential integrity, and does not scale to enterprise workloads. Migrating to a MariaDB relational database resolves all these limitations while preserving the OpenSpec contract.

## Goals

- **Replace file I/O**: Eliminate all reads/writes to `.openspec/*.json` by routing all persistence through a MariaDB database.
- **Normalized schema**: Design tables (`changes`, `tasks`, `specs`) with proper foreign key relationships and audit columns (`created_by`, `created_at`, `schema_version`).
- **DAO layer**: Introduce a data-access layer (repository pattern) that shields business logic from SQL; all queries use prepared statements.
- **Migration path**: Provide a one-shot migration script that reads existing JSON files and inserts them into MariaDB without data loss.
- **Connection pooling**: Configure a pool strategy suitable for multi-agent, asynchronous execution contexts.
- **Deliverables**: `schema.sql`, an architectural flow diagram, explicit dependency list, and a migration utility.

## Scope

**In Scope:**

- MariaDB schema design (`changes`, `tasks`, `specs`, `task_metadata` tables).
- DAO interface and reference implementation (using the runtime language's native MariaDB driver with prepared statements).
- `schema.sql` creation script with indexes and foreign key constraints.
- `migrate.js` / `migrate.py` one-shot migration utility that reads JSON files and upserts into MariaDB.
- Connection pool configuration and retry strategy.
- Architectural flow diagram showing `/opsx:apply` querying MariaDB.
- Dependency manifest (`package.json` / `requirements.txt` additions).

**Out of Scope:**

- Changes to the OpenSpec CLI public API or command surface.
- UI or client-side modifications.
- ORM frameworks (raw driver + prepared statements only, as mandated).
- Deployment automation or containerisation of MariaDB itself.

## High-Level Approach

The migration will be implemented in three phases:

1. **Schema**: Define `changes`, `tasks`, `specs`, and `task_metadata` tables in `schema.sql`. Columns that do not map cleanly to relational types (e.g., arbitrary extension metadata) will use MariaDB `JSON` columns.
2. **DAO Layer**: Create a `db/` module exposing repository classes (`ChangesRepository`, `TasksRepository`, `SpecsRepository`). Each method uses the driver's prepared-statement API. A connection pool (configurable size, default 5) is initialised once at process start and shared across all agents.
3. **Migration**: A standalone `scripts/migrate.js` script reads every JSON file in `.openspec/changes/`, validates schema version, and performs batched `INSERT … ON DUPLICATE KEY UPDATE` operations, ensuring idempotency (safe to run multiple times).

## Impact

- **Core engine**: All file I/O in `openspec/engine/` or equivalent modules is replaced by DAO calls.
- **CLI commands** (`/opsx:apply`, `openspec status`, etc.): Remain functionally identical; only the persistence adapter changes.
- **Infrastructure**: Requires a MariaDB 10.6+ instance accessible from the runtime environment. Connection parameters are read from environment variables (`MARIADB_HOST`, `MARIADB_USER`, `MARIADB_PASS`, `MARIADB_DB`).
- **Testing**: Existing test suites should pass unchanged after adapter swap; integration tests will require a seeded MariaDB instance.
