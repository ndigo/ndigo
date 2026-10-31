# @blue/telemetry-node

> NodeSDK configuration and Node platform instrumentations for BlueJS, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

`@blue/telemetry-node` wires OpenTelemetry into Node applications: one-call `configureTelemetry()` NodeSDK setup (tracer provider, span/live-metric exporters — including the `'prometheus'` pull reader, AD-77, severity-filtered log processor), runtime instrumentations that produce spans for BlueJS components, and a `SeverityFilterLogRecordProcessor` that drops log records below a configured severity so production logs stay quiet. The isomorphic core carries only the OTel API packages; SDK dependencies live here on the Node side.

## Installation

```bash
pnpm add @blue/telemetry-node
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { configureTelemetry } from '@blue/telemetry-node';
import { ServerSentEventViewInstrumentation } from '@blue/telemetry-node';

configureTelemetry({
    instrumentations: [new ServerSentEventViewInstrumentation()],
});
```

## Usage

### Export tuning and teardown

```ts
import { configureTelemetry, HTTPServerInstrumentation, WebSocketServerInstrumentation } from '@blue/telemetry-node';

const sdk = configureTelemetry({
    traceExporter: { url: 'http://collector:4318/v1/traces' },
    sampler: { ratio: 0.1 }, // keep ~10% of root spans
    instrumentations: [new HTTPServerInstrumentation(), new WebSocketServerInstrumentation()],
});

await sdk?.shutdown(); // batched signals — flush before exit
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

- **Bootstrap** — `configureTelemetry()`
- **Prometheus pull** — `PrometheusMetricReader` (backed by `metricExporter: 'prometheus'`); `HTTPServerInstrumentation` records the semconv `http.server.request.duration` histogram (seconds) for every request
- **Instrumentations** — `HTTPServerInstrumentation`, `ServerSentEventViewInstrumentation`, `WebSocketServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`
- **Logging** — `SeverityFilterLogRecordProcessor`

## Development

```bash
pnpm --filter @blue/telemetry-node build:lib
pnpm --filter @blue/telemetry-node test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — API core: `@traced`, `@counted`, logger, severity
- [@blue/management](../blue-management/README.md) — serves telemetry counters over `/metrics`

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
