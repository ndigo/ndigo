# Ndigo Scheduler

> Node-only scheduling for Ndigo: declarative `@scheduled` tasks behind a declarative decorator shape.

Node-only scheduling for Ndigo: a `@scheduled` method decorator, a
schedule registry, and a task-execution engine. The declarative decorator shape
with Nest/AdonisJS runtime semantics.

## Installation

```bash
pnpm add @ndigo/scheduler
```

## Getting Started

```typescript
import { scheduled } from '@ndigo/scheduler';

class Maintenance {
    @scheduled(cron: '*/30 * * * * *') // croner: 5/6/7-field syntax, auto-detected
    purge() {
        // …
    }

    @scheduled({ cron: '0 3 * * *', timeZone: 'Europe/Paris' })
    nightlyReport() {
        // …
    }

    @scheduled({ fixedRate: '10s' }) // ms numbers or '10s' | '5m' | '2h' | '1d'
    tick() {
        // …
    }

    @scheduled({ fixedRate: '5s', maxRunTime: '2m' }) // stuck-task race (releases the overlap lock + warns)
    heartbeat() {
        // …
    }
}
```

Schedules are declared on **any registered class** in a Node application.
Provisioning comes from the node platform's auto-configuration (the
`taskScheduler` entry) — no extra wiring.

## Usage

### Semantics

- **Single-flight**: a task whose previous run is still in-flight is skipped
  for that tick — the Nest/AdonisJS default.
- **Error isolation**: one failing task never stops the scheduler or other
  tasks; runs are logged and metered.
- **No catch-up**: schedules are declared in code, not persisted (single
  process; no distribution).
- **Node-only**: the decorator throws in environments without `process`.

### Guardrails

Invalid spec → throws at decoration time (bad cron, malformed durations,
unknown time zones via an `Intl` probe). Non-method application → throws.
Unresolvable owner instances fail refresh. The `no-scheduled-in-browser`
lint rule flags browser-platform files importing this package.

## API

Complete generated reference (all exports): [`api/README.md`](api/README.md).

- `@scheduled(spec)` — marks a method as a scheduled task
- `resolveScheduledSpec(spec)` — normalize + validate a spec
- `getScheduledSpec(cls, method)`, `SCHEDULED_METADATA_PREFIX` — metadata
  access (used by the registry)
- `TimeZones` — curated common IANA identifiers
- `isValidTimeZone(zone)` — `Intl`-backed validation
- `parseDuration(value)` — `'10s'`-style → milliseconds

## Development

```bash
pnpm --filter @ndigo/scheduler build:lib
pnpm --filter @ndigo/scheduler test
```

## See Also

- [@ndigo/platform-node](../ndigo-platform-node/README.md) — auto-provisions the scheduler in a Node app via its `taskScheduler` entry

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
