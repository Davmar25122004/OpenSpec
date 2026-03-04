## Context

The current workforce management system lacks isolation between different companies, has an outdated UI, and permits conflicting vacation and time entries. To support an enterprise-grade multi-tenant environment, we need to enforce strict data isolation, improve the interface with modern frameworks (Bootstrap 5), and implement robust backend-side collision validation logic. An entry point for company selection must be created, tightly coupling user sessions and data to the selected company.

## Goals / Non-Goals

**Goals:**

- Multi-tenant architecture with strict data isolation per company.
- Modernized frontend using Bootstrap 5 and customized CSS micro-interactions.
- Robust business rules in the Node.js backend to prevent vacation and working hours overlaps.
- Mandatory JSDoc documentation for backend quality.

**Non-Goals:**

- Migrating away from `db.json` persistence to a relational database system.
- Developing complete CI/CD deployment pipelines.

## Decisions

- **Framework Stack**: Bootstrap 5 with CSS Transitions + vanilla JS and jQuery Datepicker. Rationale: The prompt explicitly mandates Bootstrap 5 for the layout and jQuery for the Datepicker. The frontend will be primarily standard HTML/JS.
- **Data Model**: Extend the `db.json` collections (`users`, `vacations`, `hours`) with a mandatory `companyId` attribute. Rationale: The simplest way to achieve multi-tenancy while preserving the `db.json` requirement.
- **Collision Validation Location**: All collision checks will reside in the Node.js backend. Rationale: Relying on client-side validation is a security risk. The backend must enforce the single source of truth for shift and vacation collisions.

## Risks / Trade-offs

- **[Risk] db.json concurrent writing limitations** → **Mitigation**: While `db.json` isn't designed for high concurrency, we will modularize the collision checking logic into clean functions so swapping out `db.json` for a real database in the future is easy.
- **[Risk] jQuery Datepicker clashing with Bootstrap styling** → **Mitigation**: We will apply custom CSS overrides or a Bootstrap-compatible theme to the jQuery UI Datepicker so it matches the modern aesthetic.
