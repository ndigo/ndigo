# Blue Telemetry

> Isomorphic OpenTelemetry core for BlueJS — tracing, metrics, and logging with zero platform installation weight.

Blue Telemetry provides tracing, metrics, and logging integrations for BlueJS using OpenTelemetry. The surface is split by platform so the isomorphic core carries zero installation weight:

| Package                | Contents                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/telemetry`      | Isomorphic API core: `FeatureMetricAggregator`, `@traced`/`@counted` decorators, platform-free instrumentation bases; re-exports the logging surface from `@blue/log`. |
| `@blue/telemetry-node` | Node setup: `configureTelemetry()` (NodeSDK), `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`, `SeverityFilterLogRecordProcessor`.                |
| `@blue/telemetry-web`  | Browser setup: `configureBrowserTelemetry()`, `RouterInstrumentation`, `DispatcherInstrumentation`.                                                                    |

## Installation

```bash
pnpm add @blue/telemetry
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { SeverityNumber } from '@opentelemetry/api-logs';
import { configureTelemetry } from '@blue/telemetry-node';
import { getLogger } from '@blue/log';

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
import { counted, traced } from '@blue/telemetry';

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
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

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

- [@blue/log](../blue-log/README.md) — logging core (logger + severity) re-exported here
- [@blue/telemetry-node](../blue-telemetry-node/README.md) — Node setup
- [@blue/telemetry-web](../blue-telemetry-web/README.md) — browser setup

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
