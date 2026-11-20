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

`@traced` and `@counted` **declare**; `TracedInterceptor` and
`CountedInterceptor` run. Register the two rules once, on the builder:

```ts
import { ApplicationBuilder } from '@ndigo/boot';
import { hasAnnotation, interception, MethodInterceptorRegistry } from '@ndigo/advice';
import { CountedInterceptor, countedCounter, TracedInterceptor, tracedSpan } from '@ndigo/telemetry';

const advice = new MethodInterceptorRegistry()
    .add({ when: hasAnnotation(tracedSpan), use: new TracedInterceptor() })
    .add({ when: hasAnnotation(countedCounter), use: new CountedInterceptor() });

const builder = new ApplicationBuilder([NodeAutoConfiguration]).processors(interception(advice));
```

Then decorate:

```ts
import { counted, traced } from '@ndigo/telemetry';

class ReportService {
    @traced('reports.generate')
    @counted('reports.generated')
    async generate() {
        // one span and one counter per call, once the instance is advised
    }
}
```

Both interceptors stay synchronous — they return the method's own result rather
than wrapping it in a promise, so a sync method stays sync. Hand-built objects
use the same rules through `interceptMethods(instance, rules)`.

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live in
[`src/index.ts`](src/index.ts);

- **Logging** — `getLogger`, logger abstraction with threshold filtering
- **Metrics** — `FeatureMetricAggregator`, `@counted`/`CountedInterceptor`, the metric snapshot model (`MetricSnapshot`/`MetricSnapshotProvider` registry) and the Prometheus-text / JSON renderers the management `/metrics` endpoint serves
- **Context integration** — `FEATURE_METRIC_AGGREGATOR` token and
  `FeatureMetricAggregatorAware` / `AsFeatureMetricAggregatorAware` /
  `likeFeatureMetricAggregatorAware` for receiving the aggregator registered by
  `ManagementAutoConfiguration`. `CountedInterceptor` resolves the aggregator
  from the context (or an injected `featureMetricAggregator` property) when the
  declaration does not name one explicitly.
- **Tracing** — `@traced`/`TracedInterceptor`, platform-free instrumentation bases
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
