# @libsql/client 0.18 Upgrade

**Date:** 2026-11-04
**Status:** Complete
**Impact:** Medium — one runtime dependency, and the transaction boundary it
forced `@ndigo/orm-drizzle` to rebuild

## Summary

| Package          | From     | To       | Declared by                      |
| :--------------- | :------- | :------- | :------------------------------- |
| `@libsql/client` | `0.17.4` | `0.18.0` | `@ndigo/orm-drizzle` (exact pin) |

The package is pinned exactly (not with a range) because its local driver speaks
to the native `libsql` binding:

```diff
 // packages/ndigo-orm-drizzle/package.json
-    "@libsql/client": "0.17.4"
+    "@libsql/client": "0.18.0"
```

`drizzle-orm` 0.45.4 declares `@libsql/client: >=0.10.0`, so the bump stays
inside its peer range and Drizzle's own `db.transaction(...)` path is unaffected.

## What actually changed upstream

`@libsql/core` is byte-identical between the two versions and the remote
(`libsql://`, `http(s)://`) clients are untouched. The whole delta is in the
local `sqlite3` driver:

- **The client is now a connection pool.** `execute()` borrows a connection for
  the duration of the call and returns it; `transaction()` borrows one for the
  transaction's lifetime. Up to `concurrency` connections (default 20) are
  opened per client.
- **In-memory and embedded-replica clients are capped at one connection** (a
  second connection to `:memory:` would be a different, empty database).
- **A connection returned while still in a transaction is rolled back** before
  it re-enters the pool.
- A new `TRANSACTION_ACTIVE` error is raised when every connection is held by
  open transactions.

## Why that broke the framework

`DrizzleTransactionManager` bracketed a transaction with raw statements on the
client:

```ts
await this.#dataSource.client.execute('BEGIN');
const result = await fn(); // statements went to "the connection"
await this.#dataSource.client.execute('COMMIT');
```

With one connection per client that was true. With a pool it is not: `BEGIN`
borrowed a connection and gave it straight back — and the pool rolled it back on
release — while `fn`'s statements landed on other connections. The suite failed
with what the pool actually did:

```
LibsqlError: SQLITE_ERROR: cannot rollback - no transaction is active
```

Seven specs failed: the four `DrizzleTransactionManager` boundary specs, the two
transactional-outbox specs (the proof that a rolled-back transaction discards
the outbox entry with the business write), and the outbox → jobs end-to-end
spec.

## The fix

**1. The boundary is a real interactive transaction.**

```ts
const transaction = await this.#dataSource.client.transaction('write');
await runInTransaction(transaction, async () => fn());
await transaction.commit(); // or .rollback() on failure
```

`mode: 'write'` opens with `BEGIN IMMEDIATE`: the write lock is claimed at BEGIN
instead of being upgraded on the first write, which is what libSQL's own clients
default to and what keeps a concurrent writer from failing that upgrade
mid-transaction.

**2. Statements are routed to it by async context.** A new
`TransactionScopedClient` (`src/_transaction-scoped-client.ts`) is what
`DrizzleDataSource.client` now returns, and what the Drizzle database and every
store handed that client write through. It sends `execute`/`batch`/
`executeMultiple` to the transaction bound to the calling async context
(`AsyncLocalStorage`, `src/_transaction-scope.ts`) and to the pooled client
otherwise. Because it wraps the client at the data source, the existing wiring
keeps working unchanged:

```ts
new LibSQLOutboxStore({ client: dataSource.client }); // still joins the boundary
```

Transaction control is never routed: `transaction()` always opens a new one on
its own connection (that is how Drizzle's own `db.transaction(...)` obtains its
handle), `migrate()` keeps its `PRAGMA foreign_keys=off` connection, and `sync()`
stays client-level.

**3. The public contract is untouched.** `TransactionManager.run(fn)` keeps its
signature, `@transactional` keeps working, the single-flight latch still rejects
nested and concurrent runs before anything is awaited (DAT-F9), and
`isActive()` only reports `true` while a boundary is open.

## Behaviour, measured

| Situation                                                  | Before (0.17, one connection)                                            | Now (0.18, pooled)                                                      |
| :--------------------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| Statement inside `run(fn)` (any path sharing the client)   | in the transaction                                                       | in the transaction                                                      |
| Statement from another async context                       | silently ran **inside** the open transaction and was rolled back with it | runs on its own connection, never enrolled                              |
| Statement from another context, `:memory:` database        | same as above                                                            | fails loud: `TRANSACTION_ACTIVE` (the database lives on one connection) |
| Concurrent write during an open transaction, file database | queued on the single connection                                          | fails loud: `SQLITE_BUSY` (SQLite allows one writer per database)       |

The two "fails loud" rows replace silent misbehaviour, and no consumer could
have relied on them: enrolling another request's write into your transaction was
an accident of the single-connection design, and it was the way a rolled-back
order could take an unrelated write down with it.

## Verified

| Gate                                                                      | Result                                                              |
| :------------------------------------------------------------------------ | :------------------------------------------------------------------ |
| `@ndigo/orm-drizzle` suite                                                | 140 passed (138 + 2 new boundary specs)                             |
| `pnpm test` (108 nx targets)                                              | 108 passed — includes the 04/18 app suites on file-backed databases |
| `pnpm apps:smoke`                                                         | 13 apps boot, probe and shut down                                   |
| `pnpm typecheck` / `lint` / `build`                                       | pass                                                                |
| `pnpm test:internal` / `test:tooling`                                     | 94 / 11 passed                                                      |
| `pnpm manifest:check` / `docs:links` / `format:check` / `db:schema:check` | pass                                                                |
| `pnpm audit --prod`                                                       | no known vulnerabilities                                            |
| `pnpm doc:api`                                                            | no API diff                                                         |

Two specs pin the new boundary in `packages/ndigo-orm-drizzle/test/index.spec.ts`:
one proves that a statement issued from another async context neither joins the
transaction nor survives it (file-backed source, `SQLITE_BUSY` on the concurrent
write, write after the rollback intact), the other pins the in-memory
`TRANSACTION_ACTIVE` refusal.

## Follow-ups

- **One data source per database file stays the rule.** A probe with two
  independent clients on one file showed a client left holding an open write
  after its statement hit `SQLITE_BUSY`, leaving the file locked for the other
  client — outside the supported shape, and unchanged by this bump. The
  framework's wiring (one `DrizzleDataSource` per database, stores that must
  join passing `dataSource.client`) is what the guides already document.
- The pool is now the concurrency model for file-backed databases, and SQLite is
  still one writer per database. Applications with heavy concurrent writes may
  want `PRAGMA journal_mode=WAL` and a busy `timeout` in their own bootstrap;
  the framework deliberately does not change a user's database file behind
  their back.
