# Guide 20 — ORM & Migrations

The journaled migration lifecycle: decorator entities are the
single schema source, `ndigo db generate` renders versioned migrations from
them, `ndigo db migrate` applies them through the journaled runner, and
`ndigo db status` reports the journal. Reference application: [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api).

**Audience:** Node application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Declare entities with decorators.
- Use repositories, relations, paging, and the unit of work.
- Generate and commit a migration snapshot.
- Run, inspect, and boot-apply migrations.
- Know the fidelity ceiling that stays hand-written.

## The lifecycle

```text
@ndigo/orm entities ──► db/schema.json (committed projection)
        │                        │
        │        ndigo db generate (diff vs committed snapshot)
        ▼                        ▼
db/migrations/NNNN-slug.ts ──► ndigo db migrate / migrateOnBoot
                                   │
                                   ▼
                        _ndigo_migrations (journal, forward-only)
```

## 1. The runner (`DrizzleMigrator`, )

Migrations are versioned modules, one per file under `db/migrations`:
`<NNNN>-<slug>.ts`, each exporting a `Migration` as its default export.
Versions are positive integers and **unique across all files**; the runner
applies pending ones in ascending order and records each application in the
`_ndigo_migrations` journal. The runner is **forward-only** — no `down`, no
rollback execution; downgrades mean restoring a backup and re-applying.
`migrate` is idempotent across restarts; a version that fails is never
journaled and retries cleanly.

```ts
// db/migrations/0001-create-table-notes.ts — scaffold with `ndigo db new`
import type { Migration } from '@ndigo/orm-drizzle';

const migration: Migration = {
    version: 1,
    description: 'create table "notes"',
    up: (ctx) =>
        ctx.batch([
            `CREATE TABLE IF NOT EXISTS "notes" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL
)`,
        ]),
};

export default migration;
```

The CLI runs the app's **own** `db:migrate` script (`"db:migrate": "tsx
src/migrate.ts"`) — the runner assembly (data source + migrations dir)
belongs to the application. Hand-written SQL migrations stay first-class:
the same directory holds generated and authored files, versions unique
across both.

## 2. Generation (`ndigo db generate`, )

`ndigo db generate` renders the next migration from your entities — the
**committed snapshot** is the diff base, so:

- a clean tree generates nothing (`no schema changes`);
- renaming/adding/dropping **columns or tables** emits the matching
 `ALTER`/`CREATE`/`DROP` statements as a new versioned file;
- the snapshot (`db/schema.json`) is rewritten on every run — regeneration
 is byte-identical, which is what the root `pnpm db:schema:check` gate
 asserts in CI.

The generator lives in the app (entities and snapshot path are app-owned):

```jsonc
// package.json
{
    "scripts": {
        "db:generate": "tsx src/db-generate.ts", // runs `ndigo db generate`
    },
}
```

```ts
// src/db-generate.ts — the reference shape
const projection = projectEntities(ENTITIES); // your @entity classes
const delta = diffProjections(await loadSnapshot(), projection);
// writes db/migrations/<NNNN>-<slug>.ts + rewrites db/schema.json
```

### The fidelity ceiling

The projection models exactly what the metadata expresses — column
name, SQLite storage type, primary key/generated, nullability. Everything
else stays **hand-written migration SQL**:

- defaults, `UNIQUE`, indexes, CHECK constraints, and FK DDL from relation
 metadata are not expressed by `@ndigo/orm` column metadata today;
- a column **type/nullability/PK change** is unsupported (it needs a table
 rebuild) — write it by hand;
- the snapshot format carries a `predicate` version; growing the metadata
 later bumps it so committed snapshots fail the freshness check instead of
 silently diverging.

`db generate` **fails loud instead of emitting what the operator has not
reviewed**; the patterns below exit non-zero with the offending statements
on stderr until acknowledged (REV-002/REV-006):

- **destructive drops** (dropped columns, dropped tables) — an entity
 rename would otherwise render `DROP TABLE IF EXISTS` into a migration
 unseen; re-run with `NDIGO_DB_ACCEPT_DROPS=true` after reviewing;
- **unexpressible changes** — reported as unsupported; the snapshot still
 advances (the entities are the source of truth), so without the
 acknowledgment a hand-written migration could be forgotten while the
 freshness gate stays silent; re-run with `NDIGO_DB_ACCEPT_UNSUPPORTED=true`.

Both flags follow the repo's env-flag convention (`present`/`true`/`1`
enables, `false`/`0`/`''` does not) and are read from the environment.

## 3. Running migrations at boot (`migrations.runOnBoot`, )

`@ndigo/orm-drizzle` exports `migrateOnBoot({ dataSource, dir })`: loads the
file migrations and applies pending ones through the journaled runner,
**throwing on failure** — a boot that would serve against a stale schema
stops instead.

The reference app opts in via its config file (dotted config keys ride
config files — env names must be identifier-safe, since package-manager
runners drop dotted variables):

```jsonc
// [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)/config/application.json
{
    "migrations": {
        "runOnBoot": true,
    },
}
```

```ts
// src/index.ts — before the server starts
const migrationsConfig = context.getValue(MIGRATIONS_CONFIG);
if (migrationsConfig.runOnBoot) {
    await migrateOnBoot({
        dataSource: getDrizzleDataSource(),
        dir: fileURLToPath(new URL(`../${migrationsConfig.dir}`, import.meta.url)),
    });
}
```

One runner at a time: concurrent migrators fail loud on the journal primary
key (operator contract, not a lock).

## 4. The `ndigo db` surface 

| Command | Runs | Owner |
|:-------------------------- |:----------------------------------------------- |:-------------------------- |
| `ndigo db new [dir] [slug]` | scaffolds `<NNNN>-<slug>.ts` at the next version | CLI (`db/migrations` probe) |
| `ndigo db generate [dir]` | the app's `scripts.db:generate` | app (entities + snapshot) |
| `ndigo db migrate [dir]` | the app's `scripts.db:migrate` (journaled apply) | app (data source + dir) |
| `ndigo db status [dir]` | the app's `scripts.db:status` (journal readback) | app (data source + dir) |

## 5. Reference consumer

[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api) is the working example: `db/migrations/0001-…ts` and
`db/schema.json` are committed, `ndigo db generate` at HEAD is a no-op (and
`pnpm db:schema:check` in CI says so), `db migrate` applies to the same
`file:`-backed store the Drizzle routes read (`NDIGO_DB_URL` override), and
boot applies pending migrations before serving when `migrations.runOnBoot`
is enabled.

The data source's parent directory is created on demand
(`ensureDbDir` — libSQL fails CANTOPEN when it is missing); the store itself
(`apps/*/data/`) is gitignored.

## See also

- — the journaled
 runner contract (versions, journal, D-2 atomicity, D-3 DDL sharing).
- — file
 migrations, the committed snapshot, generation, `migrateOnBoot`.
- — the `db:*` CLI
 surface.
- [Guide 03](03-environment-configuration.md) — property sources and config
 files (the dotted-key carrier for `migrations.*`).
