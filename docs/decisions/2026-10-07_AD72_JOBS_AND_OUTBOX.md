# AD-72: Durable jobs and the transactional outbox — `@blue/jobs`

**Date:** 2026-10-07
**Status:** Accepted
**Deciders:** Framework owner (GAP-1 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6)

---

## Context

The 2026-10-07 review lists GAP-1: **durable jobs/queues + transactional outbox**
— absent, 1.0-severity high; recommended shape "ADR + `@blue/jobs` driver SPI
(Redis/SQL), outbox wired to the ORM UoW". Wave 6 is ADR-gated; this record and
the companion plan (`docs/plans/2026-10-07_JOBS_AND_OUTBOX.md`) are the gate.

What the repository already provides, and what is missing:

- **Triggers exist, work delivery does not.** `@blue/scheduler` runs
  `@scheduled` methods in-process with single-flight and drain-on-close — a
  _trigger_ mechanism. There is no way to hand a unit of work to a queue, retry
  it out-of-band, or survive a restart with the work still pending.
- **Durability building blocks exist.** `LibSQLSessionStore` and
  `LibSQLQueueMessageStore` (`@blue/orm-drizzle`, owner of `@libsql/client`)
  established the durable-store pattern: options `{ client? , ownsClient?, url?,
  authToken? }`, eager schema creation awaited by every method, idempotent
  `dispose()`. `@blue/redis` owns the Redis client behind `RedisConnection`
  (owned/borrowed) and ships feature subpaths `./cache` and `./pubsub` (AD-51).
- **No transactional bridge exists.** `DrizzleTransactionManager.run()` brackets
  `BEGIN`/`COMMIT`/`ROLLBACK` on the data source's single libSQL connection
  (`packages/blue-orm-drizzle/src/drizzle-transaction-manager.ts`). Anything
  written through that same client inside `run()` joins the transaction —
  including a store that is handed the client. Nothing uses that property yet.

## Evidence

- In-process precedent for decorator + scan + lifecycle wiring: `ScheduleRegistry`
  (AD-20 D2) — registered by `NodeAutoConfiguration`, `ApplicationContextAware`,
  auto-started on refresh, stopped/drained on close; `TaskScheduler` adds
  single-flight, per-run span (`scheduler.task.<name>`), `tick()`/`stop()`/`close()`.
- Durable-store contract template verified in
  `packages/blue-orm-drizzle/src/libsql-queue-message-store.ts:74-237`
  (borrowed/owned client, awaited `#ready` schema, atomic `RETURNING` writes).
- Redis adapter template verified in `packages/blue-redis/src/connection.ts`
  (`run(operation)` tracking, owned/borrowed, close drains) and the
  `./cache` | `./pubsub` subpath shape in `packages/blue-redis/package.json`.
- `@entry` methods execute eagerly at configuration parse; a sibling
  `this.otherEntry()` call inside an entry method creates a _fresh_ instance
  (probe, 2026-10-07) rather than returning the registered bean. Wiring must
  therefore resolve collaborators through the `ApplicationContext`, as
  `ScheduleRegistry` already does (`context.getValue(TASK_SCHEDULER)`).
- Delivery-model comparison (peer frameworks): Spring has no queue of its own
  (Spring Batch/Integration are separate projects); NestJS delegates to BullMQ;
  AdonisJS ships a queue over Redis/pg-boss. The consistent framework-side
  boundary is **own the contract, wrap the backend** — the pattern this repo
  already applies three times (Zod, OpenTelemetry, preact signals).

## Decision

### D-1 — One contract package: `@blue/jobs`

`@blue/jobs` (Node platform, layer 4 beside `@blue/scheduler`) owns the job and
outbox **contracts**, the in-process reference driver, the worker engine, and
the producer facade. Backends are adapters owned by the package that owns the
underlying client — `@blue/orm-drizzle` (libSQL) and `@blue/redis` (subpath
`@blue/redis/jobs`, per AD-51). The default driver is explicitly in-process and
non-durable, exactly like the default rate limiter and the memory cache manager;
durability is opt-in by registering a durable driver bean.

### D-2 — `JobDriver` SPI: at-least-once, lease-based, crash-self-healing

```ts
interface JobDriver {
    readonly kind: string;
    enqueue(request: JobRequest): Promise<JobRecord>;
    claim(options: { limit: number; leaseMs: number }): Promise<JobRecord[]>;
    complete(id: JobId): Promise<void>;
    retry(id: JobId, runAt: number, lastError: string): Promise<void>;
    fail(id: JobId, lastError: string): Promise<void>;
    heartbeat(id: JobId, leaseMs: number): Promise<void>;
    size(): Promise<number>;
    close(): Promise<void>;
}
```

- **Attempts increment at claim.** A crashed delivery counts as an attempt; a
  reclaimed job can execute one final time when `attempts === maxAttempts`
  (at-least-once, never at-most-once).
- **Expired leases are reclaimed inside `claim`** — no recovery sweeper, no
  leader election (distributed scheduling stays deferred, AD-41; multi-worker
  safety comes from the driver's atomic claim only).
- **`fail` is terminal** and removes the job from the queue; the error is
  recorded in the execution span and `@blue/log`. Dead-letter storage/inspection
  is deliberately out of scope (a separate capability; no consumer yet).
- **Payloads are JSON.** Enqueue fails loud on non-serializable payloads
  (functions, `undefined` members, circulars). Documented as secret-free: a
  queue row is plaintext storage.

### D-3 — Producer facade `JobQueue`

`JobQueue` wraps a driver for producers: `enqueue({ type, payload, delayMs?,
runAt? , maxAttempts?, timeoutMs? })` with the default `maxAttempts` filled
in by the queue; drivers are the single normalization/validation point
(`resolveJobRequest`: `delayMs` ⇄ `runAt` exclusivity, non-finite/negative
times, attempt/timeout integers), so every backend rejects the same bad
input. Producers never see `claim`/`complete`.

### D-4 — Worker engine `JobRunner`

- Poll loop with single-flight ticks; `concurrency` slots (default 1);
  `pollIntervalMs` (default 1000) between empty ticks; immediate re-tick when
  work was claimed.
- Per-execution: `AbortSignal` timeout (`timeoutMs`), lease heartbeat at
  `leaseMs / 2`, span `jobs.job.<type>` with `job.id`/`job.type`/`job.attempt`/
  `job.outcome` attributes (the `scheduler.task.<name>` pattern).
- Retry on failure with exponential backoff (`backoffMs`, default
  `min(30s, 1s · 2^(attempt-1))`) until `attempts >= maxAttempts`, then `fail`.
  Handler options (`@jobHandler(type, { maxAttempts, timeoutMs })`) override
  request values.
- Deterministic testing seam: injected `clock()` and `tick()` (mirrors
  `TaskScheduler.tick`). `stop()` stops claiming; `close()` drains in-flight
  work and is container-visible (`likeCloseable`).

### D-5 — Discovery and zero-wiring, mirroring AD-20 D2

- `@jobHandler('type', options?)` writes `jobs:handler:<method>` metadata
  (Node-guarded at decoration like `@scheduled`).
- `JobHandlerRegistry` scans context beans at refresh (`SmartLifecycle`,
  phase 0, auto-start), binds each handler to its owner instance, and fails
  loud on: handler declared on a class (not instance), non-callable member,
  or duplicate `type`.
- `NodeAutoConfiguration` provisions `JOB_DRIVER` (`InProcessJobDriver`),
  `JOB_QUEUE`, `JOB_HANDLER_REGISTRY`, and `JOB_RUNNER`. The registry scans
  on refresh (`SmartLifecycle`, phase 0). The runner's poll loop is **not**
  refresh-started by default: a pending poll timer keeps the process alive,
  so workers call `start()` after boot (the `HTTPServer` precedent); pass
  `autoStart: true` to opt into refresh-driven start (phase 10 — after the
  registry has scanned). The runner and queue resolve collaborators from the
  `ApplicationContext` (D-5 note above: sibling entry calls are not shared
  beans); direct construction with explicit options remains the
  test/standalone path.

### D-6 — Transactional outbox: store contract + relay

```ts
interface OutboxStore {
    append(entry: { type: string; payload?: unknown }): Promise<OutboxEntry>;
    claimPending(options?: { limit?: number; leaseMs?: number }): Promise<OutboxEntry[]>;
    markPublished(id: JobId): Promise<void>;
    prunePublished(olderThanMs: number): Promise<number>;
    size(): Promise<number>;
    close(): Promise<void>;
}
```

- **`LibSQLOutboxStore` (in `@blue/orm-drizzle`) borrows the application's
  `DrizzleDataSource` client**, so an `append()` inside `@transactional` joins
  the caller's transaction on the same connection: commit ⇒ the entry is
  visible to the relay; rollback ⇒ it never existed. This is the "wired to the
  ORM UoW" requirement; `DrizzleTransactionManager` needs no change.
- **`OutboxRelay`** polls `claimPending` (lease-based: a crashed relay's claims
  become claimable again after the lease), publishes through an
  `OutboxPublisher`, then `markPublished`; `prunePublished` runs per pass when
  `retainPublishedMs` is set. Shipped publisher: `JobOutboxPublisher`, which
  enqueues the entry as a job on a `JobDriver` (outbox → durable queue, the
  canonical cross-system hand-off).
- Delivery is at-least-once end to end; handlers must be idempotent. No
  exactly-once claim is made.
- `InProcessOutboxStore` is the reference/test double (no transaction to join);
  it is honest about that in its JSDoc.

### D-7 — Backends

- `InProcessJobDriver` (`@blue/jobs`): Map + runAt ordering + lease semantics.
- `LibSQLJobStore` (`@blue/orm-drizzle`): `blue_jobs` table; claim is a single
  `UPDATE … WHERE id IN (SELECT …) RETURNING *` (atomic, mirrors the queue
  store's `RETURNING` usage). Single-connection caveat documented: a worker on
  the same client as an open `@transactional` shares the connection — run the
  runner per process with its own client/url for throughput.
- `RedisJobDriver` (`@blue/redis/jobs`): ready/lease ZSETs + record hash under
  `blue:jobs:<namespace>:*`, atomic claim/reclaim via one Lua script
  (EVAL), owned/borrowed `RedisConnection` per `RedisConnectionOptions`.

### D-8 — Observability and configuration

Spans via `@opentelemetry/api` (the repo's single instrumentation surface);
retry/terminal outcomes logged through `@blue/log` (no raw console — RES-A).
No new config-file namespace: driver/runner options are programmatic (the
`@configurationProperties` surface stays for keys with real readers, HI-5).

## Consequences

- GAP-1's "driver SPI (Redis/SQL) + outbox wired to the ORM UoW" is satisfied by
  contract + three drivers + the LibSQL outbox bridge and relay.
- `NodeAutoConfiguration` gains four beans; the runner does **not**
  self-start, so no Node app's process-liveness or shutdown behavior changes
  until it calls `JOB_RUNNER.start()` (or opts into `autoStart: true`). The
  registry's refresh scan arms no timer.
- `@blue/orm-drizzle` adds a runtime dependency on the `@blue/jobs` contract
  (it already depends on `@blue/auth-core` and `@blue/socket` for contracts);
  `@blue/redis` gains `@blue/jobs` as an optional peer (the `./cache` pattern).
  The ARCHITECTURE.md Package Map rows moved with this (the DOC-5 drift class
  stays hand-curated; there is no automated manifest↔map parity gate yet).
- Outbox consumers must be idempotent; the relay guarantees at-least-once, not
  exactly-once. This is documented in the guide and the store contracts.
- Distributed locks, leader election, cron persistence, and dead-letter
  inspection remain future ADRs (GAP-3 and friends); nothing here pre-commits
  their shape beyond the driver seam.

## References

- Review: `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 (GAP-1), §8 (Wave 6)
- Plan: `docs/plans/2026-10-07_JOBS_AND_OUTBOX.md`
- Related decisions: [AD-20](2026-09-13_AD20_SCHEDULING.md) (scheduling — trigger
  side of the same "background work" story), [AD-30](2026-09-26_AD30_ORM_MIGRATIONS.md)
  (`@blue/orm-drizzle` schema ownership), [AD-24](2026-09-17_AD24_CACHING.md)
  (contract-owns-backend pattern), [AD-40](2026-10-01_AD40_PERSISTENCE_BASELINE.md)
  (persistence backends baseline), [AD-41](2026-10-03_AD41_DISTRIBUTED_SCHEDULING_DEFERRED.md)
  (distributed coordination deferred), [AD-51](2026-02-11_AD51_SUBPATH_EXPORTS.md)
  (`@blue/redis/jobs` subpath), AD-55/AD-56 (ORM MVP + completion)
