## Context

OpenSpec currently stores its state (changes, tasks, specs) in local JSON files under `.openspec/changes/`. While sufficient for single-agent local development, this approach prevents multi-agent concurrency (no locking semantics), lacks query power (no filtering without full file reads), and provides no referential integrity. The migration to MariaDB introduces a proper relational persistence tier while keeping the CLI surface unchanged.

## Goals / Non-Goals

**Goals:**

- Relational schema for `changes`, `tasks`, `specs`, and `task_metadata` with foreign keys and audit columns.
- DAO / Repository layer as the sole access point to the database.
- Prepared statements everywhere — no string interpolation in SQL.
- Connection pooling for multi-agent, asynchronous runtimes.
- Idempotent `migrate.js` script to seed MariaDB from existing JSON files.
- `schema.sql` deliverable ready for `mariadb -u root < schema.sql`.

**Non-Goals:**

- ORM adoption (Sequelize, Prisma, SQLAlchemy, etc.).
- Changes to the CLI command surface or plugin API.
- MariaDB deployment / provisioning automation.

## Decisions

### Schema Design

```sql
-- schema.sql

CREATE DATABASE IF NOT EXISTS openspec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE openspec;

-- ──────────────────────────────────────────────────────────────────────────────
-- changes: one row per OpenSpec change
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS changes (
    id             VARCHAR(128)  NOT NULL,
    name           VARCHAR(255)  NOT NULL,
    schema_name    VARCHAR(64)   NOT NULL DEFAULT 'spec-driven',
    schema_version VARCHAR(16)   NOT NULL DEFAULT '1.0',
    status         ENUM('open','applying','done','archived') NOT NULL DEFAULT 'open',
    created_by     VARCHAR(128)  NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    meta           JSON          NULL COMMENT 'Arbitrary extension metadata',
    PRIMARY KEY (id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────────────────────
-- tasks: implementation steps belonging to a change
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    change_id      VARCHAR(128)  NOT NULL,
    title          VARCHAR(512)  NOT NULL,
    description    TEXT          NULL,
    done           BOOLEAN       NOT NULL DEFAULT FALSE,
    skipped        BOOLEAN       NOT NULL DEFAULT FALSE,
    order_index    SMALLINT      NOT NULL DEFAULT 0,
    started_at     DATETIME      NULL,
    finished_at    DATETIME      NULL,
    executor       VARCHAR(128)  NULL COMMENT 'Agent or user that executed the task',
    meta           JSON          NULL,
    PRIMARY KEY (id),
    FOREIGN KEY fk_task_change (change_id) REFERENCES changes(id) ON DELETE CASCADE,
    INDEX idx_change_done (change_id, done)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────────────────────
-- specs: named specification documents linked to a change
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS specs (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    change_id      VARCHAR(128)  NOT NULL,
    spec_key       VARCHAR(128)  NOT NULL COMMENT 'e.g. authentication, ui-ux',
    content        LONGTEXT      NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_change_spec (change_id, spec_key),
    FOREIGN KEY fk_spec_change (change_id) REFERENCES changes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────────────────────
-- artifacts: tracks per-artifact build status (proposal, design, tasks …)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artifacts (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    change_id      VARCHAR(128)  NOT NULL,
    artifact_id    VARCHAR(64)   NOT NULL COMMENT 'e.g. proposal, design, tasks',
    status         ENUM('pending','done') NOT NULL DEFAULT 'pending',
    output_path    VARCHAR(512)  NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_change_artifact (change_id, artifact_id),
    FOREIGN KEY fk_artifact_change (change_id) REFERENCES changes(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**Rationale for JSON columns**: Fields like `meta` in `changes` and `tasks` store arbitrary extension data that varies per schema version without requiring schema migrations for each new attribute.

### DAO / Repository Layer

```
db/
├── pool.js          ← connection pool singleton (mariadb npm driver)
├── ChangesRepository.js
├── TasksRepository.js
├── SpecsRepository.js
└── ArtifactsRepository.js
```

Each repository exposes async CRUD methods using prepared statements:

```js
// Example — TasksRepository.js (Node.js / mariadb driver)
const pool = require("./pool");

async function getTasksByChange(changeId) {
  const conn = await pool.getConnection();
  try {
    return await conn.query(
      "SELECT * FROM tasks WHERE change_id = ? ORDER BY order_index ASC",
      [changeId], // ← prepared statement binding
    );
  } finally {
    conn.release();
  }
}

async function markTaskDone(taskId, executor) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      "UPDATE tasks SET done = TRUE, finished_at = NOW(), executor = ? WHERE id = ?",
      [executor, taskId],
    );
  } finally {
    conn.release();
  }
}
```

### Connection Pooling

```js
// db/pool.js
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST || "localhost",
  port: Number(process.env.MARIADB_PORT) || 3306,
  user: process.env.MARIADB_USER || "openspec",
  password: process.env.MARIADB_PASS,
  database: process.env.MARIADB_DB || "openspec",
  connectionLimit: Number(process.env.MARIADB_POOL_SIZE) || 5,
  acquireTimeout: 10_000, // ms — fail fast if pool exhausted
  idleTimeout: 60_000,
  connectTimeout: 5_000,
});

module.exports = pool;
```

### `/opsx:apply` Flow with MariaDB

```
User runs: /opsx:apply --change "my-feature"
        │
        ▼
┌───────────────────────┐
│  CLI: parse args      │
│  change_id = "my-feat"│
└──────────┬────────────┘
           │
           ▼
┌───────────────────────────────────────────┐
│  ChangesRepository.findById(change_id)    │
│  → SELECT * FROM changes WHERE id = ?    │
│  (prepared statement, pool connection)    │
└──────────┬────────────────────────────────┘
           │ change record
           ▼
┌──────────────────────────────────────────────────────┐
│  TasksRepository.getPendingTasks(change_id)          │
│  → SELECT * FROM tasks                               │
│    WHERE change_id = ? AND done = FALSE              │
│    ORDER BY order_index ASC                          │
└──────────┬───────────────────────────────────────────┘
           │ list of tasks
           ▼
┌───────────────────────────────┐
│  For each task (in order):    │
│  1. Display task to agent/user│
│  2. Execute task              │
│  3. TasksRepository           │
│     .markTaskDone(id, agent)  │
│     → UPDATE tasks SET        │
│       done=TRUE,              │
│       finished_at=NOW(),      │
│       executor=?              │
│       WHERE id = ?            │
└──────────┬────────────────────┘
           │ all tasks done
           ▼
┌──────────────────────────────────────────────────┐
│  ChangesRepository.updateStatus(change_id,'done')│
│  → UPDATE changes SET status='done' WHERE id=?   │
└──────────────────────────────────────────────────┘
           │
           ▼
        CLI prints: "✔ Change applied"
```

### Migration Strategy (JSON → MariaDB)

`scripts/migrate.js` — idempotent, safe to run repeatedly:

1. Scan all directories under `.openspec/changes/` (and `archive/`).
2. For each change folder, read `.openspec.yaml` (metadata), `proposal.md`, `design.md`, `tasks.md`, and any `specs/**/*.md`.
3. Derive `change_id` from folder name + date prefix.
4. Execute `INSERT INTO changes … ON DUPLICATE KEY UPDATE …` — guarantees idempotency.
5. Parse `tasks.md` line-by-line (checkbox pattern `- [x]` / `- [ ]`) and upsert into `tasks`.
6. Upsert specs and artifacts rows.
7. Log progress per change; report totals on exit.

```
Dependencies (Node.js runtime):
  mariadb@^3          ← official MariaDB connector (prepared statements, pool)
  js-yaml@^4          ← parse .openspec.yaml files
  glob@^10            ← file discovery
  dotenv@^16          ← load MARIADB_* env vars from .env
```

## Risks / Trade-offs

| Risk                                                   | Likelihood | Mitigation                                                                                                           |
| ------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| MariaDB unavailable at agent startup                   | Medium     | Pool `acquireTimeout` throws immediately; CLI shows actionable error with env var hints                              |
| JSON → relational data loss (nested/unknown keys)      | Low        | `meta JSON` column in every table absorbs unrecognised keys                                                          |
| Concurrent `UPDATE tasks` race condition               | Low        | `WHERE id = ? AND done = FALSE` predicate makes updates idempotent; MariaDB row-level locking prevents double-writes |
| Schema version mismatch after future OpenSpec upgrades | Low        | `schema_version` column in `changes` enables conditional migration paths                                             |
