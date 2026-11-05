# AD-78: Migration generation + run-on-boot — `ndigo db generate`, committed schema snapshot, `migrations.runOnBoot`

**Date:** 2026-10-08
**Status:** Accepted, executed 2026-10-08 (see the
[companion plan](../plans/2026-10-08_MIGRATION_GENERATION.md) and
[guide 27](../guides/27-orm-and-migrations.md)) — GAP-7 of
`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6, Wave-6 DX track
**Deciders:** Framework owner

---

## Context

The 2026-10-07 review lists GAP-7: **migration generation + run-on-boot** —
severity medium, status **partial** ("forward-only journaled runner, baseline
DDL only"); recommended shape "`ndigo db generate` from entity metadata;
`migrations.runOnBoot`". Wave 6 is ADR-gated ("GAP-7..15 stay ADR-gated");
this record is the gate.

What the repository already provides (verified at HEAD, 2026-10-08):

- **The runner is complete; generation is not.** AD-30's `DrizzleMigrator`
  (`packages/ndigo-orm-drizzle/src/drizzle-migrator.ts:82-173`) applies a
  **code-composed** `Migration[]` — `{ version, description, up(ctx) }` — in
  ascending order, journaled in `_ndigo_migrations`, forward-only,
  idempotent, with `status()` readback. AD-30 D-1 explicitly anticipated
  external authoring: _"Drizzle Kit may author the SQL; the runner
  executes"_ — GAP-7's generator is that author.
- **Baseline DDL exists as a helper.** `createTableStatements(entities)`
  (`drizzle-data-source.ts:86-132`) is the shared metadata → DDL mapping
  (types, PK/generated + autoincrement, nullability), reused by
  `DrizzleDataSource.init` (fresh-DB `IF NOT EXISTS` auto-init). It emits
  **only `CREATE TABLE`** — no evolve path, no artifact, no diff.
- **The fidelity ceiling is the metadata.** `ColumnDefinition` carries
  `fieldName, columnName, type?, nullable?, schema?` only —
  no defaults, `UNIQUE`, indexes, CHECKs; relation metadata (AD-31) emits
  no DDL; the storage mapping is SQLite-only (`_column-types.ts`).
- **The CLI seam is sized for this.** AD-75's `ndigo db migrate`
  (`packages/ndigo-cli/src/commands/db/migrate.ts`) runs the _app's own_
  `scripts.db:migrate` under the one-shot lifecycle
  (`app-scripts.ts: runAppOnce`) — its docstring names GAP-7's `generate`
  as the CLI-owned extension. AD-75 D-2 promised `db:*` = `new`, `migrate`;
  only `migrate` shipped — the AD-72..75 follow-up review records `db:new` /
  migration generation as the GAP-7 remainder.
- **No consumer exists.** No app declares `db:migrate` or constructs a
  migrator. `apps/04-ndigo-api` — the only Drizzle app — lazy-inits a
  `:memory:` data source (`drizzle-note-controller.ts:28-35`) and relies on
  `init`'s `IF NOT EXISTS`; there is no ORM auto-configuration bean in the
  platform (the assembly is app-owned by convention).

## Evidence

Repo-grounded exploration (2026-10-08); peer survey from the 2026-10-06/07
gap analyses (Drizzle Kit, Flyway/Liquibase, AdonisJS Lucid — sources in
`agent://IndustryGaps-2`):

- Peer generation tools are **file-first** (Drizzle Kit authors SQL
  migrations; Flyway/Liquibase run versioned SQL files) and evolve toward a
  **checkable schema artifact** (drizzle-kit's `schema.ts` snapshot +
  diff). Flyway/Liquibase auto-config is the `runOnBoot` precedent.
- The repository already enforces "committed + regen-identical" for
  generated artifacts (doc freshness byte-identical check; `check-manifests`)
  — a generation path without a gate would invite the AD-70 schema-drift
  class (HI-4/HI-5: schema/guide teaching forms no reader consumes).
- `MigrationContext.batch(statements: string[])` takes arrays — migration
  **files need no SQL statement parsing**; the existing runner contract
  consumes them as-is.

## Decision

### D-1 — Versioned migration files supersede single-compose for the generated path

Generated migrations are **one file per migration**:
`db/migrations/<NNNN>-<slug>.ts`, each a module exporting a `Migration`
(exact AD-30 contract). A new `loadMigrations(dir): Promise<Migration[]>`
in `@ndigo/orm-drizzle` skims the directory, imports the modules, and orders
by the **exported** version through the unchanged `orderedMigrations`
(filenames are cosmetic; renames break nothing). Code-composed `Migration[]`
remains fully supported — both forms coexist, versions unique across both.
AD-30 D-1's "no file scanning in v1" is superseded **for this generated path
only**; the runner internals are untouched (zero AD-30 churn). A
`db:new`-style scaffold rather than one `migrations.ts` compose file:
per-version files are independent review units and don't collide under
concurrent edits.

### D-2 — Generate is a snapshot diff over a committed metadata projection

`db/schema.json` is a **committed, normalized projection** of the entity
metadata under the D-3 predicate (tables, columns, storage types,
PK/generated, nullability; format carries `predicate: 1`). `ndigo db
generate` → read entities → project → **diff against the committed
snapshot** → (a) write the next-version migration file emitting the delta
(first run: a baseline of the `createTableStatements` result), (b) rewrite
the snapshot. No live database connection is needed for generation —
deterministic, reviewable in git, verifiable in CI. Live-schema
introspection (`--from-db`, to synthesize an adoption snapshot for an
existing database) is v1.1.

### D-3 — The fidelity ceiling is the AD-30 predicate; growth bumps the format

The snapshot and the generator model exactly what `createTableStatements`
models today: column name/type/nullability/PK. Defaults, `UNIQUE`, indexes,
CHECKs, and FK DDL from relations are **not modeled in v1** — they remain
hand-written migration SQL, same as today. No silent drift: any future
metadata growth that changes the projection (e.g. `@column({ unique })`)
must bump `predicate`, so committed snapshots fail the freshness check
instead of silently diverging. The projector is also the dialect seam if a
non-SQLite backend ever lands.

### D-4 — `migrations.runOnBoot` is an explicit, app-owned opt-in

New `@ndigo/orm-drizzle` export `migrateOnBoot({ dataSource, dir })`:
loads pending migrations and runs them through the plain
`DrizzleMigrator.migrate`, **throwing on failure (fail-closed boot)**.
The app binds `migrations.{runOnBoot, dir}` through its own
`@configurationProperties` and calls the helper in its start path before
serving — the same ownership split AD-75's CLI enforces ("the migrator
assembly belongs to the app"): no ORM auto-configuration bean in v1
(AD-64 platform separation; no data-source bean exists to hang one on).
Single-flight stays the operator's contract (AD-30 risk: concurrent
migrators fail loud on the journal PK).

### D-5 — CLI surface: `db:new`, `db:generate`, `db:status` beside `db:migrate`

| Command               | Owner                                                           | Seam                                                                   |
| :-------------------- | :-------------------------------------------------------------- | :--------------------------------------------------------------------- |
| `ndigo db new <slug>` | CLI-owned (pure file scaffold, no app code)                     | probes `db/migrations` for the next version; writes `<NNNN>-<slug>.ts` |
| `ndigo db generate`   | app script `scripts.db:generate` (entities + dir are the app's) | existing `runAppOnce` one-shot lifecycle                               |
| `ndigo db status`     | app script `scripts.db:status`                                  | prints `DrizzleMigrator.status()` rows                                 |
| `ndigo db migrate`    | unchanged (AD-75)                                               | `scripts.db:migrate`                                                   |

This closes the AD-75 D-2 surface gap (`db:new`) and the AD-72..75
follow-up row ("`db:new` / migration generation — GAP-7 remainder").

### D-6 — Committed artifacts + a freshness gate, or no generation

Generated migration files and `db/schema.json` are committed. A new root
gate (extend `scripts/check-manifests.mjs` or a sibling script) regenerates
the snapshot and fails when it is not byte-identical — the mechanical
recurrence invariant against the HI-4/HI-5 drift class each review keeps
re-finding.

## Alternatives considered

- **Drizzle Kit as the generator**: peer-grade snapshot/diff engine, but an
  external tool + new dependency whose model centers on its own schema file,
  while ndigo's source of truth is decorator metadata — and there is no
  dialect target beyond SQLite to justify the codegen seam. Rejected for
  v1; retained as the fallback trigger if multi-dialect arrives (D-3's
  projector is the swap point).
- **Live-DB diff as the primary generate path** (PRAGMA introspection):
  requires a reachable database in dev/CI and still cannot express
  unmodeled constraints. Deferred — `--from-db` snapshot seed, v1.1.
- **Single `db/migrations.ts` compose file**: no scanning at all, but merge
  collisions and no per-version review unit. Rejected for v1; the loader
  accepts explicit arrays, so teams may still single-file.
- **Status quo** (helper + docs): GAP-7 exists precisely because DDL drifts
  into hand-writing with no artifact or gate; rejected.

## Consequences

- For the modeled predicate, decorator entities become the single schema
  source: `ndigo db generate` emits what `createTableStatements` would have
  created, versioned and reviewable; hand-written SQL migrations remain
  first-class in the same directory (mixed mode).
- AD-30's runner contract, journal, and semantics are untouched; the loader
  is additive.
- Costs: a committed snapshot needing maintenance (the gate makes that
  mechanical); the documented fidelity ceiling (constraints stay authored
  by hand until metadata grows — predicate bump is the explicit decision
  point).
- `apps/04-ndigo-api` becomes the reference consumer: `db:migrate` /
  `db:generate` / `db:status` scripts, a checked-in baseline migration and
  snapshot, and `migrateOnBoot` in the start path.

## Execution notes (2026-10-08)

Substrate defects the reference cutover surfaced, fixed in the same pass
(details in the companion plan §7):

- The `db:*` nested-command space form (`ndigo db migrate`) never resolved —
  oclif `topicSeparator` was `:`. Now a space; colon form kept.
- One-shot CLI commands forwarded only `PATH` to the app script, silently
  dropping every config knob (`NDIGO_DB_URL`, OTel endpoints, secret keys).
  The invoking environment now flows through.
- The reference app's file-backed store needed its parent directory created
  (`ensureDbDir`) — libSQL fails CANTOPEN otherwise.
- Dotted env names cannot cross package-manager runners (`pnpm` drops
  non-identifier variables), so the config FILE is the documented
  dotted-key carrier — `apps/04-ndigo-api/config/application.json` is the
  first real `config/*` fixture (BOOT-5) with an app-local reader (a
  platform default Node reader remains a follow-up).

## Risks

- Snapshot drift from metadata edits without regeneration → D-6 gate fails;
  mechanical fix.
- Version collisions on concurrent `db:new`/`db:generate` → probe-then-write
  with a loud failure; one generator at a time (documented, matching the
  single-runner journal contract).
- Migration-file renames break nothing (version comes from the export);
  `orderedMigrations` keeps apply order deterministic.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-7 row,
  §8 Wave-6 DX track ("GAP-6/7 (CLI, migration generate)"), §10 deferred
  table.
- AD-30 (runner + D-3 predicate), AD-75 D-2 (the `db:*` surface),
  AD-72..75 follow-up review (the `db:new` gap row), AD-31 (relation
  metadata — no DDL today), AD-64 (platform separation — no auto-bean).
- Companion plan: `docs/plans/2026-10-08_MIGRATION_GENERATION.md` (guide 27
  ships at execution).
