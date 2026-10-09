# Guide 16 — Persistence & Distributed Backends

BlueJS is memory-first: every shared capability ships an in-process default,
and external backends are **explicit opt-ins**. This guide covers the
persistence baseline (AD-40): durable sessions on LibSQL, the shared Redis
cache, and cross-node WebSocket/STOMP fan-out — plus what stays deliberately
deferred (AD-41).

```sh
pnpm add @blue/redis @blue/orm-drizzle @blue/cache @blue/socket
# node only: @blue/redis requires Node 22+; standalone Redis 7.2+
```

## 1. The doctrine (AD-40)

- **Capability-owned contracts, no universal store.** Sessions implement
  `SessionStore` (`@blue/auth-core`), messages implement `QueueMessageStore`,
  caches implement `Cache` — there is no generic storage superclass and no
  `@blue/store` package. Add a backend where a contract already exists.
- **Memory is the default; backends are explicit.** Installing `@blue/redis`
  never connects to anything and never changes auto-configuration.
- **Ownership is explicit.** Created clients are _owned_ (you close them);
  injected clients are _borrowed_ unless `ownsClient: true` transfers
  ownership. Disposal is idempotent; disposing an adapter never closes a
  client another adapter uses. Stop/drain producers before disposal —
  disposal does not guarantee pending writes complete.
- **Failures are observed, never hidden.** Backend faults are not empty
  history, memory fallback, or unhandled rejections; initialization failures
  surface on first use (operations await the original initialization
  promise).
- **No bean auto-registration.** Container wiring is application-owned;
  lifecycle must bridge to the container's `Closeable` teardown explicitly.

## 2. Durable sessions with LibSQL

`LibSQLSessionStore` (`@blue/orm-drizzle`) implements the same `SessionStore`
contract as the reference `InMemorySessionStore` — same `kind`-guarded
surfaces, same rotation semantics, durable across restarts. It is the one
backend the auth stack ships; the auth contract itself is unchanged.

```ts
import { LibSQLSessionStore } from '@blue/orm-drizzle';
import { CredentialsAuthAdapter } from '@blue/auth-server';
import { ScryptPasswordEncoder } from '@blue/auth-core/scrypt'; // Node-only (node:crypto)

const sessions = new LibSQLSessionStore({
    url: 'file:./sessions.db', // or an injected { client } with intMode: 'number'
    maxSessions: 512,          // default 512; shared live-session cap
});
await sessions.initialize(); // explicit: provisions blue_sessions + expiry index

const auth = new CredentialsAuthAdapter({
    userStore: /* your user store */,
    passwordEncoder: new ScryptPasswordEncoder({ ln: 14 }),
    sessionStore: sessions, // the durable store; memory remains the default
});
```

Guarantees (verified in AD-40):

- **Explicit provisioning.** `initialize()` idempotently creates only
  `blue_sessions` and its expiry index — never drops or migrates application
  tables. An application-owned migration may provision the same layout.
- **Atomic rotation.** Refresh issues a new id via one conditional
  `UPDATE … WHERE session_id = ? AND expires_at > ?` — exactly one
  contender wins; expired or unknown ids never resurrect; the _original_
  absolute expiry is preserved and reported (no TTL reset on refresh).
- **Strict decode.** Records contain only principal id/name/roles, token
  version, issue timestamp, absolute expiry; malformed rows reject rather
  than becoming silent auth misses.
- **Cap + purge.** Creation purges expired rows and enforces
  `maxSessions` atomically; instances sharing a database should agree on the
  cap and keep clocks synchronized.
- **Lifecycle.** `close()` bridges `dispose()` to the container's
  `Closeable` teardown; owned clients close exactly once, borrowed clients
  stay usable. LibSQL close is synchronous — drain consumers first.

Namespaces: the fixed table is a **database-wide namespace** — isolate
applications/envs by database (or by migration-owned schema), exactly like
the queue store. No auth contract changes were made for persistence.

## 3. Redis: connection, shared cache

`@blue/redis` is the Node-only Redis foundation: `RedisConnection` lifecycle
plus the capability subpaths. Root export does not load capability contracts,
so the package is dependency-light for connection-only use.

```ts
import { RedisConnection } from '@blue/redis';
const publisher = new RedisConnection({ url: process.env.REDIS_URL! });
await publisher.connect();
// … await publisher.close(); // owned; drained, no QUIT (close, not QUIT)
```

Shared cache lives in `@blue/redis/cache` (`RedisCacheManager` /
`RedisCache`) against the awaitable `Cache` contract — same API as
`MemoryCacheManager`, saw the async cutover under AD-39. Redis values are
restricted to JSON-value trees (plus a tagged whole-entry undefined);
unsupported and corrupt values reject rather than silently losing data. See
[guide 07 §6](07-caching.md) for the full backend policy (no per-cache
eviction, server-side expiry, namespace-safe `clear`/`size`, no
`FLUSHDB`).

Shared-store **rate limiting** is the same opt-in shape:
`@blue/redis/rate-limit` — `RedisRateLimiter` (AD-79) — implements the
`RateLimiter` SPI from `@blue/rate-limit`: fixed-window budgets that
every process counts against (keys `blue:rl:<namespace>:<windowMs>:<key>`,
windows anchored at the first request, expiry server-side by TTL). It is
**fail-closed by default** — an unreachable store rejects the request
instead of passing it unthrottled; `onError: 'fail-open'` logs through
`@blue/log` and allows (the documented availability escape hatch).
Override the platform's `RATE_LIMITER` bean with it:

```ts
import { RedisConnection } from '@blue/redis';
import { RedisRateLimiter } from '@blue/redis/rate-limit';

const connection = new RedisConnection({ url: process.env.REDIS_URL! });
await connection.connect(); // borrowed; readiness is the app's contract

const shared = new RedisRateLimiter({ connection, namespace: 'prod' });
// …register `shared` under the RATE_LIMITER token (or hand it to the
// RateLimitInterceptor constructor directly)…
```

See [guide 11 §5](11-authentication-and-sessions.md) for the
`@rateLimit` metadata and the 429 + `Retry-After` denial.

## 4. Cross-node live fan-out (opt-in)

`SocketFanout` (`@blue/socket`) is a capability-owned transport contract and
`RedisSocketFanout` (`@blue/redis/pubsub`) is its live implementation:
`subscribe(scope, receive)` / `publish(scope, { key, body, headers? })` for
paths, rooms, and STOMP `/topic/*`. Wire it through
`new NodeSocketSessionRegistry({ fanout })` and/or
`new StompBroker({ fanout })`; the server must have the registry before
serving, and all consumers connect before `server.start()`.

Details — delivery semantics (live at-most-once, no replay/reconnect/global
ordering), echo suppression, Redis limits, stop/shutdown ordering, and
deployment policy — are in [guide 06, cross-node live fan-out](06-websockets.md#cross-node-live-fan-out-opt-in).

## 5. Shutdown ordering

Stop producers and serving first, then close consumers, then transports,
inside `try`/`finally`, before synchronous `context.close()`:

1. `registry.close()` / `broker.close()` — unsubscribes consumers
2. `fanout.close()` — unsubscribes its owned subscriber
3. `publisher.close()` — by its owner (never the fanout)
4. `sessions.close()` (or container `Closeable` teardown) after draining

Startup failure requires the same cleanup path. Container destruction
recognizes `Closeable`; a dispose-only object is not proof of cleanup.

## 6. Deployment policy

- **Redis 7.2+ standalone**; no modules, no cluster/sentinel guarantees, no
  Redis 8.4-only commands. Base client `@redis/client` pinned at 6.3.0.
- **Namespaces** are your isolation unit: cache namespaces
  (`app:production`) separate keys; pubsub namespaces
  (`[A-Za-z0-9][A-Za-z0-9._-]{0,127}`, no colon) separate channels and are
  **not authorization** — protect channels with Redis ACLs and trusted
  network/TLS.
- **Message limits**: pubsub envelopes ≤ 1 MiB (complete UTF-8 JSON,
  including base64 + headers); keys 1–1024 chars; ≤ 128 headers, values
  ≤ 8192 chars; invalid outbound envelopes reject before I/O.
- No localhost defaults anywhere — URLs are explicit (`redis://`/`rediss://`,
  file paths for LibSQL); adapters never connect automatically.

## 7. Deferred, deliberately (AD-41)

Not built, with an explicit decision and revisit triggers:

- **Distributed scheduling** — no leader election, no durable job queue; the
  in-process `TaskScheduler` remains (guide 05). Revisit only when a real
  consumer needs at-most-once-per-schedule across workers, restart-surviving
  queued jobs, deployable schedule definitions, or cross-process task
  observation — then the precedent is AD-20's hook seam plus the
  `@blue/redis` / SQL-store patterns above.
- **Cross-node queue consumption** — LibSQL `/queue` persistence is storage,
  not distributed consumption; durable pub/sub replay, offline queues, and
  global ordering are out of scope for the live fan-out.

## References

- Decisions: [AD-40](../decisions/2026-10-01_AD40_PERSISTENCE_BASELINE.md),
  [AD-41](../decisions/2026-10-03_AD41_DISTRIBUTED_SCHEDULING_DEFERRED.md),
  [AD-39](../decisions/2026-09-30_AD39_ASYNC_BY_DEFAULT.md) (async cutover)
- Roadmap: `docs/plans/2026-10-01_SHARED_PERSISTENCE_ROADMAP.md`
- Related guides: [06 — WebSockets](06-websockets.md) (fan-out),
  [07 — Caching](07-caching.md) §6, [11 — Auth & Sessions](11-authentication-and-sessions.md)
- Packages: `@blue/redis` (README), `@blue/orm-drizzle` (README:
  `LibSQLSessionStore`, `LibSQLQueueMessageStore`), `@blue/socket`,
  `@blue/cache`
