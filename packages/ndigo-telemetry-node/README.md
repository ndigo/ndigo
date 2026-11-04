# @ndigo/telemetry-node

> NodeSDK configuration and Node platform instrumentations for Ndigo, built on the isomorphic [`@ndigo/telemetry`](../ndigo-telemetry/README.md) core.

`@ndigo/telemetry-node` wires OpenTelemetry into Node applications: one-call `configureTelemetry()` NodeSDK setup (tracer provider, span/live-metric exporters — including the `'prometheus'` pull reader, AD-77, severity-filtered log processor), runtime instrumentations that produce spans for Ndigo components, and a `SeverityFilterLogRecordProcessor` that drops log records below a configured severity so production logs stay quiet. The isomorphic core carries only the OTel API packages; SDK dependencies live here on the Node side.

## Installation

```bash
pnpm add @ndigo/telemetry-node
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { configureTelemetry } from '@ndigo/telemetry-node';
import { ServerSentEventViewInstrumentation } from '@ndigo/telemetry-node';

configureTelemetry({
    instrumentations: [new ServerSentEventViewInstrumentation()],
});
```

## Usage

### Export tuning and teardown

```ts
import { configureTelemetry, HTTPServerInstrumentation, WebSocketServerInstrumentation } from '@ndigo/telemetry-node';

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
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Bootstrap** — `configureTelemetry()`
- **Prometheus pull** — `PrometheusMetricReader` (backed by `metricExporter: 'prometheus'`); `HTTPServerInstrumentation` records the semconv `http.server.request.duration` histogram (seconds) for every request
- **Instrumentations** — `HTTPServerInstrumentation`, `ServerSentEventViewInstrumentation`, `WebSocketServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`
- **Logging** — `SeverityFilterLogRecordProcessor`

## Development

```bash
pnpm --filter @ndigo/telemetry-node build:lib
pnpm --filter @ndigo/telemetry-node test
```

## See Also

- [@ndigo/telemetry](../ndigo-telemetry/README.md) — API core: `@traced`, `@counted`, logger, severity
- [@ndigo/management](../ndigo-management/README.md) — serves telemetry counters over `/metrics`

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
