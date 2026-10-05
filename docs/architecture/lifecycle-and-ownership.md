# Lifecycle & Resource Ownership

The async/resource discipline of BlueJS: how the framework manages
initialization and teardown, who owns what, and why the ordering rules are
uniform across every backend. This document states the doctrine once; the
ADRs and guides cited are the per-surface details.

## Pillars

1. **Async by default.** Every operation that can perform I/O is awaitable,
   including the in-memory `Cache` (`size()` included, AD-39). There is no
   hidden synchronous fast path with different semantics — one contract per
   capability.
2. **Memory is the default; backends are explicit.** Installing a backend
   package never connects, never auto-registers beans, and never changes
   auto-configuration (AD-40).
3. **Ownership is explicit, never ambiguous.** A resource you _created_ is
   **owned** — you close it. An **injected** resource is **borrowed** —
   closing an adapter never closes the injected client unless ownership is
   transferred (`ownsClient: true`). Disposal is idempotent; disposing one
   adapter never breaks another user of the same client (AD-40).
4. **Initialization is explicit and fail-loud.** Backends require an
   explicit `initialize()`/`connect()` before use; construction performs
   no I/O. Delayed first use awaits the original initialization promise and
   still rejects on schema/connect failure — never empty history, never a
   silent memory fallback (AD-40).
5. **Stop, drain, then close — in `finally`.** Producers and serving stop
   first, consumers unsubscribe, transports close, the synchronous
   container close runs last. Cleanup is written so a failure cannot skip
   the remaining steps (guides 06/16, AD-40).
6. **Close is a contract, not a convention.** Container teardown recognizes
   `Closeable`; external adapters bridge `dispose()` to it explicitly.
   A dispose-only object registered with the container is not proof of
   cleanup (AD-40).

## The ownership rules

| Surface           | Created (owned)                                                                  | Injected (borrowed)                                                                                         | Transfer                                                                   |
| ----------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `RedisConnection` | URL-created → owner closes                                                       | passed to `RedisSocketFanout` → fanout closes borrowed? **no** — fanout never closes its borrowed publisher | `RedisSocketFanout({ connection })` borrows; publisher closed by its owner |
| LibSQL clients    | URL-created (`libsql-session-store.ts`, `libsql-queue-message-store.ts`) → owned | `{ client }` option → borrowed                                                                              | `ownsClient: true` transfers; disposal leaves the client usable by others  |
| Cache managers    | `RedisCacheManager` URL-created → `close()` drains + closes                      | ready `{ client }` → borrowed                                                                               | documented per package README                                              |

## Shutdown ordering (the canonical sequence)

1. Stop producers and serving (`server.start()` reversed: stop accepting).
2. `registry.close()` / `broker.close()` — unsubscribe consumers, stop
   heartbeat, drop sessions.
3. `fanout.close()` — unsubscribe its owned subscriber.
4. `publisher.close()` by its **owner**.
5. Synchronous `context.close()` — the container tears down beans
   (`Closeable`), the application's synchronous close semantics.

Every step is awaited where awaitable; a startup failure runs the same
cleanup path (nothing half-built is left connected).

## Lifecycle sequences (context)

The application-context lifecycle — refresh, close, destroy-vs-close,
child-context propagation — is specified in
`docs/reference/2026-08-22_CONTEXT_LIFECYCLE.md`. This document covers the
resource-ownership half; the two meet at `Closeable` bridging and the
drain-before-close rule.

## As-built verification

- AD-40's regression suite proves: shared-client disposal independence,
  transfer + close-exactly-once, borrowed-client usability after adapter
  disposal, real-file close/reopen durability, and SQL-failure observation.
- Cross-node fanout smoke (AD-40 Phase 3): closed-publisher rejection,
  ERROR + `1011` on inbound fault without local-only fallback, idempotent
  closure — the doctrine exercised end-to-end, not just documented.

## Where the doctrine lives (index)

- Decisions: AD-18 (host lifecycle), AD-39 (async by default), AD-40
  (ownership/initialization/shutdown), AD-41 (deferral discipline)
- Guides: 06 (websocket close composition), 16 §5 (persistence shutdown)
- Reference: `docs/reference/2026-08-22_CONTEXT_LIFECYCLE.md`
- Packages: `@blue/redis`, `@blue/orm-drizzle`, `@blue/socket` READMEs
  (per-surface ownership statements)

## Revisit triggers

- A backend that cannot fail loudly on init (streaming stores, external
  brokers) needs an explicit fault contract before adoption.
- If container teardown grows async lifecycle hooks, the
  synchronous-close rule (pillar 5) is the seam to reopen — until then,
  `Closeable` bridging + drain ordering remain the contract.
