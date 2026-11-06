# Guide 05 — Scheduling

How scheduled tasks work in Ndigo: the `@scheduled` decorator, zero-wiring
discovery, execution semantics, and guardrails. Scheduling is **Node-only**.

The design: the reference framework's declarative decorator shape with Nest/AdonisJS runtime
semantics — async single-flight runs, error isolation, drain-on-close, and
no catch-up after restarts.

## 1. Quickstart

Add a `@scheduled` method to **any registered bean**, and the node platform
does the rest:

```ts
import { scheduled } from '@ndigo/scheduler';
import { configuration, entry } from '@ndigo/context';

@configuration
class HousekeepingConfiguration {
    @entry
    maintenance() {
        return new Maintenance();
    }
}

class Maintenance {
    @scheduled('*/30 * * * * *') // croner: 5/6/7 fields auto-detected
    purge() {
        /* … */
    }

    @scheduled({ cron: '0 3 * * *', timeZone: 'Europe/Paris' })
    nightlyReport() {
        /* … */
    }

    @scheduled({ fixedRate: '10s' }) // ms or '10s' | '5m' | '2h' | '1d'
    tick() {
        /* … */
    }

    @scheduled({ fixedDelay: '5m', maxRunTime: '2m' })
    pollingJob() {
        /* … */
    }
}
```

`NodeAutoConfiguration` provisions a `taskScheduler` bean and a
`scheduleRegistry` bean that:

- scans every bean's `Symbol.metadata` for `schedule:` entries at refresh,
- binds each run to its owner instance,
- wraps each run in an OpenTelemetry span,
- **auto-starts** (SmartLifecycle), and
- stops/drains on context close.

The `ndigo-api` demo ships a working heartbeat (`Heartbeat` in
`apps/05-ndigo-api/src/heartbeat.ts`).

## 2. Specs

| Spec                     | Meaning                                             | Extra                                                                                                                                      |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `cron: '*/30 * * * * *'` | croner expression — 5, 6, or 7 fields auto-detected | `timeZone` (IANA identifier)                                                                                                               |
| `{ fixedRate: '10s' }`   | every interval **from run start**                   | —                                                                                                                                          |
| `{ fixedDelay: '5m' }`   | every interval **from run completion**              | —                                                                                                                                          |
| both/formats             | `maxRunTime`                                        | caps a run; on expiry the single-flight slot is released with a warning (the task itself keeps running — Node has no cancellation)         |
| both/formats             | `lock`                                              | distributed lock key (AD-73): one node executes each fire; see `lockWait`/`lockWaitStep`/`lockTtl` and [guide 23](23-distributed-locks.md) |

Bare string shorthand: `@scheduled('*/30 * * * * *')` ≡
`@scheduled({ cron: '*/30 * * * * *' })`.

Time-zone note: cron expressions evaluate in the **system time zone** when
no `timeZone` is given — pass an explicit zone for deterministic schedules.

## 3. Semantics

- **Single-flight**: a task whose previous run is still in-flight (its await
  chain unresolved) is skipped that tick; the next fire slides forward.
- **Error isolation**: one failing task never stops the scheduler or other
  tasks. Failures are recorded in the task stats and on the run's span.
- **No overlap by default** — the Nest/AdonisJS default, not the reference framework's
  thread-pool overlap.
- **No catch-up**: schedules are declared in code, single-process, and
  restart with the process.
- **Drain on close**: `close()`/context teardown stops new runs and awaits
  in-flight ones.

## 4. Observability

Every run produces an INTERNAL span `scheduler.task.<name>` with
`task.name`, `task.outcome` (`success` | `error`), and `task.duration_ms`;
failed runs carry `recordException` + ERROR status. Stats (`runs`,
`failures`, `lastError`, `inFlight`) are available per task through the
scheduler.

```ts
const scheduler = context.getValue<TaskScheduler>('taskScheduler');
scheduler.getStats('maintenance.purge'); // → { runs, failures, inFlight, … }
```

## 5. Guardrails

| Where      | Behavior                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Decoration | non-method → `TypeError`; invalid cron/duration/time zone → throws                                           |
| Platform   | no `process` (browser) → `FrameworkError`                                                                    |
| Refresh    | `@scheduled` class registered as a prototype (no instance) → `FrameworkError`                                |
| Lint       | `no-scheduled-in-browser` flags `@ndigo/scheduler` imports in files also importing browser-platform packages |

## 6. HTTP example

Scheduling integrates with the dispatcher like any bean — controllers park
tasks too:

```ts
import { requestMapping, getMapping } from '@ndigo/dispatcher';
import { scheduled } from '@ndigo/scheduler';

@requestMapping('/reports')
class ReportController {
    @getMapping('/daily')
    daily() {
        return { generatedAt: new Date() };
    }

    @scheduled({ cron: '0 6 * * *', timeZone: 'UTC' })
    warmCache() {
        // prime the daily report cache before users wake up
    }
}
```

## See also

- [scheduling decision](../../docs/decisions/2026-09-13_AD20_SCHEDULING.md)
- [Implementation plan](../../docs/plans/2026-09-13_SCHEDULING.md)
- [ndigo-api demo](../../apps/05-ndigo-api/README.md) — the heartbeat task
- [`@ndigo/scheduler`](../../packages/ndigo-scheduler/README.md) — package surface
