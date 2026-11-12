# 2026-10-07 Jobs and transactional outbox — `@ndigo/jobs`

**Date:** 2026-10-07
**Status:** Executed (see §8)
**Decision:** [AD-72](../decisions/2026-10-07_AD72_JOBS_AND_OUTBOX.md)
**Scope:** GAP-1 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): durable jobs/queues
plus a transactional outbox wired to the ORM unit of work.

---

## 1. Problem

The framework can _trigger_ background work (`@scheduled`, AD-20) but cannot
_deliver_ it: no queue, no retries out of band, no durability across restarts,
no way to tie a side effect to a database commit. Every real application
trips over the last one first: send the email inside the transaction and you
may email a rolled-back order; send it after `COMMIT` and a crash loses it.

## 2. Current state (verified 2026-10-07)

| Seam           | What exists                                                                                                                                    | What is missing              |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| Scheduling     | `@scheduled` + `TaskScheduler` (single-flight, spans, drain)                                                                                   | — (triggers only)            |
| Durable stores | `LibSQLSessionStore`, `LibSQLQueueMessageStore` in `@ndigo/orm-drizzle` (`{client?, ownsClient?, url?}` + awaited schema + idempotent dispose) | a job store                  |
| Redis          | `RedisConnection` (owned/borrowed, `run()`, drain-close); subpaths `./cache`, `./pubsub`                                                       | a job driver                 |
| Transactions   | `DrizzleTransactionManager.run()` brackets BEGIN/COMMIT/ROLLBACK on one libSQL connection; anything on that client inside `run()` joins it     | an outbox store that uses it |
| Wiring         | `NodeAutoConfiguration` + `SmartLifecycle` auto-start (`ScheduleRegistry` = the template)                                                      | job entries                  |
| Contracts      | `JobDriver`/`OutboxStore`/runner/registry                                                                                                      | everything                   |

Probe finding (2026-10-07): `@entry` methods run eagerly, and a sibling
`this.otherEntry()` call inside one returns a **fresh** instance, not the
registered entry — collaborators must be resolved through the context (the
`ScheduleRegistry` pattern).

## 3. Decisions

Recorded in AD-72. Summary: one contract package (`@ndigo/jobs`); one driver SPI
with lease-based at-least-once semantics; `JobQueue` producer facade;
`JobRunner` engine (concurrency, timeout, heartbeat, backoff, spans);
`@jobHandler` discovery mirroring `@scheduled`; outbox store contract + relay +
`LibSQLOutboxStore` on the app's data-source client; backends in
`InProcessJobDriver` (default), `LibSQLJobStore`, `RedisJobDriver`.

## 4. Architecture

```
producer ──► JobQueue ──► JobDriver ──(claim/lease)──► JobRunner ──► @jobHandler
                                ▲                                      │
                    JobOutboxPublisher ◄── OutboxRelay ◄── OutboxStore ──┘
                                                                     (append joins the
@transactional { …; outbox.append(…) } ─────────────────────────────►  caller's tx)
```

Packages:

- `@ndigo/jobs` — contracts, `InProcessJobDriver`, `InProcessOutboxStore`,
  `JobQueue`, `JobRunner`, `JobHandlerRegistry`, `OutboxRelay`,
  `JobOutboxPublisher`, `@jobHandler`, telemetry, context tokens.
- `@ndigo/orm-drizzle` — `LibSQLJobStore`, `LibSQLOutboxStore` (borrows the
  `DrizzleDataSource` client so appends join `@transactional`).
- `@ndigo/redis/jobs` — `RedisJobDriver` (atomic claim via one Lua script).
- `@ndigo/platform-node` — `JOB_DRIVER`/`JOB_QUEUE`/`JOB_HANDLER_REGISTRY`/
  `JOB_RUNNER` entries; registry phase 0 (refresh scan), runner phase 10 with
  explicit `start()` (a poll timer keeps the process alive — the HTTPServer
  precedent; `autoStart: true` opts into refresh-driven start).

## 5. Risks

- **Double execution** (lease expiry while a slow handler still runs, relay
  crash re-publish) — inherent to at-least-once; mitigated by heartbeat
  (`leaseMs/2`), documented idempotency requirement.
- **`@entry` wiring** — solved by context resolution (probe above); a regression
  test pins runner/queue resolution against a real container.
- **libSQL single connection** — outbox _must_ share it (that is the feature);
  the job store should not. Documented; guide recommends a separate
  client/url (or Redis) for worker throughput.
- **Redis Lua on older servers** — claim script uses only EVALSHA-able Lua 5.1
  primitives and sorted-set commands; tested against the repo's Redis 7 lane.
- **Scope creep** — no locks/leader election/dead-letter/CLI; those stay
  GAP-3/GAP-6 with their own ADRs.

## 6. Sequencing

| Phase | Deliverable                                                                                            | Verify                                  |
| :---- | :----------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| 0     | Package scaffold `@ndigo/jobs` (generator), tokens, types                                              | `pnpm --filter @ndigo/jobs build:lib`   |
| 1     | `InProcessJobDriver` + `JobQueue` (RED-first specs)                                                    | package tests                           |
| 2     | `@jobHandler` + `JobHandlerRegistry` + `JobRunner` (+ spans, timeout, backoff, heartbeat)              | package tests incl. deterministic clock |
| 3     | Outbox: contract + `InProcessOutboxStore` + `OutboxRelay` + `JobOutboxPublisher`                       | package tests incl. lease re-claim      |
| 4     | `LibSQLJobStore` + `LibSQLOutboxStore`; transactional rollback/commit proof                            | `@ndigo/orm-drizzle` tests              |
| 5     | `RedisJobDriver` (`@ndigo/redis/jobs`)                                                                 | Redis-gated tests (existing lane)       |
| 6     | `NodeAutoConfiguration` entries + runner/registry lifecycle; guide 22; READMEs; CHANGELOG; Package Map | full gate set (§7)                      |

## 7. Verification

```bash
pnpm build && pnpm test && pnpm lint && pnpm format:check && pnpm docs:links \
  && pnpm audit --prod && pnpm manifest:check && pnpm agents:check \
  && pnpm typecheck && pnpm doc && git diff --exit-code -- packages doc
```

Feature probes (throwaway, `/tmp`): (1) end-to-end `enqueue → runner → handler`
on the in-process driver with a real poll loop; (2) file-backed libSQL:
transactional commit ⇒ outbox row visible to the relay, rollback ⇒ absent, and
crash-recovery of a leased job after lease expiry; (3) Redis claim exclusivity
under concurrent claim calls.

## 8. Execution log (2026-10-07)

Landed in this cycle, all phases:

- **Phase 0–1** — `@ndigo/jobs` scaffolded (generator), `InProcessJobDriver`
  (runAt ordering, lease reclaim inside `claim`, attempts-at-claim, terminal
  `fail`), `JobQueue` defaults/validation.
- **Phase 2** — `@jobHandler` + `JobHandlerRegistry` (context scan, duplicate/
  ownerless/class-registered failures), `JobRunner` (single-flight tick,
  concurrency slots, abort-on-timeout, lease heartbeat, exponential backoff,
  `jobs.job.<type>` spans, `@ndigo/log` outcomes, `tick()`/`drain()` test seams).
- **Phase 3** — `OutboxStore` contract, `InProcessOutboxStore` (lease-based
  claim/reclaim), `OutboxRelay` (batch publish, `markPublished`, optional
  `prunePublished`), `JobOutboxPublisher`.
- **Phase 4** — `LibSQLJobStore` (single-statement atomic claim `RETURNING`,
  lease reclaim) and `LibSQLOutboxStore` (borrowed data-source client);
  transactional proof: `@transactional` commit publishes, rollback discards.
- **Phase 5** — `RedisJobDriver` (`@ndigo/redis/jobs`): ready/lease ZSETs +
  record hash, Lua-script atomic claim/reclaim, owned/borrowed connection.
- **Phase 6** — `NodeAutoConfiguration` entries (`jobDriver`, `jobQueue`,
  `jobHandlerRegistry`, `jobRunner`); guide 22; package READMEs (jobs, redis
  subpath, orm-drizzle); ARCHITECTURE Package Map; CHANGELOG; indexes.

Deferred (with reason): dead-letter inspection (no consumer; `fail` is terminal
and the error surfaces in the span/log), distributed locks/leader election
(AD-41 territory), CLI verbs (GAP-6), Prometheus metrics for jobs (GAP-5 track),
and a management health indicator for the runner/relay (the actuator-parity
track, GAP-4, owns that surface — the runner is introspectable through
`isRunning`/`inFlight` until then).

Related finding (out of scope, for a follow-up): `NodeAutoConfiguration`'s
`handlerMapping()` calls `this.rateLimiter()`, but sibling entry calls are not
shared entries (probe, §2) — the `rateLimiter` entry and the interceptor's limiter
are distinct instances, contradicting the "shared in-memory rate limiter" JSDoc.
