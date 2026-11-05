# AD-73: Distributed locks — `@ndigo/locks`

**Date:** 2026-10-07
**Status:** Accepted
**Deciders:** Framework owner (GAP-3 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6; Redis-first scope selected 2026-10-07)

---

## Context

The 2026-10-07 review lists GAP-3: **distributed locks / persistent schedules**
— absent, 1.0-severity high; recommended shape "`@ndigo/locks` (Redis/PG
advisory, fencing) + `@scheduled({lock})`". Wave 6 is ADR-gated; this record is
the gate. The Wave-6 dependency cluster is GAP-3 → GAP-1 → GAP-2 — GAP-1
(durable jobs + outbox) landed as AD-72 at `d950ad5c`, so GAP-3 is next, ahead
of GAP-2 (cluster/worker offload).

What the repository already provides, and what is missing:

- **Single-executor is node-local today.** `@ndigo/scheduler` runs `@scheduled`
  methods in-process with single-flight (a task never overlaps itself) and
  drain-on-close — the guarantee holds only inside one process. Two nodes can
  run the same schedule, or one node can run it while a failover node also
  starts; nothing coordinates them.
- **Lease-based atomic claims have a verified template.** AD-72's
  `RedisJobDriver` (`packages/ndigo-redis/src/jobs/redis-job-driver.ts`) claims
  jobs with one Lua script: expire-if-dead, CAS-style reacquire, heartbeat
  renew — exactly the mechanics a distributed lock needs, minus the fencing
  half (a lock must let its holder **prove** it is still the holder).
- **The `@scheduled` extension point exists.** `ScheduledTaskDefinition`
  (`packages/ndigo-scheduler/src/task-scheduler.ts`) already carries
  `maxRunTimeMs` next to the schedule; the runner wraps each run with
  flight-slot, span, and drain semantics. A `lock` option slots into the same
  wrapper rather than into the schedule grammar itself.
- **No locks, no cluster.** GAP-2 (`ndigo serve --cluster <n>`) needs a shared
  truth for "who runs this" per task; GAP-1's `@jobHandler` needs single active
  lease-holders among workers. Locks are the shared primitive both consume —
  which is why they precede the cluster work.

## Evidence

- Redis lock primitive (SET key value PX ttl NX + Lua compare-and-delete on
  release): the industry-standard shape; `RedisConnection.run(operation)`
  (`packages/ndigo-redis/src/connection.ts`) is the owned/borrowed connection
  wrapper the driver would use, identical to AD-72's template.
- Fencing-token precedent: AD-72 increments `attempts` at claim and latches a
  terminal close — monotonically increasing per-key counters are already the
  repo's idiom for "who may act next".
- Registry discovery precedent: `ScheduleRegistry` (AD-20 D2) — `@scheduled`
  metadata written at decoration time, discovered on refresh, executed through
  the `TaskScheduler` bean. A `lock` option rides the same decoration-time
  validation path.
- Contention behavior precedent: `InProcessJobDriver` is the explicit
  non-durable default; durability is opt-in by registering a durable driver
  bean (`NodeAutoConfiguration`'s `jobDriver` family). Locks mirror this: the
  default is in-process (correct on one node), Redis is the opt-in durable
  mode.
- Peer comparison: Redis `SET NX PX` + Lua release is the common implementation
  (Redlock and its successors); AdonisJS ships a lock abstraction over
  Redis/DBs rather than a leader-election scheme. Leader-election is the
  heavier alternative and stays deferred (AD-41) — per-task locks compose
  without a global coordinator.

## Decision

### D-1 — One contract package: `@ndigo/locks`

`@ndigo/locks` (Node platform, layer 4 beside `@ndigo/scheduler`) owns the lock
**contract**, the fencing-token model, and the in-process reference driver.
Backends are adapters owned by the package that owns the client —
`@ndigo/redis/locks` (AD-51 subpath) for the Redis driver. The default driver is
explicitly in-process and non-durable, exactly like `InProcessJobDriver` and
the memory cache manager; cross-process guarantees are opt-in by registering
the Redis driver bean.

### D-2 — `LockDriver` SPI: lease-based, fencing-enabled, crash-self-healing

```ts
interface LockHandle {
    /** Monotonic fence token for this acquisition (per lock key, starts at 1). */
    readonly token: number;
    /** The lease expiry (epoch ms), observing renewals. */
    readonly expiresAt: number;
    /** Whether the lease is still valid and this handle's token still owns it. */
    isHeld(): Promise<boolean>;
    /** Extends the lease by `ttlMs`; fails when the token no longer matches. */
    renew(ttlMs: number): Promise<boolean>;
    /** Atomic token-checked release; fails when another holder took over. */
    release(): Promise<boolean>;
}

interface LockDriver {
    readonly kind: string;
    /**
     * Acquire `key` for `ttlMs`. Non-blocking: returns `null` while another
     * holder owns the lease (the caller decides to retry, skip, or bound a
     * wait).
     */
    acquire(key: string, options: { ttlMs: number }): Promise<LockHandle | null>;
    close(): Promise<void>;
}
```

- **Non-blocking by contract.** Waiting policies belong to the caller
  (`@scheduled({ lock, lockWait, lockWaitStep, lockTtl })`), never to the driver —
  the SPI stays the primitive.
- **Fencing is not optional.** Every driver issues a token at acquisition; a
  stale holder (lease expired, another node acquired) cannot `renew` or
  `release` — the backend atomically compares the token. Without this, a slow
  node could release the lock another node now holds, or extend a lease it
  lost.
- **Expired leases are simply expired.** No sweeper, no leader, no
  reclamation race: `SET NX PX` + TTL is the whole liveness model. Clock
  skew bounds the safety window (standard TTL-lease caveat, documented in the
  package README).

### D-3 — `@scheduled({ lock: 'name' })`

A new optional `lock` key on the `@scheduled` spec (decoration-time validated,
like today's cron/interval spec):

- The runner acquires `lock` (with configurable `lockWait`/`lockWaitStep` —
  shipped option names — default skip-on-contention) **before** running the
  task and releases after the run (finally-style — release in `finally`,
  never leak the lease on a throw). `lockTtl` (default 60 s) must cover the
  run; a lapsed lease lets another node take over (at-least-once posture).
- Interplay: single-flight stays per-process (a task never overlaps itself on
  one node); the lock adds the cross-process half (one node runs the task
  while others skip). Both gates run in the same before/after wrapper.
- A **locked** task that dies without release recovers via lease expiry —
  exactly AD-72's at-least-once posture.
- The schedule itself stays in-process (AD-41 stands: no distributed
  coordinator). "Persistent schedules" in the GAP-3 row means a schedule that
  survives node failover — which is what lock + scheduler composition
  provides; _storing_ schedules durably is deliberately out of scope (a
  durable work queue is GAP-1's job, delivered).

### D-4 — Wiring mirrors AD-72

`NodeAutoConfiguration` provides `lockDriver` (and, when registered, the
scheduler resolves it from the context the same way it resolves
`TASK_SCHEDULER`): zero-import single-node setup, one-bean Redis wiring for
multi-node. Anything already wired for `jobDriver` gains `lockDriver` the same
way.

### D-5 — Backends: Redis now, PG advisory documented-deferred

- `@ndigo/redis/locks` ships with AD-73's implementation: Lua script for
  acquire (`SET ... NX PX` with token) and token-checked release/renew.
- PG advisory locks need new substrate (no PG client exists in the repo;
  `@ndigo/orm-drizzle` is libSQL) and have no consumer yet — the ADR records
  the driver as a follow-up, not a commitment. This is the pushed-back
  alternative below, not a silent omission.

## Alternatives considered

- **`@scheduled({lock})` via leader election** — a single elected scheduler
  node would give one-executor without per-task locks, but it is a global
  coordinator (heavier than any consumer needs), reintroduces the AD-41
  deferral question, and cannot express per-task ownership (tasks with
  different backends/nodes). Rejected; locks compose toward GAP-2 instead.
- **PG advisory locks now** — broadens store support before any consumer;
  requires standing up a PG client + advisory-lock lifecycle (session-scoped
  locks leak on disconnect unless wrapped) that nothing else in the repo
  currently owns. Deferred with this ADR's explicit record.
- **Fenceless locks (`SET NX PX` + plain `DEL`)** — cheaper to build, but a
  stale holder's `DEL` releases a lock the successor holds: the exact
  double-run the feature exists to prevent. Rejected on the safety argument.

## Consequences

- Cross-process single-executor for `@scheduled` tasks: two nodes never run
  the same locked schedule.
- Fencing guard against slow/stale holders — the first such guarantee in the
  repo; GAP-2's cluster fan-out and GAP-1's workers both consume it later
  (`@scheduled({lock})` + `@jobHandler` lease-holder is the AD-72 → AD-73 →
  GAP-2 spine).
- Opt-in durability: single-node apps keep running with zero config; the Redis
  bean is one registration, following every prior durable-option precedent.
- Cost: TTL-lease clock-skew caveat enters the surface (documented); Redis is
  a runtime dependency only for apps that want multi-node execution.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-3 row and the
  Wave-6 dependency cluster note.
- AD-72 (durable jobs): the `RedisJobDriver` Lua-claim template and
  `NodeAutoConfiguration` bean wiring.
- AD-20 D2 (`@scheduled` registry + `TaskScheduler` single-flight).
- AD-41 (distributed scheduling deferred — unchanged; locks do not reopen it).
- AD-51 (`@ndigo/redis` subpath layout: `./cache`, `./pubsub`, `./jobs`).
