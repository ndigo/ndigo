# Scheduling — @scheduled decorator, registry, engine, and guardrails

**Date:** 2026-09-13
**Status:** Completed — all phases landed (2026-09-13)
**Packages:** `@blue/scheduler` (new — node-only), `@blue/platform-node`
(`taskScheduler` entry), `@blue/oxlint-plugin` (new rule), `apps/blue-api`
(demo gate), `@blue/telemetry` (run spans)
**Depends on:** AD-20, existing decorator/lifecycle patterns
(`@configuration`/`@entry` metadata keys, `@conditionalOnNode`,
`LifecycleProcessor`, `Closable`)

---

## 1. Motivation

Scheduling is the last Tier-1 gap from the framework audit with a clean
decorator-shaped landing spot. Per AD-20: Spring's declarative
decorator + container-managed lifecycle, Nest/AdonisJS runtime semantics
(async single-flight, no catch-up, drain-on-close), croner behind a
schedule seam, `TimeZones` as curated constants + `Intl` validation,
Node-only with three-tier misuse guardrails.

## 2. Design

### 2.1 `@blue/scheduler` — surface

```ts
// croner: 5/6/7-field accepted, timeZone via croner or explicit option
@scheduled(cron: '*/5 * * * * *')
@scheduled({ cron: '0 3 * * *', timeZone: 'Europe/Paris' })
@scheduled({ fixedRate: '10s' })     // number = ms; '10s'|'5m'|'2h' strings
@scheduled({ fixedDelay: 5_000 })
@scheduled({ fixedRate: '10s', maxRunTime: '2m' })

class AnyRegisteredClass {
    @scheduled(/* one spec per method */)
    async run() { … }
}
```

- `scheduled(spec)` — method decorator; writes `schedule:<name>` into
  `Symbol.metadata` (the `@entry`/`@authenticated` pattern). One spec per
  method; stacking two specs throws (a method has one schedule).
- `Schedule` contract: `{ next(after: Date, now: () => Date): Date | null }`.
  `CronSchedule` adapts croner; `IntervalSchedule` (rate/delay) is native.
- `ScheduleRegistry` — discovers `schedule:` metadata on registered classes
  (the `handlerMapping.setApplicationContext(context) + init()` re-scan
  pattern), binds owner instances, validates at bind time (D5.5), and owns
  refresh/close hooks (`LifecycleProcessor.onRefresh/onClose`).
- `TaskScheduler` — the engine: a pending queue keyed by task, next-fire
  computation, single-flight bookkeeping, injectable `clock` (function) +
  manual `tick(now)` for deterministic tests, `drain()`/`close()`.
  `Closable` via `close()`. Registered as context value `taskScheduler`.
- `TimeZones` — curated common-zone constants + `isValidTimeZone(zone)`
  (`Intl.DateTimeFormat` probe).

### 2.2 Guardrails (AD-20 D5)

| Tier            | Where                 | Behavior                                                                                                                                      |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind guard      | decorator             | non-method → `TypeError`                                                                                                                      |
| Spec validation | decorator             | bad cron (croner parse), malformed duration, invalid TZ (Intl probe → `FrameworkError`) — runs in any importing env, browser included         |
| Platform guard  | decorator             | no `process` → `FrameworkError` ('@scheduled is a Node-only decorator…')                                                                      |
| Lint rule       | `@blue/oxlint-plugin` | `no-scheduled-in-browser`: imports `@blue/scheduler` + browser-platform imports (`@blue/platform-web`, `@blue/view-webcomponent`) in one file |
| Bind guard      | refresh               | unresolvable owner instance → `FrameworkError` naming class + method                                                                          |

### 2.3 Node integration

`NodeAutoConfiguration` gains `@entry taskScheduler()` (conditional on node
via the existing auto-registration path, zero-config for Node apps —
browser bundles never touch the package). Run execution wraps each task in
an OTel span + counter metric via `@blue/telemetry` (the `blue-service`
telemetry-hooks pattern).

### 2.4 Execution semantics

- Single-flight per task: in-flight = dispatch until the await chain
  resolves; overlap → skip tick.
- Errors: per-run try/catch → log + metric; scheduler unaffected.
- `maxRunTime`: race the run, release the lock + warn on timeout;
  cancellation is best-effort (documented Node reality).
- `close()`: stop new runs, await in-flight up to a drain deadline.

## 3.5 Implementation status — Phase 1 (2026-09-13)

**Package + validation — Done.**

1. `@blue/scheduler` scaffolded (manifest/tsconfigs per conformance rules),
   croner `^10.0.1` added, vitest alias wired. Noted: croner validates cron
   expressions at construction but **silently accepts garbage time zones** —
   confirming the AD-20 D6 `Intl` probe requirement.
2. `spec.ts` (`ScheduledSpec`/`CronScheduleSpec`/`IntervalScheduleSpec`/
   `NormalizedScheduledSpec`, `parseDuration` for `'10s'`-style strings),
   `scheduled.ts` (`@scheduled` with croner-backed cron validation, duration
   validation, `Intl` time-zone probe, `TypeError` kind guard, FrameworkError
   platform guard, `Symbol.metadata` storage, `getScheduledSpec` reader);
   13 decorator/spec tests.
3. `time-zones.ts` (`TimeZones` curated ~50 common zones, frozen nested
   groups, `isValidTimeZone` via `Intl.DateTimeFormat` probe); 9 tests
   across both files. README written.

Verification: build 31/31 (new package in nx), tests 36/36 (22 new), lint +
manifest + format clean, graft refreshed.

## 3.6 Implementation status — Phase 2 (2026-09-13)

**Registry + engine — Done.**

4. `schedule.ts` — `Schedule` contract (`kind` + `intervalMs` +
   `next(after)`), `CronSchedule` (croner adapter — construction validates via
   wrapped `TypeError`; documented system-time-zone default when no `timeZone`
   is given), `IntervalSchedule` (start/end-anchored kinds, positive-interval
   guard), `scheduleFromSpec`; 11 tests (5/6/7-field detection, time-zone
   shift, malformed rejection).
5. `schedule-registry.ts` — `ScheduleRegistry` scans `Object.keys(context)`
   bean values (handler-mapping scan model), binds each `schedule:<method>`
   to its owner instance, names tasks `<bean>.<method>`, fails loudly on
   `@scheduled` classes registered as prototypes (AD-20 D5.5 — note: the
   context proxies class values, so the guard is exercised through
   raw-value contexts), and `close()` unregisters its tasks; 6 tests.
6. `task-scheduler.ts` — `TaskScheduler`: injectable clock + manual
   `tick(now)`, single-flight skip with next-fire slide, per-run error
   isolation (`failures`/`lastError` stats), `maxRunTime` race that releases
   the slot + warns without cancelling, `start()`/`stop()` timer loop
   (`NodeJS.Timeout`), `close()` drain; 8 tests.

Behavioral notes locked in by tests: cron next-run timing defaults to the
system time zone (croner) — explicit `timeZone` gives determinism;
`fixedDelay` completion anchor reads the injected clock.

Verification: build 31/31, tests 36/36 (47 scheduler tests),
lint + manifest + format clean, graft refreshed.

## 3.7 Implementation status — Phase 3 (2026-09-13)

**Platform integration + telemetry — Done.**

7. **`NodeAutoConfiguration` wiring — DONE.** `taskScheduler()` and
   `scheduleRegistry()` entries. `ScheduleRegistry` is the container bean:
   context-injected (`ApplicationContextAware`), **auto-started on refresh**
   (`SmartLifecycle` — the factory's `DefaultLifecycleProcessor` runs it),
   stopped on close, `destroy()`ed at teardown. Zero-config: any
   `@scheduled` bean registered before refresh just runs. `@blue/scheduler`
   became a platform-node peer dep. Integration test in platform-node:
   auto-start + discovery + deterministic tick execution (2 tests).
8. **Per-run telemetry — DONE.** `instrumentTask` wraps each run in an
   INTERNAL span (`scheduler.task.<name>`; `task.name`, `task.outcome`,
   `task.duration_ms` attrs; `recordException` + ERROR status on failure),
   using `startSpan` + explicit `end` — the SSE instrumentation pattern
   (`startActiveSpan`'s async-callback semantics are unreliable on
   rejection). `@opentelemetry/api` added as a dependency (no
   `@blue/telemetry` peer dep needed — the scheduler emits spans directly,
   a simplification vs the original plan). 2 telemetry tests (success +
   failure spans) with the `InMemorySpanExporter` harness (one provider per
   describe — the OTel API caches tracers against the first global
   provider).

Also fixed: the registry's manual scan is named `scan`, **not `init`** —
the DI container auto-invokes `init` on any bean implementing that shape
(Initializable), which collided at registration.

Verification: build 31/31, tests 36/36, lint + manifest + format clean,
graft refreshed.

## 3.8 Implementation status — Phase 4 (2026-09-13)

**Demo, lint rule, docs — Done.**

9. `@blue/oxlint-plugin` `no-scheduled-in-browser` rule — flags
   `@blue/scheduler` imports alongside browser-platform imports
   (`@blue/platform-web`, `@blue/view-webcomponent`), registered + enabled;
   5 rule tests.
10. `apps/blue-api` demo gate — `Heartbeat` bean (`@scheduled
    '*/30 * * * * *'`) auto-discovered + auto-started through the real
    ApplicationBuilder path; 8 bootstrap tests including deterministic
    scheduler ticks + real bean invocation.
11. `docs/guides/05-scheduling.md` (quickstart, specs, semantics,
    observability, guardrails, HTTP example); guides index; audit §2.1
    scheduling row marked IMPLEMENTED; apps README note.

## 3. Implementation steps

### Phase 1 — Package + validation

1. Scaffold `packages/blue-scheduler/` (manifest/tsconfig per conformance
   rules), add `croner` dependency, workspace install, vitest alias.
2. `spec.ts` (`ScheduledSpec` type + narrowers), duration-string parser
   (`'10s'`, `'5m'`, `'2h'`, ms numbers), `scheduled()` decorator with kind
   guard + spec validation (cron via croner parse, duration parse, TZ via
   Intl probe) + platform guard (`typeof process`); tests: every invalid
   spec throws with a clear message; valid specs write metadata; browser
   (no-process) decorator application throws.
3. `time-zones.ts`: `TimeZones` constants (~40) + `isValidTimeZone`; tests
   (UTC/GMT/region anchors valid; 'Bogus/Zone' false; arbitrary string
   policy).

### Phase 2 — Registry + engine

4. `schedule.ts`: `Schedule` contract, `CronSchedule` (croner adapter),
   `IntervalSchedule`; tests: next-fire matrix (5/6-field, TZ option,
   DOW/DOM conventions via croner), fixed-rate/delay alignment, injectable
   clock.
5. `schedule-registry.ts`: metadata scan over registered classes (mirror
   handler-mapping scan), owner-instance binding via context
   (`setApplicationContext` + `init()` pattern), bind-time validation,
   refresh/close hooks; tests: discovery, instance binding, unresolvable
   owner throws.
6. `task-scheduler.ts`: engine with injectable clock + manual `tick(now)`,
   single-flight bookkeeping, error isolation, `maxRunTime` race, drain +
   `close()`; tests: fake-clock fire matrix, overlap-skip, failing task
   doesn't stop others, maxRunTime releases lock, close drains.

### Phase 3 — Platform integration + telemetry

7. `NodeAutoConfiguration.taskScheduler()` entry + registry wiring;
   bootApp/`bootApp`-style integration tests (scheduled class registered →
   ticks after refresh).
8. Run span + counter metric per task (`@blue/telemetry` peer dep, the
   service-call span pattern); tests: mock OTel provider captures span +
   task outcome attributes.

### Phase 4 — Demo, lint rule, docs

9. `@blue/oxlint-plugin`: `no-scheduled-in-browser` rule + rule tests
   (fixture: scheduled import + platform-web import → reported).
10. Demo gate — `apps/blue-api`: a `@scheduled(cron: '*/30 * * * * *')`
    heartbeat logging via telemetry; integration test asserts the heartbeat
    fires (registry `tick` with fake clock) and a real server boot registers
    it.
11. Docs: `docs/guides/05-scheduling.md` (quickstart, cron syntax, TZ,
    semantics, guardrails); AD-20 cross-links; audit §2.1 scheduling row
    marked planned; roadmap pending items (D8 naming review + TimeZones
    follow-up).
12. Full gates: build, test, lint, format, manifest, graft rebuild; plan →
    Completed.

## 4. Acceptance criteria

1. `@scheduled` on any registered class schedules a run; cron + fixed
   rate/delay both work with injectable-clock determinism.
2. Single-flight: an in-flight task at tick time is skipped; a failed task
   never affects other tasks or the scheduler.
3. Node apps get the scheduler from `NodeAutoConfiguration` with zero extra
   wiring; browser builds contain no scheduler code.
4. All five guardrails are tested: wrong kind, invalid cron/duration/TZ,
   browser-platform decorator use, lint rule fixture, unresolvable owner.
5. Every run produces a span + counter metric.
6. `apps/blue-api` boots with a scheduled heartbeat and the heartbeat fires;
   full workspace build/test/lint/format/manifest clean; graft refreshed.

## 5. Non-goals (AD-20 D7)

No distributed scheduling, persistent store, catch-up, retries, DAGs, or
cron hot-reload. The registry keeps a documented hook seam for a future
store adapter.
