# CLAUDE.md Template

<!-- INSTRUCTIONS FOR FILLING AGENT
This file is the living project memory for a Forge-managed codebase.
- Populate it during Phase 0 (Bootstrap) with initial project context.
- Update it after every spike (Phase 3) and compound review (Phase 5).
- Every agent reads this file before any planning session.
- Keep entries dated. Prune entries older than 90 days that are no longer relevant.
- Never remove Anti-Patterns without team consensus — they exist because someone was burned.
-->

---

# Project: <name>

<!-- FILL: Replace <name> with the project name. One line only. -->

---

## Architecture Decisions

<!-- KEY ARCHITECTURAL CHOICES made during planning.
Format: [YYYY-MM-DD] Decision: <what was decided>. Rationale: <why>.
Example:
- [2026-01-15] Decision: Use event sourcing for the order domain. Rationale: Audit trail is a hard requirement; event sourcing provides it natively without a separate audit log.
- [2026-02-01] Decision: GraphQL over REST for the internal API. Rationale: Frontend needs flexible field selection; multiple clients with different data shapes.

Add new entries as they are made. Do not delete old ones unless the decision is explicitly reversed (in which case, add a reversal entry with date and reason).
-->

---

## Conventions

<!-- CODING CONVENTIONS discovered or established during development.
Format: [YYYY-MM-DD] <convention statement>. Source: <spike/<bead-id> or compound-review>.
Example:
- [2026-01-20] Always use the `Result<T, E>` type for functions that can fail — never throw exceptions in business logic. Source: spike/b002-error-handling.
- [2026-02-10] Database migrations must be idempotent. Use `CREATE TABLE IF NOT EXISTS`. Source: compound-review-2026-02-10.

Include conventions for: naming, error handling, testing patterns, file organization, API design, state management, and any project-specific rules.
-->

---

## Anti-Patterns

<!-- APPROACHES THAT WERE TRIED AND FAILED — do NOT repeat these.
Format: [YYYY-MM-DD] Do NOT <action> because <consequence>. Discovered via: <context>.
Example:
- [2026-01-25] Do NOT use the `users.findAll()` method without pagination — it loads the entire table into memory and causes OOM on production data. Discovered via: P0 finding in compound-review-2026-01-25.
- [2026-02-05] Do NOT use optimistic locking on the `order_items` table — high write concurrency causes excessive retry storms. Discovered via: spike/b007-concurrency.

This section is append-only. Anti-patterns are never removed without explicit team decision.
Mark reversed anti-patterns with: [YYYY-MM-DD] REVERSED: <original entry> — Reversal reason: <why>.
-->

---

## Validated Approaches

<!-- APPROACHES VALIDATED BY SPIKES — USE these when applicable.
Format: [YYYY-MM-DD] For <problem domain>: use <approach>. Validated in: spike/<bead-id>.
Example:
- [2026-01-22] For background job processing: use BullMQ with Redis. Concurrency of 5 workers is safe without queue starvation. Validated in: spike/b003-background-jobs.
- [2026-02-08] For PDF generation: use Puppeteer in headless mode with a 30s timeout. Do NOT use the wkhtmltopdf approach (see Anti-Patterns). Validated in: spike/b012-pdf-gen.

Each entry should reference its spike report for full context.
When the same problem domain is re-addressed, add a new dated entry rather than modifying the old one.
-->

---

## Tech Stack

<!-- PINNED VERSIONS AND KEY DEPENDENCIES.
List the exact versions used in production. Update when versions are upgraded.
Include: runtime, framework, database, key libraries, build tools, deployment platform.
Example:

Runtime:
- Node.js 22.x (LTS)
- TypeScript 5.4

Framework:
- Express 4.19

Database:
- PostgreSQL 16.2
- Redis 7.2

Key Libraries:
- Drizzle ORM 0.30 (type-safe SQL queries)
- Zod 3.22 (schema validation — used at all API boundaries)
- BullMQ 5.4 (job queues)

Build/Deploy:
- pnpm 9.x (package manager)
- Docker 25 + Compose 2.24
- GitHub Actions for CI

Document why non-obvious version choices were made (e.g., "pinned to X.Y because X.Z breaks <thing>").
-->
