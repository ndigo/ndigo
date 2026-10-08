# 2026-10-08 Migration generation + run-on-boot

**Date:** 2026-10-08
**Status:** Executed (see §7)
**Decision:** [AD-78](../decisions/2026-10-08_AD78_MIGRATION_GENERATION.md)
**Scope:** GAP-7 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): `blue db
generate` / `db:new` / `db:status`, the committed schema snapshot with a
freshness gate, and `migrations.runOnBoot` — the DX-track remainder of AD-75.

---

## 1. Problem

The journaled runner (AD-30) is complete but **has no authoring path**:
migrations are code-composed `Migration[]` lists with no artifact, no
generator, and no boot wiring. Baseline DDL exists only as the runtime
helper `createTableStatements(entities)` (and `DrizzleDataSource.init`'s
`IF NOT EXISTS` fresh-DB path); every real schema change is hand-written
SQL with no version scaffold, no review unit, and no gate. `blue db
migrate` (AD-75) already runs the app's `db:migrate` script, but no app
declares one; `04-blue-api` lazy-inits a `:memory:` data source and never
sees the journal. GAP-7's recommendation — "`blue db generate` from entity
metadata; `migrations.runOnBoot`" — is unimplemented and ADR-gated.

## 2. Evidence (2026-10-08, repo-grounded)

- `DrizzleMigrator` (`…/drizzle-migrator.ts:82-173`): `migrate` (ascending,
  idempotent, journal `_blue_migrations`), `status`, `orderedMigrations`;
  `MigrationContext.batch` takes `string[]` — generated files need no SQL
  parsing.
- `createTableStatements` (`drizzle-data-source.ts:86-132`): the metadata →
  DDL predicate — types/PK/generated/nullability only.
- `ColumnDefinition` (`@blue/orm` `metadata.ts:63-69`): no defaults/unique/
  index; relations emit no DDL → the fidelity ceiling.
- `@blue/cli`: `commands/db/migrate.ts` (app-script seam, docstring names
  GAP-7), `helpers/app-scripts.ts` (`runAppOnce`, `appScriptCommand`),
  AD-75 D-2 table (promised `db:*` = `new`, `migrate`), AD-72..75 follow-up
  review (the `db:new` gap row).
- No app declares `db:migrate`; `04-blue-api/src/drizzle-note-controller.ts:28-35`
  is the Drizzle consumer (lazy `init([DrizzleNote])`).
- Peer survey (2026-10-06/07 gap analyses): file-first generation and
  boot-time auto-config are the industry norm (Drizzle Kit, Flyway/
  Liquibase, AdonisJS Lucid).

## 3. Change

1. **`@blue/orm-drizzle`** — additive, runner untouched:
    - `src/migration-loader.ts` — `loadMigrations(dir): Promise<Migration[]>`
      (scan `db/migrations/*.ts`, dynamic-import, order by exported version),
      `nextMigrationVersion(dir): number`.
    - `src/schema-snapshot.ts` — `projectEntities(entities)` (normalized
      metadata projection, `predicate: 1`), `diffProjections(before, after)`
      (delta: added/removed tables, added/removed columns with type/
      nullability, PK changes), `renderMigrationFile(version, slug, delta)`,
      read/write `db/schema.json`.
    - `migrateOnBoot({ dataSource, dir })` — load + `migrate`, throw on
      failure; exported from the barrel.
2. **`@blue/cli`** — new commands in `src/commands/db/`:
    - `new.ts` (CLI-owned scaffold: next version + slug → file, exit-code
      contract), `generate.ts`, `status.ts` (both run the app's declared
      script via `runAppOnce`, house hint text: `add a "db:generate" script,
      e.g. "db:generate": "tsx src/db-generate.ts"`); `migrate.ts` unchanged.
3. **`apps/04-blue-api`** — the reference consumer:
    - `src/migrate.ts` (journaled run over the file migrations),
      `src/db-generate.ts` (load `DrizzleNote` + a second small entity,
      project → diff → write migration + snapshot), `src/db-status.ts`;
      `scripts.db:*` entries in `package.json`.
    - Committed `db/migrations/0001-initial-schema.ts` + `db/schema.json`
      (baseline from the entities).
    - Start path: bind `migrations.{runOnBoot, dir}`
      (`@configurationProperties`), call `migrateOnBoot` before serving
      (replacing the lazy `IF NOT EXISTS` init for the Drizzle note route).
4. **Gate** — extend `scripts/check-manifests.mjs` (or a sibling
   `scripts/check-migration-schema.mjs`): regenerate the reference app's
   snapshot → byte-identical or fail; wire into the root check.
5. **Guide 27 — ORM & Migrations** — entity → `db/schema.json` →
   `blue db generate` → `blue db migrate` / `migrateOnBoot` lifecycle; the
   fidelity ceiling (what stays hand-written); mixed mode.

## 4. Deliberately out of scope (in the ADR)

- Constraint metadata + FK DDL from relations — needs a `predicate` bump
  and its own decision point.
- `--from-db` snapshot seed for existing databases — v1.1.
- Non-SQLite dialects — the projector is the seam; nothing else extends.
- An ORM auto-configuration bean for run-on-boot — app-owned by design
  (AD-64).

## 5. Verification

- **Unit (blue-orm-drizzle):** loader ordering + duplicate/invalid-version
  fail-loud + rename-insensitivity; `projectEntities` round-trip parity
  against `createTableStatements` (same predicate); `diffProjections` emit
  for baseline, add-column, drop-column, PK change; `migrateOnBoot` fail-
  closed on a throwing migration (fail-before/pass-after with journal state).
- **Unit (blue-cli):** `db:new` next-version probing + scaffold shape;
  `db:generate`/`db:status` script resolution and hints (fixture app dirs).
- **Gate:** introduce snapshot drift → check fails; regen → byte-identical.
- **App (smoke, real run):** `blue db generate` in `04-blue-api` produces
  the committed baseline; `blue db migrate` applies it to a file-based DB;
  boot runs pending migrations then serves; journal shows exactly one apply.
- Full repo gate set at the end, clean `git status`, `pnpm doc` freshness,
  `graft build` refresh.

## 6. Docs

AD-78; guide 27 + guides index; companion plan + plans index; package
READMEs (`blue-orm-drizzle`, `blue-cli`); ARCHITECTURE package map/roadmap
rows if the shape demands; CHANGELOG; generated API docs.

## 7. Execution log (2026-10-08)

Implemented and verified in one pass (ADR-78 accepted). Per-wave
fail-before/pass-after:

- **Core (`@blue/orm-drizzle`)** — `migration-loader.ts` (`loadMigrations`,
  `nextMigrationVersion`), `schema-snapshot.ts` (`projectEntities`,
  `diffProjections`, `renderMigrationFile`, `renderSnapshot`,
  `readSnapshot`), `migrateOnBoot`; barrel exports. 21 new specs green
  (loader ordering/rename-insensitivity/fail-loud; snapshot parity
  byte-identical to `createTableStatements`; add/drop column + table;
  type/nullability/PK changes → unsupported; snapshot round-trip + foreign
  predicate fail-loud; `migrateOnBoot` applies + idempotent + fail-closed
  journal state).
- **CLI (`@blue/cli`)** — `db:new` (scaffold + probe), `db:generate` /
  `db:status` (app-script fronts); 2 new specs + integration cases green
  (real-bin lane: scaffold/bump/normalize, script hints, probe parity with
  the framework loader as the shared vector).
- **Reference app (`apps/04-blue-api`)** — `migrate.ts` / `db-generate.ts` /
  `db-status.ts` + scripts; committed `db/migrations/0001-create-table-
  drizzle-notes.ts` + `db/schema.json` **generated by the real CLI**;
  `migrations.{runOnBoot,dir}` config + `migrateOnBoot` in the start path;
  shared file-backed data source; `config/application.json` fixture;
  integration spec pins `BLUE_DB_URL=:memory:`.
- **Gate** — `scripts/check-migration-schema.mjs` + root
  `db:schema:check` (regen → working-tree equality under `apps/04-blue-api/
  db/`) wired into the CI quality job. Real run: `no schema changes` at
  HEAD; fail mode proven (untracked drift reported with guidance).

### Substrate defects found and fixed along the way

1. **Nested space-form commands never resolved** (`db migrate`/`db new` …
   printed the topic help; only colon form worked) — AD-75's shipped
   surface. `topicSeparator` `:` → space in `@blue/cli`'s oclif config;
   colon form still works. Covered by the integration lane.
2. **One-shot commands stripped the environment to `PATH`** — `BLUE_DB_URL`
   and every config knob silently vanished between the CLI and the app
   script. `appScriptCommand` now forwards `process.env` (shell-free signal
   relays unchanged).
3. **File-backed store CANTOPEN** — libSQL fails when the parent directory
   of `file:` URLs is missing; `ensureDbDir()` creates it on demand
   (migrate/status scripts, controller init, boot path).
4. **Dotted env names cannot cross package-manager runners** — `pnpm` drops
   non-identifier variables, so `migrations.runOnBoot` via the environment
   is a dead end at the workspace boundary. The config FILE
   (`.configFiles(new StandardConfigFileLoader({ reader }))` +
   `config/application.json`) is the documented dotted-key carrier — also
   the repo's first real config-file fixture (BOOT-5). A platform-provided
   default Node reader remains a follow-up; the app adapters 8 lines.

### Final verification

- Full lane runs: `@blue/orm-drizzle` 137 tests green, `@blue/cli` 24
  green, app `tsc -b` clean.
- Real-process smoke: `blue db generate` (baseline emitted, idempotent
  re-run) → `blue db migrate` against a fresh `file:` store (journal {1}
  applied, re-run no-op, `db status` readback) → boot with
  `migrations.runOnBoot: true` via config file: `applied pending
  migrations` before serving, `/health` UP, POST + GET /drizzle/notes
  persisting through the migrated store; second boot re-applies nothing.
- Full gate set (§5) plus the new `db:schema:check`, docs link gate,
  typecheck, and graft refresh — see the wrap-up verification run.
