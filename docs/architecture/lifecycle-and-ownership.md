# Lifecycle & Ownership

The async and resource discipline of Ndigo: how the framework manages
initialization and teardown, who owns what, and why the ordering rules are
uniform across every backend. This page states the rules once; the linked
guides cover each surface in detail.

## Design Principles

1. **Async by default.** Every operation that can perform I/O is awaitable,
   including the in-memory `Cache` (`size()` included). There is no hidden
   synchronous fast path with different semantics — one contract per
   capability.
2. **Memory is the default; backends are explicit.** Installing a backend
   package never connects, never auto-registers entries, and never changes
   auto-configuration.
3. **Ownership is explicit, never ambiguous.** A resource you _created_ is
   **owned** — you close it. An **injected** resource is **borrowed** —
   closing an adapter never closes the injected client unless ownership is
   transferred (`ownsClient: true`). Disposal is idempotent; disposing one
   adapter never breaks another user of the same client.
4. **Initialization is explicit and fail-loud.** Backends require an
   explicit `initialize()`/`connect()` before use; construction performs
   no I/O. Delayed first use awaits the original initialization promise and
   still rejects on schema/connect failure — never empty history, never a
   silent memory fallback.
5. **Stop, drain, then close — in `finally`.** Producers and serving stop
   first, consumers unsubscribe, transports close, the synchronous
   container close runs last. Cleanup is written so a failure cannot skip
   the remaining steps (see [Guide 15 — WebSockets](../guides/15-websockets.md)
   and [Guide 21 — Persistence & Shared Stores](../guides/21-persistence-and-shared-stores.md)).
6. **Close is a contract, not a convention.** Container teardown recognizes
   `Closeable`; external adapters bridge `dispose()` to it explicitly.
   A dispose-only object registered with the container is not proof of
   cleanup.

## Ownership Rules

| Surface           | Created (owned)                                                                  | Injected (borrowed)                                                                                         | Transfer                                                                   |
| ----------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `RedisConnection` | URL-created → owner closes                                                       | passed to `RedisSocketFanout` → fanout closes borrowed? **no** — fanout never closes its borrowed publisher | `RedisSocketFanout({ connection })` borrows; publisher closed by its owner |
| LibSQL clients    | URL-created (`libsql-session-store.ts`, `libsql-queue-message-store.ts`) → owned | `{ client }` option → borrowed                                                                              | `ownsClient: true` transfers; disposal leaves the client usable by others  |
| Cache managers    | `RedisCacheManager` URL-created → `close()` drains + closes                      | ready `{ client }` → borrowed                                                                               | documented per package README                                              |

## Shutdown Ordering

1. Stop producers and serving (`server.start()` reversed: stop accepting).
2. `registry.close()` / `broker.close()` — unsubscribe consumers, stop
   heartbeat, drop sessions.
3. `fanout.close()` — unsubscribe its owned subscriber.
4. `publisher.close()` by its **owner**.
5. Synchronous `context.close()` — the container tears down entries
   (`Closeable`), the application's synchronous close semantics.

Every step is awaited where awaitable; a startup failure runs the same
cleanup path (nothing half-built is left connected).

## Lifecycle Sequences

The application-context lifecycle — refresh, close, destroy-vs-close,
child-context propagation — is specified in
[Guide 04 — Dependency Injection, Scopes & Lifecycle](../guides/04-dependency-injection-and-lifecycle.md).
This page covers the resource-ownership half; the two meet at `Closeable`
bridging and the drain-before-close rule.

## Verification

- The regression suite proves: shared-client disposal independence, transfer
  and close-exactly-once, borrowed-client usability after adapter disposal,
  real-file close/reopen durability, and SQL-failure observation.
- The cross-node fanout smoke test proves: closed-publisher rejection,
  `ERROR` + `1011` on inbound fault without local-only fallback, and idempotent
  closure — the rules exercised end-to-end, not just documented.

## See Also

- How-to: [Guide 04 — Dependency Injection, Scopes & Lifecycle](../guides/04-dependency-injection-and-lifecycle.md),
  [Guide 15 — WebSockets](../guides/15-websockets.md),
  [Guide 21 — Persistence & Shared Stores](../guides/21-persistence-and-shared-stores.md)
- Packages: `@ndigo/redis`, `@ndigo/orm-drizzle`, `@ndigo/socket` — see the
  [package index](https://ndigo.dev/reference/packages/) for each package's README and its
  per-surface ownership statement

## When to Revisit

- A backend that cannot fail loudly on init (streaming stores, external
  brokers) needs an explicit fault contract before adoption.
- If container teardown grows async lifecycle hooks, the
  synchronous-close rule (principle 5) is the seam to reopen — until then,
  `Closeable` bridging and drain ordering remain the contract.
