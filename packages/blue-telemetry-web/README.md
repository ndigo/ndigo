# @blue/telemetry-web

> Browser telemetry configuration and web instrumentations for BlueJS, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

`@blue/telemetry-web` wires OpenTelemetry into browser applications: one-call `configureBrowserTelemetry()` (tracer provider, span exporters, optional live metrics), plus instrumentations for route-change spans (`RouterInstrumentation`), client-side dispatch spans (`DispatcherInstrumentation`), and `WebSocketClient` outbound messages/bytes with deliberate-close counters (`WebSocketClientInstrumentation`). The isomorphic core carries only the OTel API packages; browser-specific wiring lives here.

## Installation

```bash
pnpm add @blue/telemetry-web
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { configureBrowserTelemetry } from '@blue/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'todo-app',
    instrumentations: [...],
});
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **Bootstrap** — `configureBrowserTelemetry()`
- **Instrumentations** — `RouterInstrumentation`, `DispatcherInstrumentation`, `WebSocketClientInstrumentation`

## Development

```bash
pnpm --filter @blue/telemetry-web build:lib
pnpm --filter @blue/telemetry-web test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — API core: `@traced`, `@counted`, logger, severity
- [@blue/telemetry-node](../blue-telemetry-node/README.md) — the Node counterpart

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
