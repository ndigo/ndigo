# Ndigo Telemetry

> Isomorphic OpenTelemetry core for Ndigo — tracing, metrics, and logging with zero platform installation weight.

Ndigo Telemetry provides tracing, metrics, and logging integrations for Ndigo using OpenTelemetry. The surface is split by platform so the isomorphic core carries zero installation weight:

| Package                 | Contents                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ndigo/telemetry`      | Isomorphic API core: `FeatureMetricAggregator`, `@traced`/`@counted` decorators, platform-free instrumentation bases; re-exports the logging surface from `@ndigo/log`. |
| `@ndigo/telemetry-node` | Node setup: `configureTelemetry()` (NodeSDK), `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`, `SeverityFilterLogRecordProcessor`.                 |
| `@ndigo/telemetry-web`  | Browser setup: `configureBrowserTelemetry()`, `RouterInstrumentation`, `DispatcherInstrumentation`.                                                                     |

## Installation

```bash
pnpm add @ndigo/telemetry
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```typescript
import { SeverityNumber } from '@opentelemetry/api-logs';
import { configureTelemetry } from '@ndigo/telemetry-node';
import { getLogger } from '@ndigo/log';

configureTelemetry({
    minimumSeverity: SeverityNumber.INFO,
    instrumentations: [],
});

const logger = getLogger('example');
logger.info('telemetry initialized');
```

## Usage

### Tracing and counting your own code

```ts
import { counted, traced } from '@ndigo/telemetry';

class ReportService {
    @traced('reports.generate')
    @counted('reports.generated')
    async generate() {
        // one span and one counter per call
    }
}
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Logging** — `getLogger`, logger abstraction with threshold filtering
- **Metrics** — `FeatureMetricAggregator`, `@counted`, the metric snapshot model (`MetricSnapshot`/`MetricSnapshotProvider` registry) and the Prometheus-text / JSON renderers the management `/metrics` endpoint serves (AD-77)
- **Tracing** — `@traced` decorator, platform-free instrumentation bases
- **Severity mapping** — utilities for `syslog`, `npm`, `apache`, and `cli`

## Development

```bash
pnpm --filter @ndigo/telemetry build:lib
pnpm --filter @ndigo/telemetry test
```

## See Also

- [@ndigo/log](../ndigo-log/README.md) — logging core (logger + severity) re-exported here
- [@ndigo/telemetry-node](../ndigo-telemetry-node/README.md) — Node setup
- [@ndigo/telemetry-web](../ndigo-telemetry-web/README.md) — browser setup

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
