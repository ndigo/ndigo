# @blue/telemetry-node

Node.js telemetry for BlueJS — NodeSDK configuration and Node platform
instrumentations, built on the isomorphic [`@blue/telemetry`](../blue-telemetry/README.md) core.

## Overview

`@blue/telemetry-node` wires OpenTelemetry into Node applications:

- **`configureTelemetry()`** — one-call NodeSDK setup: tracer provider,
  span/live-metric exporters, and the severity-filtered log processor
- **Instrumentations** — runtime patches that produce spans for BlueJS
  components:
  - `HTTPServerInstrumentation` — HTTP request spans (method, route, status)
  - `ServerSentEventViewInstrumentation` — SSE stream-lifetime spans with
    frame counts, duration, and client-disconnect flags (`sse.*` attributes)
  - `WebSocketServerInstrumentation` — socket session-lifetime spans +
    counters: sessions opened/closed (path, close code), fan-out
    messages/bytes (path/room), backpressure overflows (`blue.socket.*`)
  - `HTTPResponseViewTargetInstrumentation` — view-commit spans
- **`SeverityFilterLogRecordProcessor`** — drops log records below a
  configured severity so production logs stay quiet

## Usage

```ts
import { configureTelemetry } from '@blue/telemetry-node';
import { ServerSentEventViewInstrumentation } from '@blue/telemetry-node';

configureTelemetry({
    instrumentations: [new ServerSentEventViewInstrumentation()],
});
```

## Design

- **Isomorphic core** — `@blue/telemetry` carries only the OTel API packages;
  SDK dependencies live here, on the Node side
- **Span scope is sound** — producer-contract views wrap the consumed stream
  body, so frames/duration are measured at true stream end, aborts included

## Development

```bash
pnpm --filter @blue/telemetry-node build:lib
pnpm --filter @blue/telemetry-node test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — API core: `@traced`,
  `@counted`, logger, severity
- [@blue/management](../blue-management/README.md) — serves telemetry counters
  over `/metrics`