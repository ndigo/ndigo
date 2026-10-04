# @blue/orm-drizzle

> SQL-backed Drizzle ORM adapter for @blue/orm — production persistence via a libSQL data source with automatic table creation and an async entity manager for CRUD.

Drizzle ORM adapter for `@blue/orm`. Provides a SQL-backed data source and entity manager for production persistence: `DrizzleDataSource` (a libSQL-backed data source with automatic table creation) and `DrizzleEntityManager` (an async entity manager for CRUD operations).

## Installation

```bash
pnpm add @blue/orm-drizzle drizzle-orm @libsql/client
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { DrizzleDataSource, DrizzleEntityManager } from '@blue/orm-drizzle';
import { entity, primaryColumn, column } from '@blue/orm';

@Entity('users')
class User {
    @primaryColumn()
    id: number;

    @column()
    name: string;
}

const ds = new DrizzleDataSource({ url: 'file:./app.db' });
await ds.init([User]);
const em = new DrizzleEntityManager(ds);

await em.persist(new User('Alice'));
const found = await em.find(User, 1);
```

## Repository contract

`DrizzleRepository<T, ID>` implements `AsyncRepository<T, ID>` from `@blue/orm`.
Backend-neutral consumers can await its CRUD, relation, and pagination methods
or use an in-memory repository through `toAsyncRepository`. Synchronous
`Repository` remains a separate contract; database operations are not made
synchronous.

## Durable opaque sessions

`LibSQLSessionStore` implements the capability-owned
[`SessionStore`](../blue-auth-core/src/session-store.ts) contract. Opt in by
passing it to `CredentialsAuthAdapter` or `NodeSessionInterceptor`; memory
sessions remain the default. No Redis dependency or universal storage API is
introduced.

```typescript
import { LibSQLSessionStore } from '@blue/orm-drizzle';

const sessions = new LibSQLSessionStore({ url: 'file:./sessions.db', maxSessions: 512 });
await sessions.initialize(); // explicit application provisioning/startup
// Pass sessions to your credentials adapter and cookie-session interceptor.
// Register sessions as a container value, or close it after draining consumers:
sessions.close();
```

Construction performs no SQL. `initialize()` explicitly and idempotently creates
only `blue_sessions` and its expiry index; it never drops or migrates application
tables. An application migration may provision that same layout instead. Isolate
applications/environments by database: the fixed table is a database-wide
namespace, not a tenant boundary.

The store persists principal id/name/roles, token version, issue time and absolute
expiry, restoring `DefaultPrincipal` role methods on read. Malformed rows and
backend faults reject rather than becoming misses or triggering memory fallback.
IDs are opaque random 32-byte base64url tokens. Reads purge expired sessions;
rotation is one atomic conditional SQL update, invalidating the old id and
returning `{ id, expiresAt }` with the original absolute expiry. Exactly one
contender can rotate an id; unknown/expired ids reject. TTLs are positive integer
milliseconds. Creation purges expired rows and atomically enforces the shared
live-session cap (default 512). Configure the same cap across instances and keep
their clocks synchronized.

Injected `client` values are borrowed unless `ownsClient: true` transfers
ownership; internally-created clients are owned. Injected clients must use the
default `intMode: 'number'` for strict integer decoding. `dispose()` and `close()`
are idempotent, close only owned clients and reject subsequent store operations.
`close()` is the supported application-context shutdown bridge; stop and drain
session consumers first because disposal does not drain pending operations.

See [authentication and sessions](../../docs/guides/11-authentication-and-sessions.md)
and [AD-40](../../docs/decisions/2026-10-01_AD40_PERSISTENCE_BASELINE.md).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/orm-drizzle build:lib
pnpm --filter @blue/orm-drizzle test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
