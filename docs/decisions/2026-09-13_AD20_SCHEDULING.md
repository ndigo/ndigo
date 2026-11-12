# AD-20: Scheduling — Nest/Adonis semantics behind a declarative decorator shape

**Date:** 2026-09-13
**Status:** Accepted — decision recorded; implementation sequenced (see
[plan](../plans/2026-09-13_SCHEDULING.md), not yet started)

## Background

Scheduled tasks are the top remaining Tier-1 gap in the framework audit
(`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §2.1): no cron, no task
executor, no background processing in any package. The trigger to fix the
gap surfaced a framing question: ndigo follows the reference framework, but the
scheduler runs on Node — so whose capabilities should it track?

Answer: **The reference framework's declarative shape, Nest/AdonisJS semantics.** The
decorator + container-managed lifecycle is excellent ergonomics and matches
the existing ndigo decorator system (TC39 `Symbol.metadata` keys, kind
guards, `@conditionalOnNode`). But the runtime semantics must match what
Node scheduling actually needs:

- **Async single-flight.** The reference `fixedRate` overlaps by default (a Java
  thread pool); NestJS and AdonisJS both default to **no overlap** because
  an async task that `await`s I/O can otherwise interleave with itself. The
  overlap lock must span the full await chain, not just dispatch.
- **Process reality.** Node processes restart constantly — in-memory
  schedules die with the process, so cron jobs are a server capability and
  there is **no catch-up** for missed runs.
- **Stuck tasks.** A task suspended in `await` never releases its
  single-flight slot. Node has no true cancellation — the answer is a
  `maxRunTime` race that releases the lock and logs, documented as
  best-effort (the task keeps running underneath).
- **Client-side scheduling is not a thing.** Browsers suspend timers, have
  no container lifecycle, and no server runtime — `@scheduled` is
  **Node-only** (D2), which changes the demo gate and adds guardrail work.

Cron evaluation itself follows the wrap-don't-reimplement doctrine:
**croner** is the pure-JS standard (5/6/7-field syntax with auto-detection,
time-zone support, `next()` API) and is what NestJS's own `@nestjs/schedule`
bundles for `@Cron` — the closest industry precedent.

## Decision

### D1 — New package `@ndigo/scheduler`

`@scheduled` is a TC39 method decorator on **any registered class** (not
just `@configuration` — controller-parked tasks are a real pattern):

```ts
import { scheduled } from '@ndigo/scheduler';

class Maintenance {
    @scheduled(cron: '*/5 * * * * *')                 // croner: 5/6/7 fields
    purge() { … }

    @scheduled({ fixedRate: '10s' })                  // or fixedDelay, ms or '5s'|'2h' strings
    @scheduled({ cron: '0 3 * * *', timeZone: 'Europe/Paris' })
    nightlyReport() { … }

    @scheduled({ fixedRate: '5s', maxRunTime: '30s' }) // stuck-task race (D4)
    tick() { … }
}
```

Surface: `@scheduled` decorator, `ScheduleRegistry` (metadata discovery +
owner-instance binding + refresh/close lifecycle), `TaskScheduler` (the
engine: next-fire computation, single-flight bookkeeping, injectable clock +
manual `tick()` for deterministic tests), `TimeZones` constants + validation
(D6). The registry resolves owner instances through the same path handler
mappings use (`setApplicationContext` + `init()` re-scan of registered
classes, `bootApp` precedent).

### D2 — Node-only

- The scheduler is provisioned by Node's platform auto-configuration: a
  `taskScheduler` entry on `NodeAutoConfiguration` (which `@ndigo/boot`
  auto-registers on the node platform). Zero-config for Node apps; nothing
  is registered in browser bundles.
- The scheduler is `Closable` for `gracefulShutdown`: stop accepting new
  runs immediately, optional in-flight drain deadline (mirrors
  `gracefulShutdown`'s `timeoutMs` philosophy).
- No catch-up after restart; schedules are declared in code, not persisted.

### D3 — Wrap croner behind a schedule seam

`CronSchedule` adapts croner (next-fire computation, 5/6/7-field syntax,
time zones). `IntervalSchedule` (fixed rate/delay) is native — milliseconds
plus a tiny duration-string parser (`'10s'`, `'2h'`). Both implement one
`Schedule` contract, so the engine never depends on a parser library.

### D4 — Execution semantics

- **Single-flight default**: a task whose previous run is still in-flight
  (await chain unresolved) is skipped for that tick — the Nest/Adonis
  default.
- **Error isolation**: per-run try/catch; failures are logged via telemetry
  and recorded in a metric/counter; one failed task never stops the
  scheduler or other tasks.
- **Observability**: one span per run (service-call telemetry pattern),
  task name + outcome attributes; a counter metric per task.
- **`maxRunTime`**: optional race — releases the single-flight lock and logs
  a warning when exceeded; the underlying task is not cancelled (Node
  reality, documented).

### D5 — Guardrails (Node-only misuse, validation)

1. **Kind guard (decoration time, any environment):** `@scheduled` on a
   non-method → `TypeError`, matching `@authenticated`'s guard.
2. **Spec validation (decoration time, any environment — runs in browser
   imports too):** invalid cron (croner parse), malformed fixed rate/delay,
   and invalid time zone (probed via `Intl.DateTimeFormat` construction —
   throws `RangeError`, wrapped in a clear `FrameworkError`) all fail at
   class-definition time.
3. **Platform guard:** the decorator throws a `FrameworkError`
   (`@scheduled is a Node-only decorator…`) when the decorating environment
   has no `process` — genuine browsers fail at import. Caveat documented:
   bundlers that polyfill `process` can evade this; the lint rule covers
   repo code, docs cover the rest.
4. **Lint rule `no-scheduled-in-browser`** (`@ndigo/oxlint-plugin`, the
   `no-signals-in-entity` pattern): flags files importing `@ndigo/scheduler`
   while importing browser-platform markers (`@ndigo/platform-web`,
   `@ndigo/view-webcomponent`) — the platform-misuse warning tier.
5. **Bind-time guard:** schedule metadata whose owner instance cannot be
   resolved from the context fails refresh with a `FrameworkError` naming
   class + method.

### D6 — Time zones: curated constants + validation, not a full enumeration

The full IANA catalog (~400 zones) is a bad `MediaTypes`-style enumeration:
it churns constantly (renames, new zones), is too large to curate by hand,
and would need generated catalogs to stay current. Instead:

- `TimeZones` — a **curated constant set of common zones** (UTC, GMT,
  US/EU/APAC anchors, ~40 entries) for autocomplete + typo safety, exactly
  the `MediaTypes` ergonomics for the 95% case.
- `isValidTimeZone(zone)` — a 2-line `Intl.DateTimeFormat` probe (it throws
  `RangeError` on invalid zones); **arbitrary strings remain accepted but
  are validated** — at decoration time for `@scheduled`, and usable by any
  formatter consumer.
- A full generated catalog remains a revisit trigger if the curated set
  proves insufficient.

### D7 — Non-goals

No distributed scheduling (no BullMQ/Redis coordination — one worker per
process; the registry keeps a small hook seam a future persistent store
adapter could implement: Adonis's DB-backed store pattern), no persistent
job store, no catch-up, no retry policies (task-layered), no job
chaining/DAGs, no cron hot-reload.

### D8 — Naming review parked (past-tense decorators)

`@scheduled`, `@authenticated`, `@authorized`, `@generated`,
`@transactional` are all past-participle/adjectival names — a deliberate
convention question (Java famously uses them too) that deserves a
consistency review before the 1.0 API freeze, not a mid-flight rename. Added
to the architecture roadmap pending items; `@scheduled` ships with the
convention documented.

> **Review completed (AD-83, 2026-10-31):** the family was assessed within
> the full decorator taxonomy — `@generated` → `@generatedColumn`; the other
> names kept, with rationale recorded in AD-83 D3.

## Consequences

- New package `@ndigo/scheduler` (node-only contract + engine), a
  `taskScheduler` entry on `NodeAutoConfiguration`, one new lint rule, and
  a demo in a Node app (the client-side `ndigo-todo` can't schedule — the
  metrics-panel `setInterval` stays as-is; `ndigo-island`'s SSE ticker
  (`setInterval`-driven) is a candidate dogfood later).
- Zero-config adoption: any Node app gets the scheduler from
  `NodeAutoConfiguration`; adding `@scheduled` to a registered class just
  works.
- Misuse is loud in three places (decoration, lint, refresh) instead of a
  silent no-op on the client.

## Sequencing

See the implementation plan:
[`docs/plans/2026-09-13_SCHEDULING.md`](../plans/2026-09-13_SCHEDULING.md) —
package + validation, registry + engine, platform integration + telemetry,
demo + lint rule + docs.

## Implementation status (2026-09-13)

**All phases landed** (plan
[`docs/plans/2026-09-13_SCHEDULING.md`](../plans/2026-09-13_SCHEDULING.md)):

- Phase 1: `@scheduled` decorator + validation (`TimeZones`/`Intl` probe).
- Phase 2: `Schedule` contract, `ScheduleRegistry`, `TaskScheduler` engine
  (injectable clock, single-flight, error isolation, `maxRunTime` race,
  drain).
- Phase 3: `ScheduleRegistry` as the container entry (aware-injected,
  auto-started on refresh, destroyed on close); `NodeAutoConfiguration`
  provisions `taskScheduler` + `scheduleRegistry`; per-run OTel spans.
- Phase 4: `no-scheduled-in-browser` lint rule (enabled), `ndigo-api`
  heartbeat demo (8 bootstrap tests), `docs/guides/05-scheduling.md`;
  plan moved to Completed.

56 scheduler + 5 rule + 8 demo tests; build 31/31, tests 36/36, lint +
manifest + format clean, graft refreshed.

## Revisit Trigger

- **Persistent/multi-process scheduling is required** (queued jobs must
  survive restarts, multiple workers) → the store/coordination seam becomes
  a real adapter (Adonis DB store / BullMQ-backed).
- **`process`-polyfilled browser builds mislead** (evasion of D5.3) →
  re-evaluate a runtime scan hook on class registration for the browser
  path.
- **The curated `TimeZones` set proves insufficient** → generate a full
  IANA catalog at build time (tzdata dependency).
- **1.0 API freeze** → the D8 past-tense naming review decides whether
  `@scheduled`/`@authenticated`/`@authorized`/`@generated`/`@transactional`
  stay or are renamed, once, before release.
- **`ndigo-island` ticker migration** → replacing its `setInterval` loop with
  `@scheduled` when the demo next changes.
