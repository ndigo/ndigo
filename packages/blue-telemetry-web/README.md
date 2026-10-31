# @blue/telemetry-web

> Browser telemetry configuration and web instrumentations for BlueJS, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

`@blue/telemetry-web` wires OpenTelemetry into browser applications: one-call `configureBrowserTelemetry()` (tracer provider, span exporters, optional live metrics), plus instrumentations for route-change spans (`RouterInstrumentation`), client-side dispatch spans (`DispatcherInstrumentation`), and `WebSocketClient` outbound messages/bytes with deliberate-close counters (`WebSocketClientInstrumentation`). The isomorphic core carries only the OTel API packages; browser-specific wiring lives here.

## Installation

```bash
pnpm add @blue/telemetry-web
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { configureBrowserTelemetry, RouterInstrumentation } from '@blue/telemetry-web';

// Providers first — a configured traceUrl exports over OTLP/HTTP; without it
// spans go to the console exporter (dev posture).
configureBrowserTelemetry({
    serviceName: 'todo-app',
});

// Instrumentations self-enable on construction — no registration call needed.
new RouterInstrumentation();
```

## Usage

### Instrumentations

```ts
import { DispatcherInstrumentation, WebSocketClientInstrumentation } from '@blue/telemetry-web';

// Self-enable on construction, like RouterInstrumentation above.
new DispatcherInstrumentation(); // client-side dispatch spans
new WebSocketClientInstrumentation(); // socket outbound messages/bytes + deliberate-close counters
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
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
