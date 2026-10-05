# 2026-09-26 ORM Completion — migrations, pagination/sorting, relation fetch, derived queries

**Status:** ✅ **All four waves implemented 2026-09-26** — Wave 1
(migrations) ratified by [AD-30](../decisions/2026-09-26_AD30_ORM_MIGRATIONS.md);
Wave 3 (relation fetch) ratified by
[AD-31](../decisions/2026-09-26_AD31_ORM_RELATION_FETCH.md) (owner-confirmed
decisions: explicit join-column metadata, explicit opt-in loading). Waves 2
and 4 landed without ADRs (contract additions only, decided in this plan).

**Scope:** The ORM rows of the Framework Gap Analysis
(`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`): the Tier-1 **migrations**
gap ("schema is _derived_ from entity metadata but cannot evolve an existing
database" — audit §5: _"Do not pass the 1.0 checkpoint without them"_,
originally audit M3), plus the §3 incomplete-ORM items: **pagination/sorting
API**, **relation fetch semantics / lazy loading**, and the thin
**`DerivedQueryRepository`** (equality filters only).
Builds on the existing five-contract ORM (`DataSource`, `EntityManager`,
`UnitOfWork`, `TransactionManager`, `Repository` — all complete in
`blue-orm-drizzle` since AD-07/M3 resolution).

**Working-session notes (as-built, Wave 1):**

- `DrizzleDataSource.init` DDL generation was **extracted verbatim** into
  `createTableStatements(entities)` and reused by `init` — zero behavior
  change (existing `DrizzleEntityManager` suite stays green), and baseline
  migrations get the same DDL from the same source of truth.
- The migrator runs each migration's `up()` **without an explicit
  transaction** and inserts the journal row standalone after `up` returns.
  As-designed, `up` + journal were wrapped in `DrizzleTransactionManager`;
  execution disproved it — **SQLite implicitly COMMITs an open transaction
  when DDL runs**, so the wrapper rolled back nothing and its COMMIT/ROLLBACK
  threw ("no transaction is active"). Corrected contract: per-statement
  atomicity for migration DDL, journal row only after a successful `up`
  (failed migrations leave no journal row and retry cleanly; partially
  applied DDL is the documented degradation — author idempotent DDL or
  restore from backup).
- Journal: `_blue_migrations (version INTEGER PRIMARY KEY, description TEXT
NOT NULL, applied_at TEXT NOT NULL)`; `migrate()` is idempotent; `status()`
  reports applied/pending over the given migration list.
- Versions are unique positive integers applied in ascending order; gaps in
  the applied set are allowed (a pending v2 applies after applied v1/v3).
  Duplicate versions fail loud before any SQL runs.

**Companion docs:**
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.1
(migrations row) + §3 (ORM row), [AD-07](../decisions/2026-09-05_AD07_ZOD_VALIDATION.md)
(entity metadata → Zod schema, the ORM stack's base),
[AD-30](../decisions/2026-09-26_AD30_ORM_MIGRATIONS.md) (Wave-1 decisions),

---

## 1. Problem

Gap analysis rows, current state:

> **Database migrations** (Tier 1) — "None — schema is _derived_ from entity
> metadata but cannot evolve an existing database. Last open ORM gap from
> `2026-09-05` audit (M3)." · sequenced: "Do not pass the 1.0 checkpoint
> without them."

> **ORM** (§3 incomplete) — "No pagination/sorting API, no migrations, no
> lazy loading / relation fetch semantics, `DerivedQueryRepository` thin."

The ORM stack's contracts are complete and both backends (in-memory,
Drizzle/LibSQL) implement them; the missing surface is the **data-evolution
and query-composition** layer on top.

## 2. Decisions (Wave 1 — ratified by AD-30)

- **D-1 — Journaled, versioned, forward-only runner.** `DrizzleMigrator`
  applies `Migration[]` (code-composed; no file scanning in v1) in ascending
  version order, recording each in `_blue_migrations`. Forward-only: no
  `down`/rollback execution in v1 — rollback is achieved by restoring a
  backup and re-applying (same as Drizzle Kit). `down` is omitted, not
  abstracted.
- **D-2 — No transaction around migration bodies; journal row lands
  atomically after `up`.** As-designed, `up()` + journal insert ran inside
  `DrizzleTransactionManager`; execution disproved the premise — SQLite
  implicitly COMMITs an open transaction when DDL runs, so the wrapper
  provided no rollback and broke COMMIT/ROLLBACK ("no transaction is
  active"). Corrected: migrations run in autocommit (per-statement atomicity
  — the industry norm for SQLite runners), and the journal `INSERT` executes
  ONLY after `up()` returns. A failed migration leaves no journal row and is
  retried; partial DDL from a failed migration is the documented
  degradation (author idempotent DDL / restore from backup).
- **D-3 — Baseline DDL comes from entity metadata.** `createTableStatements`
  (extracted from `DrizzleDataSource.init`) generates the initial schema;
  a baseline migration is `up: (ctx) => ctx.batch(createTableStatements([...entities]))`.
  One source of truth for the metadata→DDL mapping.
- **D-4 — Versions are unique positive integers; gaps allowed.** Input order
  is irrelevant (sorted before apply); duplicate versions and non-integers
  fail loud before any SQL. Applied set comes from the journal, so
  `migrate()` is idempotent across restarts.
- **D-5 — Auto-init and migrations coexist.** `DrizzleDataSource.init`
  (idempotent `CREATE TABLE IF NOT EXISTS`) remains the fresh-DB path;
  migrations are the evolution path. Apps adopting migrations on an existing
  database author a baseline migration as version 1; apps on fresh databases
  may skip `init` entirely and let the baseline create the schema.

## 3. Risks (Wave 1)

| Risk                                                         | Mitigation                                                                                                                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration fails midway → partial DDL                         | Journal row lands only after `up()` returns, so the version is retried; author idempotent DDL (`IF NOT EXISTS` style) or restore from backup — documented contract   |
| SQLite implicit-commit surprises (the D-2 empirical finding) | Contract documented in `Migration` JSDoc + this plan; the runner never opens a transaction around migration bodies                                                   |
| Two processes migrating concurrently                         | Single-connection design + journal `PRIMARY KEY` makes a duplicate insert fail loud; operator guidance: run one migrator at boot (auto-config wiring possible later) |
| Migration authored against stale metadata                    | Baseline generation shares `createTableStatements` with `init` — one mapping, no drift                                                                               |

## 4. Sequencing

### Wave 1 — Migrations ✅ (implemented 2026-09-26)

- `packages/blue-orm-drizzle/src/drizzle-migrator.ts` — `DrizzleMigrator`
  (`migrate`, `status`), `Migration`/`MigrationContext`/`MigrationStatus`.
- `createTableStatements(entities)` extracted into `drizzle-data-source.ts`.
- Specs `test/drizzle-migrator.spec.ts`: ascending order, idempotency,
  no-journal-on-failure + clean retry, duplicate rejection,
  metadata-baseline parity (persist round-trip on a DB built only by the
  migrator), and baseline + `ALTER TABLE` evolution.
- **Gate:** `pnpm test` + `pnpm build:lib` in `packages/blue-orm-drizzle`;
  dependent suites unaffected (additive exports only).

### Wave 2 — Pagination & sorting ✅ (implemented 2026-09-26)

- **Contracts** (in `@blue/orm`, `src/page.ts`): `SortOrder { property,
direction: 'asc' | 'desc' }` (direction defaults `asc`), `PageRequest {
page, size, sort? }` (1-based page, positive integer size), `Page<T> {
content, page, size, totalElements, totalPages }`. `validatePageRequest`
  rejects malformed requests and unknown sort properties (allowlist =
  entity column field names) before any SQL runs; `pageFromAll` sorts +
  slices for in-memory backends (stable per clause, ties keep input order).
- `Repository.findPage(request)` on the in-memory contract
  (`AbstractRepository`, metadata allowlist); `DrizzleRepository.findPage`
  delegates to a new `DrizzleEntityManager.findPage` that emits
  allowlisted+quoted `ORDER BY`, `LIMIT`, `OFFSET`, and `COUNT(*) AS total`.
  No-sort paging returns insertion order (SQLite rowid order).
- Specs: `blue-orm/test/page.spec.ts` (9) + `blue-orm-drizzle/test/
drizzle-repository.spec.ts` (5): page math, beyond-last pages (empty
  content, stable totals), asc/desc, multi-key clause order, allowlist
  rejection, direction validation.
- **Gate:** `pnpm test` (blue-orm 96/96, blue-orm-drizzle 40/40, incl. Wave-1
  suites), both `tsc -b` builds green.

### Wave 3 — Relation fetch semantics ✅ (implemented 2026-09-26)

Ratified by [AD-31](../decisions/2026-09-26_AD31_ORM_RELATION_FETCH.md);
owner-confirmed 2026-09-26 (explicit metadata + explicit opt-in).

- `RelationDefinition` gains `joinColumn` (owning side) /
  `inverseJoinColumn` (inverse side); all four relation decorators accept a
  second options argument. **As-built refinement:** join columns name
  existing `@column`s (e.g. `@manyToOne(() => User, { joinColumn:
'authorId' })`) — no FK columns are generated, DDL is untouched, and FK
  nullability is the column's own (`@column({ nullable: true })`).
- Fetch is explicit opt-in on both backends: `findById(id, { relations:
[...] })` / `findAll({ relations: [...] })` eager; `loadRelation(entity,
'field')` lazy (assigns + returns). Managers expose `fetchRelation`
  (owning side: find by FK; inverse side: equality scan/WHERE). Missing or
  ambiguous metadata fails loud; many-to-many fetch rejected in v1
  (join tables out of scope).
- Field fix: `persist` binds unset optional columns as SQL `NULL`, and the
  upsert fallback rethrows the original insert error when the entity has no
  primary key (previously masked).
- Specs: `blue-orm/test/relations.spec.ts` (8) + `blue-orm-drizzle/test/
drizzle-relations.spec.ts` (5): eager both directions, lazy, unset-FK /
  empty-inverse values, three fail-loud paths per backend.
- **Gate:** `pnpm test` (blue-orm 113/113, blue-orm-drizzle 49/49, incl.
  Waves 1–2 + 4 suites), both `tsc -b` builds green.

### Wave 4 — DerivedQueryRepository enrichment ✅ (implemented 2026-09-26)

- `parseDerivedQuery` reworked from the 1–2 property regexes to a general
  grammar: `findBy<Prop>And<Prop>…` chains (any length),
  `OrderBy<Prop>[Asc|Desc]` suffix (single clause, default `asc`), and
  `First`/`Top<N>` limits. A declared property that itself contains a
  capitalized `And` still matches as one property (legacy fallback
  preserved). Return shape is now `DerivedQuery { filters, orderBy?,
limit? }` — a **breaking change** to the public `parseDerivedQuery` return
  type (pre-1.0, flag for the API-freeze review).
- `InMemoryDerivedQueryRepository.derive` applies filters, then the shared
  `sortComparator` (now exported from `page.ts`), then the limit.
- New `DrizzleDerivedQueryRepository<T, ID> extends DrizzleRepository`:
  `derive(methodName, args)` maps the parsed shape to parameterized
  `WHERE … = ?` + allowlisted `ORDER BY` + `LIMIT` via a new
  `DrizzleEntityManager.findAllWhere` building block; sort properties are
  validated against declared columns before any SQL runs.
- Specs: `blue-orm/test/derived-query.spec.ts` (9) + `blue-orm-drizzle/
test/drizzle-derived-query-repository.spec.ts` (4): grammar cases,
  ordering/direction, limits, chains, `And`-fallback, unsupported-name
  rejection.
- **Gate:** `pnpm test` (blue-orm 105/105, blue-orm-drizzle 44/44, incl.
  Waves 1–2 suites), both `tsc -b` builds green.

## 5. Verification

Per wave: changed-package `vitest run`, changed-package `tsc -b`, dependent
packages re-run where consumers exist, `graft build`. Final: `pnpm build`
repo gate if any cross-package surface changed.
