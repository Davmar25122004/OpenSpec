CREATE DATABASE IF NOT EXISTS openspec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE openspec;

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
) ENGINE=InnoDB;

-- Create least privilege user for application
CREATE USER IF NOT EXISTS 'openspec_app'@'%' IDENTIFIED BY 'openspec_pass';
GRANT SELECT, INSERT, UPDATE, DELETE ON openspec.* TO 'openspec_app'@'%';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS users (
    username       VARCHAR(128)  NOT NULL,
    hash           VARCHAR(255)  NOT NULL,
    company_id     VARCHAR(128)  NOT NULL,
    role           VARCHAR(32)   NOT NULL DEFAULT 'admin',
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workers (
    id             VARCHAR(128)  NOT NULL,
    name           VARCHAR(255)  NOT NULL,
    company_id     VARCHAR(128)  NOT NULL,
    department     VARCHAR(255)  NULL,
    email          VARCHAR(255)  NULL,
    phone          VARCHAR(64)   NULL,
    password_hash  VARCHAR(255)  NULL,
    status         VARCHAR(32)   NOT NULL DEFAULT 'activo',
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vacation_requests (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    user_id        VARCHAR(128)  NOT NULL,
    start_date     DATE          NOT NULL,
    end_date       DATE          NOT NULL,
    status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY fk_vacation_worker (user_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB;

