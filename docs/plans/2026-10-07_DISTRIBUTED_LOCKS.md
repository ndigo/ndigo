# 2026-10-07 Distributed locks — `@blue/locks`

**Date:** 2026-10-07
**Status:** Executed (see §8)
**Decision:** [AD-73](../decisions/2026-10-07_AD73_DISTRIBUTED_LOCKS.md)
**Scope:** GAP-3 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): distributed locks
with fencing tokens plus the `@scheduled({ lock })` single-executor contract —
Redis-first, per the ADR.

---

## 1. Problem

Single-executor holds inside one process only. `@scheduled` single-flight
prevents a task from overlapping itself **on one node**; two nodes can run
the same schedule (or a failover node can start while the primary still
runs), and nothing coordinates them. GAP-2's cluster work and GAP-1's
workers need the same primitive — a shared truth for "who runs this" — so
locks precede the cluster (the Wave-6 dependency cluster: GAP-3 → GAP-1 →
GAP-2; GAP-1 landed as AD-72).

## 2. Current state (verified 2026-10-07)

| Seam            | What exists                                                                                              | What is missing                               |
| :-------------- | :------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| Lease mechanics | AD-72's `RedisJobDriver` Lua claim/heartbeat (the atomic-claim template)                                 | fencing (token-checked release/renew)         |
| Scheduling      | `@scheduled` spec validation at decoration time (AD-20 D5.2); registry → `TaskScheduler` → single-flight | a cross-process gate in the run wrapper       |
| Wiring          | `NodeAutoConfiguration` beans (`jobDriver` family = the template)                                        | a `lockDriver` bean                           |
| Backends        | `RedisConnection` (borrowed; subpaths `./cache`, `./pubsub`, `./jobs`)                                   | a lock driver                                 |
| Contracts       | —                                                                                                        | `LockDriver`/`LockHandle` + in-process driver |

## 3. Change

1. **`@blue/locks`** (new, layer 4): `LockDriver` SPI (non-blocking acquire
   with lease TTL, fencing tokens, token-checked `renew`/`release`/`isHeld`),
   `InProcessLockDriver` (process-wide lease table = single-node truth,
   injectable clock), `LOCK_DRIVER` context token, `likeLockDriver` guard.
2. **`@blue/redis/locks`**: `RedisLockDriver` — Lua `SET NX PX` acquire with
   a per-key monotonic counter, compare-and-delete release, token-checked
   renew/verify. Borrowed connection, namespace isolation, closed-latch.
3. **`@blue/scheduler`**: `@scheduled({ lock, lockWait, lockWaitStep, lockTtl })`
   on both spec forms — decoration-time validated; the runner acquires before
   the run and releases in the `finally` (a skip on contention is logged, the
   schedule continues); fail-loud when a locked task has no driver.
4. **`@blue/platform-node`**: `NodeAutoConfiguration` `lockDriver` bean
   (in-process default, redis override), injected into `TaskScheduler` via
   `ApplicationContextAware`.

## 4. Deliberately out of scope

- PG advisory locks (new client substrate, no consumer) — recorded in the ADR.
- Durable schedule **storage** (a durable work queue is GAP-1's delivery).
- Heartbeating inside a locked run — `lockTtl` must cover the run; a lapsed
  lease lets another node take over (at-least-once posture, like the jobs
  driver).

## 5. Fencing model

Every acquisition gets a fresh monotonic token per key (Redis: `INCR`; the
counter also advances on contention, so tokens may carry gaps — only
monotonicity is promised). Only the handle whose token is current can
renew/release/verify. A stale holder can therefore never free a successor's
lease — the exact double-run the feature exists to prevent.

## 6. Verification

- `@blue/locks` (12): lifecycle, expiry, fencing, process-wide table, close
  isolation, prefixes, validation.
- `@blue/redis/locks` (7, live standalone Redis 6.2+): acquire/release/
  re-acquire across connections, fencing after expiry, renew, namespace
  isolation, closed latch.
- `@blue/scheduler` (5): run+release on consecutive fires, contended skip
  keeps the task schedulable, bounded wait, finally-release after a throw,
  fail-loud with no driver.
- `@blue/platform-node` (1 live boot): real registry → scheduler → driver
  wiring; the lease is free after a run.
- Full gate set (§9 of the review plan) incl. the spec-typecheck lane.

## 7. Docs

AD-73; guide 23 (+ guide 05 option row + guides index); companion plan +
plans index; package READMEs; ARCHITECTURE package map; CHANGELOG; generated
API docs.

## 8. Execution log (2026-10-07)

All changes landed in one pass with the verification above green:
`@blue/locks` 12/12 · `@blue/redis/locks` 7/7 (live Redis 7 in docker) ·
`@blue/scheduler` 71/71 · `@blue/platform-node` 503/503 · lint clean ·
spec-typecheck lane green · full gate set green (see the review plan's
follow-up verification). One test-design correction along the way: same-tick
fires run concurrently, so the finally-release is asserted through the driver
(an immediate external acquisition wins), not through a sibling task fire.
