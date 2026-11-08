# @ndigo/orm-drizzle

> SQL-backed Drizzle ORM adapter for `@ndigo/orm` — a libSQL data source with automatic table creation and an async entity manager for CRUD.

Drizzle ORM adapter for `@ndigo/orm`. Provides a SQL-backed data source and
entity manager for persistence: `DrizzleDataSource` (a libSQL-backed data
source that maps `@ndigo/orm` entity metadata to tables and creates them
automatically) and `DrizzleEntityManager` (an async entity manager for CRUD
operations). The adapter also ships `LibSQLSessionStore`, a durable
implementation of the authentication `SessionStore` contract.

## Installation

```bash
pnpm add @ndigo/orm-drizzle @ndigo/orm
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12. The adapter
depends on `drizzle-orm` and `@libsql/client`; add them directly if you import
their types or helpers in application code.

## Getting Started

```ts
import { column, entity, generatedColumn, primaryColumn } from '@ndigo/orm';
import { DrizzleDataSource, DrizzleEntityManager } from '@ndigo/orm-drizzle';

@entity('users')
class User {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

const dataSource = new DrizzleDataSource({ url: 'file:./app.db' });
await dataSource.init([User]); // CREATE TABLE IF NOT EXISTS from @ndigo/orm metadata

const em = new DrizzleEntityManager(dataSource);
const alice = new User('Alice');
await em.persist(alice); // backfills alice.id (generated key)
const found = await em.find(User, alice.id);
```

## Migrations (AD-30/AD-78)

Two layers, both additive on the AD-30 runner:

- **Versioned migration files** — `db/migrations/<NNNN>-<slug>.ts`, one
  module exporting a `Migration` per file. `loadMigrations(dir)` discovers
  and orders them (versions come from the exports; filenames are cosmetic),
  `nextMigrationVersion(dir)` probes the next free version, and
  `migrateOnBoot({ dataSource, dir })` applies pending ones at startup —
  failing closed (a boot that would serve against a stale schema stops).
  The `DrizzleMigrator` contract itself is unchanged.
- **Generation from entity metadata** — `projectEntities(entities)` renders
  the snapshot shape (`db/schema.json`, `predicate`-versioned);
  `diffProjections(before, after)` renders the SQL delta (create/alter/drop)
  with anything the metadata predicate cannot express reported as
  unsupported; `renderMigrationFile` + `renderSnapshot`/`readSnapshot` are
  the committed artifacts. `ndigo db generate` (guide 20) drives the whole
  loop against the committed snapshot, so regeneration is byte-identical —
  the CI freshness gate's premise.

```ts
// db/migrations/0001-initial.ts
import type { Migration } from '@ndigo/orm-drizzle';
import { createTableStatements } from '@ndigo/orm-drizzle'; // or a generated file's ctx.batch body

const migration: Migration = {
    version: 1,
    description: 'initial schema',
    up: (ctx) => ctx.batch(createTableStatements([User])),
};

export default migration;
```

## Usage

### Repository contract

`DrizzleRepository<T, ID>` implements `AsyncRepository<T, ID>` from
`@ndigo/orm`. Backend-neutral consumers can await its CRUD, relation, and
pagination methods, or use an in-memory repository through
`toAsyncRepository`. Synchronous `Repository` remains a separate contract;
database operations are not made synchronous.

### Durable opaque sessions

`LibSQLSessionStore` implements the capability-owned `SessionStore` contract.
Opt in by passing it to `CredentialsAuthAdapter` or `NodeSessionInterceptor`;
memory sessions remain the default. No Redis dependency or universal storage
API is introduced.

```ts
import { LibSQLSessionStore } from '@ndigo/orm-drizzle';

const sessions = new LibSQLSessionStore({ url: 'file:./sessions.db', maxSessions: 512 });
await sessions.initialize(); // explicit application provisioning/startup
// Pass sessions to your credentials adapter and cookie-session interceptor.
// Register sessions as a container value, or close it after draining consumers:
sessions.close();
```

Construction performs no SQL. `initialize()` explicitly and idempotently
creates only `ndigo_sessions` and its expiry index; it never drops or migrates
application tables. An application migration may provision that same layout
instead. Isolate applications/environments by database: the fixed table is a
database-wide namespace, not a tenant boundary.

The store persists principal id/name/roles, token version, issue time and
absolute expiry, restoring `DefaultPrincipal` role methods on read. Malformed
rows and backend faults reject rather than becoming misses or triggering
memory fallback. IDs are opaque random 32-byte base64url tokens. Reads purge
expired sessions; rotation is one atomic conditional SQL update, invalidating
the old id and returning `{ id, expiresAt }` with the original absolute
expiry. Exactly one contender can rotate an id; unknown/expired ids reject.
TTLs are positive integer milliseconds. Creation purges expired rows and
atomically enforces the shared live-session cap (default 512). Configure the
same cap across instances and keep their clocks synchronized.

Injected `client` values are borrowed unless `ownsClient: true` transfers
ownership; internally-created clients are owned. Injected clients must use the
default `intMode: 'number'` for strict integer decoding. `dispose()` and
`close()` are idempotent, close only owned clients and reject subsequent store
operations. `close()` is the supported application-context shutdown bridge;
stop and drain session consumers first because disposal does not drain pending
operations.

### Durable jobs and the transactional outbox

`LibSQLJobStore` implements the `JobDriver` contract from `@ndigo/jobs`, and
`LibSQLOutboxStore` implements its `OutboxStore` contract. Together they close
the "commit side effect with the data" gap: an `append()` made inside a
`@transactional` method joins the open transaction when the store shares the
`DrizzleDataSource` client — the client routes the statements of the transaction
boundary's async context into it (`@libsql/client` 0.18 pools connections, so
sharing the client, not merely the database file, is what carries the
guarantee).

```ts
import { LibSQLJobStore, LibSQLOutboxStore } from '@ndigo/orm-drizzle';

// Worker processes: an isolated connection per runner.
const jobs = new LibSQLJobStore({ url: 'file:./jobs.db' });

// The application: append joins @transactional boundaries.
const outbox = new LibSQLOutboxStore({ client: dataSource.client });
```

`claim` is a single `UPDATE … WHERE id IN (SELECT …) RETURNING` statement, so
two workers on one database never lease the same job; expired leases are
reclaimed by the next `claim`. Borrowed clients stay open on `close()` unless
`ownsClient` transfers ownership.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/orm-drizzle build:lib
pnpm --filter @ndigo/orm-drizzle test
```

## See Also

- [@ndigo/orm](../ndigo-orm/README.md) — the entity metadata and repository contracts this adapter implements
- [Guide 26 — Authentication & Sessions](../../docs/guides/26-authentication-and-sessions.md) — wiring `LibSQLSessionStore` into credentials auth and cookie sessions
- [Guide 21 — Persistence & Shared Stores](../../docs/guides/21-persistence-and-shared-stores.md) — the memory-first persistence baseline and durable-session posture

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
