# Blue Telemetry

> Isomorphic OpenTelemetry core for BlueJS — tracing, metrics, and logging with zero platform installation weight.

Blue Telemetry provides tracing, metrics, and logging integrations for BlueJS using OpenTelemetry. The surface is split by platform so the isomorphic core carries zero installation weight:

| Package                | Contents                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/telemetry`      | Isomorphic API core: `getLogger`, `FeatureMetricAggregator`, `@traced`/`@counted` decorators, severity mapping, platform-free instrumentation bases. Installs only `@opentelemetry/api`, `api-logs`, `instrumentation`. |
| `@blue/telemetry-node` | Node setup: `configureTelemetry()` (NodeSDK), `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`, `SeverityFilterLogRecordProcessor`.                                                                 |
| `@blue/telemetry-web`  | Browser setup: `configureBrowserTelemetry()`, `RouterInstrumentation`, `DispatcherInstrumentation`.                                                                                                                     |

## Installation

```bash
pnpm add @blue/telemetry
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { SeverityNumber } from '@opentelemetry/api-logs';
import { configureTelemetry } from '@blue/telemetry-node';
import { getLogger } from '@blue/telemetry';

configureTelemetry({
    minimumSeverity: SeverityNumber.INFO,
    instrumentations: [],
});

const logger = getLogger('example');
logger.info('telemetry initialized');
```

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

- **Logging** — `getLogger`, logger abstraction with threshold filtering
- **Metrics** — `FeatureMetricAggregator`, `@counted`
- **Tracing** — `@traced` decorator, platform-free instrumentation bases
- **Severity mapping** — utilities for `syslog`, `npm`, `apache`, and `cli`

## Development

```bash
pnpm --filter @blue/telemetry build:lib
pnpm --filter @blue/telemetry test
```

## See Also

- [@blue/telemetry-node](../blue-telemetry-node/README.md) — Node setup
- [@blue/telemetry-web](../blue-telemetry-web/README.md) — browser setup

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
