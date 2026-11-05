# AD-41: Distributed scheduling — deferred on evidence, no adapter

**Date:** 2026-10-03
**Status:** Accepted — Phase 4 decision of [shared persistence roadmap](../plans/2026-10-01_SHARED_PERSISTENCE_ROADMAP.md); no scheduler adapter built.

## Scope distinction (roadmap Phase 4)

Three capabilities are not interchangeable and were evaluated separately:

- **(a) Schedule definition persistence** — survive redeploys; the current engine derives schedules from code at refresh and has no persisted definitions.
- **(b) Durable queued executions / retries** — jobs that survive restarts and can be retried; a real queue with storage semantics.
- **(c) Distributed leader / single-flight coordination** — at-most-one worker executes a shared scheduled task (multi-process singleton).

## Evidence

Every real `@scheduled` consumer in this repository is a per-node demo:

- `apps/ndigo-api` `Heartbeat.ping` — `*/30 * * * * *`, increments a per-process counter.
- `apps/ndigo-api` `ChatController.chatTick` / `StompChatController.chatTick` — `*/2 * * * * *`, per-node WebSocket/STOMP broadcast; cross-node fan-out is already owned by the Phase 3 `SocketFanout` seam, which is the correct mechanism for that intent, not a scheduler lease.
- The engine (`TaskScheduler`) already documents the single-flight, `maxRunTime` release-without-cancel, fire-vs-end-anchored advance, drain-on-close and no-catch-up semantics (AD-20 D4/D7), and the registry intentionally never persisted anything.

No consumer demands queued jobs that must survive restarts, multi-worker execution, or a global singleton; AD-20's revisit trigger ("persistent/multi-process scheduling is required") has not fired. Building BullMQ/Redis coordination or a durable job store now would be speculative generality with real operational cost (leases, recovery, ordering, idempotency), violating the roadmap's no-universal-job-queue non-goal.

## Decision

**Defer Phase 4 with an explicit decision, delivering no adapter.** The roadmap acceptance for Phase 4 is conditional ("if the ADR selects scope"); this ADR selects no scope, so the conditional acceptance is closed as not-applicable. The existing in-process scheduler remains the only scheduler and the default.

Revisit triggers (any one fires → reconsider with a concrete design):

- A real multi-worker deployment must run one task at-most-once per schedule.
- Queued jobs must survive restart/redeploy or require retry policy.
- Schedule definitions must be deployable without a code change.
- A second independent process must observe/cancel a running task.

If triggered, the precedent is the AD-20 hook seam plus the `@ndigo/redis` connection/lifecycle and `@ndigo/orm-drizzle` SQL-store patterns already landed; BullMQ is only justified if the requirement specifically needs its queue semantics.

## References

- Roadmap Phase 4: `docs/plans/2026-10-01_SHARED_PERSISTENCE_ROADMAP.md`
- Scheduler design: [AD-20](2026-09-13_AD20_SCHEDULING.md) (D1–D8, revisit triggers)
- Scheduling guide: `docs/guides/05-scheduling.md`
