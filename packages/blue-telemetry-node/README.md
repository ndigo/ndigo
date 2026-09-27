# @blue/telemetry-node

> NodeSDK configuration and Node platform instrumentations for BlueJS, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

`@blue/telemetry-node` wires OpenTelemetry into Node applications: one-call `configureTelemetry()` NodeSDK setup (tracer provider, span/live-metric exporters, severity-filtered log processor), runtime instrumentations that produce spans for BlueJS components, and a `SeverityFilterLogRecordProcessor` that drops log records below a configured severity so production logs stay quiet. The isomorphic core carries only the OTel API packages; SDK dependencies live here on the Node side.

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

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **Bootstrap** — `configureTelemetry()`
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
