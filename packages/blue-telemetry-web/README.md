# @blue/telemetry-web

Browser telemetry for BlueJS — browser telemetry configuration and web
instrumentations, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

## Overview

`@blue/telemetry-web` wires OpenTelemetry into browser applications:

- **`configureBrowserTelemetry()`** — one-call browser setup: tracer
  provider, span exporters, and optional live metrics
- **Instrumentations**:
  - `RouterInstrumentation` — route-change spans for hash/feature routing
  - `DispatcherInstrumentation` — client-side dispatch spans
  - `WebSocketClientInstrumentation` — `WebSocketClient` outbound
    messages/bytes + close counters (`blue.socket.client.*`); status and
    reconnect counters wire through `countSocketClientStatus()` as the
    client's `onStatusChange` option

## Usage

```ts
import { configureBrowserTelemetry } from '@blue/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'todo-app',
    instrumentations: [...],
});
```

## Design

- **Zero SDK weight in the shared core** — `@blue/telemetry` installs only the
  OTel API packages; browser-specific wiring lives here
- Counter and span decorators (`@counted`, `@traced`) work identically on the
  web and Node sides

## Development

```bash
pnpm --filter @blue/telemetry-web build:lib
pnpm --filter @blue/telemetry-web test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — API core: `@traced`,
  `@counted`, logger, severity
- [@blue/telemetry-node](../blue-telemetry-node/README.md) — the Node
  counterpart