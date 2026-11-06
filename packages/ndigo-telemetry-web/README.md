# @ndigo/telemetry-web

> Browser telemetry configuration and web instrumentations for Ndigo, built on the isomorphic [`@ndigo/telemetry`](../ndigo-telemetry/README.md) core.

`@ndigo/telemetry-web` wires OpenTelemetry into browser applications: one-call `configureBrowserTelemetry()` (tracer provider, span exporters, optional live metrics), plus instrumentations for route-change spans (`RouterInstrumentation`), client-side dispatch spans (`DispatcherInstrumentation`), and `WebSocketClient` outbound messages/bytes with deliberate-close counters (`WebSocketClientInstrumentation`). The isomorphic core carries only the OTel API packages; browser-specific wiring lives here.

## Installation

```bash
pnpm add @ndigo/telemetry-web
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { configureBrowserTelemetry, RouterInstrumentation } from '@ndigo/telemetry-web';

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
import { DispatcherInstrumentation, WebSocketClientInstrumentation } from '@ndigo/telemetry-web';

// Self-enable on construction, like RouterInstrumentation above.
new DispatcherInstrumentation(); // client-side dispatch spans
new WebSocketClientInstrumentation(); // socket outbound messages/bytes + deliberate-close counters
```

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Bootstrap** — `configureBrowserTelemetry()`
- **Instrumentations** — `RouterInstrumentation`, `DispatcherInstrumentation`, `WebSocketClientInstrumentation`

## Development

```bash
pnpm --filter @ndigo/telemetry-web build:lib
pnpm --filter @ndigo/telemetry-web test
```

## See Also

- [@ndigo/telemetry](../ndigo-telemetry/README.md) — API core: `@traced`, `@counted`, logger, severity
- [@ndigo/telemetry-node](../ndigo-telemetry-node/README.md) — the Node counterpart

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
