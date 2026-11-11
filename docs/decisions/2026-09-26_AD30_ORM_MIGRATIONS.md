# AD-30: ORM — migrations and relation fetch (consolidated)

**Date:** 2026-09-26
**Status:** Accepted — decisions D-1..D-5 ratified; Wave 1 of the ORM
completion plan landed (see [plan](../plans/2026-09-26_ORM_COMPLETION.md)):
`DrizzleMigrator` + `createTableStatements` extraction + migration specs.

## Background

The Framework Gap Analysis (§2.1, Tier 1) records database migrations as the
last open ORM gap: the ORM derives schema from entity metadata
(`DrizzleDataSource.init` issues idempotent `CREATE TABLE IF NOT EXISTS`) but
cannot **evolve an existing database** — no way to add a column, reindex, or
backfill behind a versioned, journaled runner. The audit's sequencing
explicitly flags it: "Do not pass the 1.0 checkpoint without them."

The five ORM contracts (`DataSource`, `EntityManager`, `UnitOfWork`,
`TransactionManager`, `Repository`) are complete in `ndigo-orm-drizzle` (M3
resolved 2026-09-05); the DDL mapping from entity metadata is already owned
by `DrizzleDataSource.init`; raw SQL execution (`client.execute`/
`client.batch`) and `DrizzleTransactionManager` (BEGIN/COMMIT/ROLLBACK) are
proven seams. This ADR ratifies the shape of the runner that composes them.

## Decisions

### D-1 — Journaled, versioned, forward-only migration runner

`DrizzleMigrator` (package `@ndigo/orm-drizzle`) applies a code-composed
`Migration[]` list — `{ version: integer, description, up: (ctx) => ... }` —
in ascending version order, recording each application in a journal table
`_ndigo_migrations (version INTEGER PRIMARY KEY, description TEXT NOT NULL,
applied_at TEXT NOT NULL)`. The runner is **forward-only**: no `down()` and
no rollback execution in v1 — downgrades happen by restoring a backup and
re-applying, the same model Drizzle Kit/raw SQL rollouts use. `down` is
omitted (YAGNI), not abstracted. No file scanning in v1: the app composes
its migration list explicitly (Drizzle Kit may author the SQL; the runner
executes).

### D-2 — No transaction around migration bodies; journal insert is atomic and lands only after `up`

**As-built deviation (execution-discovered).** The plan originally wrapped
each `up()` + journal insert in `DrizzleTransactionManager`; the first spec
run disproved the premise: **SQLite implicitly COMMITs an open transaction
when a DDL statement runs**, so the wrapper rolled nothing back and its
COMMIT/ROLLBACK threw ("cannot rollback - no transaction is active"). The
runner therefore never opens a transaction around migration bodies
(statements are atomic individually — the industry norm for SQLite
runners) and the journal `INSERT` executes only after `up()` returns.
A failed migration leaves no journal row and retries cleanly; partially
applied DDL from a mid-migration failure is the documented degradation —
migrations should be authored idempotent (`IF NOT EXISTS` style) or the
database restored from backup.

**Update (2026-10-06) — the recorded reason was wrong; the decision stands.**
Re-verification with `@libsql/client` 0.17.4 showed SQLite does support
transactional DDL: a `CREATE TABLE` between `BEGIN` and `ROLLBACK`
disappears cleanly, so "SQLite implicitly COMMITs an open transaction when
DDL runs" is not the constraint. The real constraint is
`MigrationContext.batch()`: libSQL executes `client.batch()` in its own
implicit transaction, so a body that batches while an explicit transaction
is open fails with "cannot start a transaction within a transaction", and
that failure rolls the outer transaction back (the later `ROLLBACK` then
reports "cannot rollback - no transaction is active" — the as-built
observation that motivated this decision). Migration bodies may mix
`execute` (per-statement atomicity) and `batch` (atomic as a group), so no
explicit transaction can wrap `up()`; the journal insert still executes
only after `up()` returns.

### D-3 — Baseline DDL is generated from entity metadata

The DDL mapping in `DrizzleDataSource.init` is extracted verbatim into
`createTableStatements(entities): string[]` and reused by `init` (zero
behavior change). A baseline migration is authored as
`up: (ctx) => ctx.batch(createTableStatements([...entities]))` — one source
of truth for metadata → DDL, so a migration can never drift from what
`init` would have created. `DrizzleDataSource.init` remains the fresh-DB
auto-init path; `CREATE TABLE IF NOT EXISTS` makes the two coexist safely.

### D-4 — Versions are unique positive integers; gaps allowed

Migrations sort by version regardless of input order; the applied set is
read from the journal, so `migrate()` is idempotent across restarts and a
pending migration with a version lower than the highest applied one still
applies (gap fill). Duplicate versions, non-integers, and non-positive
versions fail loud before any SQL executes.

### D-5 — `migrate()` applies all pending; `status()` reports

`migrate()` takes no target version in v1 (forward-only, apply-all); the
journal readback is exposed as `status(migrations): MigrationStatus[]`
(`applied`/`pending` + `appliedAt`) for boot logs and operator tooling.

## Risks

- Migration failure midway leaves partial DDL (SQLite per-statement
  atomicity; see D-2) → documented contract: author idempotent DDL or
  restore from backup; the journal never records the failed version.
- Concurrent migrators: a second runner's duplicate journal insert fails
  loud on the PRIMARY KEY; operator guidance is one runner at boot.
- Baseline drift: impossible in the generated path (D-3); hand-written
  migrations are app-authored SQL, reviewed like any schema change.

## Verification

Wave-1 gates executed 2026-09-26: `vitest run` (35 tests incl. 9 new
migration specs) and `tsc -b` green in `packages/ndigo-orm-drizzle`; `graft
build` refreshed. Waves 2–4 (pagination/sorting, relation fetch, derived
query enrichment) follow the plan, each with its own decision/ADR if the
shape changes.

## Consolidated decisions

This ADR consolidates AD-30 and AD-31 (ORM migrations and relation fetch). Archived record: [AD-31](archive/2026-09-26_AD31_ORM_RELATION_FETCH.md).
