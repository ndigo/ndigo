# @blue/telemetry-lab — Blue Telemetry Lab

> A browser action opens a client span, propagates it as W3C `traceparent`, the
> server continues the trace and instruments the handler, a scheduled task emits
> its own spans and counters, and a socket pushes the metric snapshot back to the
> page — exported to the console, or to an OTLP collector when
> `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

One Node process and one page on port 3090 show the whole observability journey.
The server is a plain `@blue/platform-node` app: `@blue/telemetry-node`'s
`configureTelemetry` wires the OTel SDK (HTTP server, WebSocket server, and
dispatcher instrumentations), `@blue/management` serves `/health` and
`/metrics`, `@scheduled` (AD-20) drives the periodic work, and a `@socketMapping`
endpoint plus the session registry push snapshots to connected clients (AD-21).
The page is a Vite bundle that configures the browser providers
(`@blue/telemetry-web`), traces its own actions through `@blue/http`'s
`TraceHeaderInterceptor`, and subscribes with `@blue/socket`'s
`WebSocketClient`.

## Run

### Console mode (default)

```bash
cd apps/17-blue-telemetry-lab && pnpm start:full     # builds the client, then boots
# listening on http://localhost:3090
```

`pnpm build:client` + `pnpm start` is the same thing in two steps. `pnpm start`
alone still boots and serves every route without the bundle, but the asset
request fails loudly (`GET /static/client.js` → `500` while the `dist/`
directory is absent; a missing _file_ under an existing root is a `404`), so run
`pnpm start:full` — or `pnpm build:client` once — before opening the page.
Override the port with `PORT=<n>`.

Default postures: spans to the **console** exporter, logs through the OTel
**console** log exporter (so app log lines carry `traceId`/`spanId` when a span
is active), metrics to the **console** every 60 s, and the browser's spans to the
browser's own console. Nothing is named unless you say so: without
`OTEL_SERVICE_NAME` the resource reports `unknown_service:<node path>` (the SDK
default), and with it the resource carries your name:

```bash
OTEL_SERVICE_NAME=blue-telemetry-lab PORT=3090 pnpm start
```

### Collector mode

```bash
docker run --rm -p 4318:4318 -p 55679:55679 otel/opentelemetry-collector:latest
```

```bash
cd apps/17-blue-telemetry-lab
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME=blue-telemetry-lab \
BLUE_TELEMETRY_BROWSER_TRACE_URL=http://localhost:4318/v1/traces \
PORT=3090 pnpm start
```

- `OTEL_EXPORTER_OTLP_ENDPOINT` switches **all three** signals to
  `<endpoint>/v1/{traces,metrics,logs}`. The server console then goes quiet —
  there is no "console and OTLP" mode server-side, so read the collector
  (`docker logs -f <container>`, or zPages on :55679).
- `BLUE_TELEMETRY_BROWSER_TRACE_URL` is the collector trace URL the **page**
  uses (`/lab/config` serves it to the browser). A custom receiver must answer
  the browser's CORS preflight; the stock image already does, and the CSP is
  widened for that origin automatically.
- The SDK is shut down on `SIGINT`/`SIGTERM` (`gracefulShutdown`), so the last
  batch — including the server's `HTTPServer.close` span and the metrics reader —
  is flushed instead of dropped (guide 10 §6).

## What to look for

### Span names

| Span                                    | Side    | Notes                                                                      |
| :-------------------------------------- | :------ | :------------------------------------------------------------------------- |
| `lab.client.<get\|post>.work`           | browser | one per action; the root of the trace                                      |
| `HTTPServer.handleRequest`              | server  | `SERVER` kind; its parent is the browser's span (`isRemote: true`)         |
| `Dispatcher.dispatch`                   | server  | `INTERNAL`, carries `route.path` / `http.route`                            |
| `lab.work.compute`                      | server  | `@traced` on the work service — nests under the request that caused it     |
| `lab.ticker.tick`                       | server  | `@traced` on the `@scheduled` ticker — a **root** span (no request around) |
| `scheduler.task.<bean>.<method>`        | server  | `@blue/scheduler`'s own task spans, with `task.outcome`                    |
| `SocketSession.connect`                 | server  | `WebSocketServerInstrumentation`                                           |
| `HTTPServer.start` / `HTTPServer.close` | server  | server lifecycle                                                           |

### Trace continuation

The browser panel and the server console show the same trace from both sides —
`lab.client.get.work` is the parent of `HTTPServer.handleRequest`, which is the
parent of the handler's work span:

```console
# browser panel ("Server replies — trace continuation")
GET /work checksum=135358495 (0.006 ms, ticks=29) · server trace=f1db1604e4f0f8491d4457998cf72096 span=358dd225d098ee14 · continuation ✓

# server console (console span exporter)
  traceId: 'f1db1604e4f0f8491d4457998cf72096',
  parentSpanContext: {
    traceId: 'f1db1604e4f0f8491d4457998cf72096',
    spanId: 'ac61544e09e83a42',          # the browser span, from the traceparent
    traceFlags: 1,
    isRemote: true
  },
  name: 'HTTPServer.handleRequest',      # SERVER span — continues the caller's trace
  kind: 1,
  attributes: { 'http.request.method': 'GET', 'url.path': '/work', 'http.response.status_code': 200 }
```

With a collector, both halves land in the **same trace**, one span from each
`service.name` (`docker logs` / your backend):

```text
004-v1-traces.json [blue-telemetry-lab]     HTTPServer.handleRequest span=26e4953efdaf874c parent=5a3230b5a15cf36d kind=2
004-v1-traces.json [blue-telemetry-lab]     Dispatcher.dispatch       span=07e0a9b9d5ef205f parent=26e4953efdaf874c
004-v1-traces.json [blue-telemetry-lab]     lab.work.compute          span=c0ea54258c104132 parent=07e0a9b9d5ef205f
006-v1-traces.json [blue-telemetry-lab-web] lab.client.get.work       span=5a3230b5a15cf36d parent=-
```

(`kind=2` is `SERVER`; the browser span is the `parent` of the server span.)

### Metrics — one event, two views

- **push** — `@counted` records OpenTelemetry counters that the configured
  metric reader exports: `telemetry-lab.work.requests`,
  `telemetry-lab.scheduled.ticks`, `telemetry-lab.socket.pushes`. Console mode
  shows them once a minute:

    ```console
    { descriptor: { name: 'telemetry-lab.scheduled.ticks', type: 'COUNTER', … },
      dataPointType: 3,
      dataPoints: [ { attributes: {}, startTime: […], endTime: […], value: 12 } ] }
    ```

- **pull** — `GET /metrics` (AD-32's `FeatureMetricAggregator` behind
  `@blue/management`) serializes the same observations as a feature:

    ```console
    $ curl -s localhost:3090/metrics | jq -c '.features["telemetry-lab"] | {counters, gauges, durations}'
    {"counters":{"socket.pushes":2,"work.units":8,"scheduled.ticks":1,"work.requests.get":2,"work.requests.post":1},
     "gauges":{"scheduled.ticks.total":1},
     "durations":{"work.durationMs":{"count":4,"max":0.03,"mean":0.0155,"min":0.008,"p50":0.012}}}
    ```

    `GET /lab/state` reports the same numbers plus the wiring (tick count, crons).

### Sampling (`BLUE_TELEMETRY_SAMPLER`)

`always` (default), `off`, or a ratio in `[0, 1]`; anything else fails at boot
rather than silently meaning "always" (guide 10 §2). The sampler is
parent-based, so **children follow the caller's decision** — with `off`, a root
request exports nothing, while a request carrying a sampled `traceparent` is
still traced end to end:

| Setting  | Result observed live                                                                                                                                                  |
| :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `off`    | a root `GET /work` exported **0** spans (the handler still ran); the same route with a sampled `traceparent` exported `HTTPServer.handleRequest` + `lab.work.compute` |
| `0.25`   | 9 of 40 root requests exported a `HTTPServer.handleRequest` span — the handler served all 40 (`/lab/state` counters)                                                  |
| `always` | every root request traced (default)                                                                                                                                   |

Logs and metrics are unaffected by the trace sampler.

### Shutdown order (why the bootstrap stops the scheduler first)

`HTTPServer.close()` closes the socket session registry it shares with the
controllers, while `@scheduled` tasks keep firing until the context closes — a
push tick landing in that window throws `Socket session registry is closed`
(reproduced; at a collector it appears as an Error-status
`scheduler.task.telemetrySocketController.pushSnapshot` span). `src/index.ts`
therefore hands `gracefulShutdown` a first resource that calls
`TaskScheduler.stop()`, so nothing runs once the resources start closing.

## Endpoints

```text
GET  /                       the page (HTML shell + the built Vite bundle)
GET  /work?payload=&units=   instrumented work: span + counter + duration (units clamped to 1..1000)
POST /work                   the same, JSON body {"payload":"blue","units":2} (400 problem+json on bad input)
GET  /lab/config             resolved sampler + exporter targets + socket path (what the page reads)
GET  /lab/state              counters/gauges/durations, tick count, crons, socket room
GET  /health                 management health (200 UP) — the boot-smoke probe
GET  /metrics                management metrics: feature "telemetry-lab"
WS   /ws/telemetry           joins the `telemetry` room; a snapshot is pushed every 3 s
GET  /static/client.js       the built browser bundle (pnpm build:client)
```

Inbound socket frames are counted (`socket.inboundMessages`); the page's
"Send socket ping" button exercises that path.

## Demonstrates

- [`@blue/telemetry-node`](../../packages/blue-telemetry-node/README.md) —
  `configureTelemetry` (sampler presets, console/OTLP exporters, once-per-process
  providers), `HTTPServerInstrumentation`, `WebSocketServerInstrumentation`.
- [`@blue/telemetry`](../../packages/blue-telemetry/README.md) — `@traced` /
  `@counted`, `currentTraceContext()`, `DispatcherInstrumentation`,
  `FeatureMetricAggregator`.
- [`@blue/telemetry-web`](../../packages/blue-telemetry-web/README.md) —
  `configureBrowserTelemetry` (console by default, OTLP when the page is handed
  a collector URL).
- [`@blue/http`](../../packages/blue-http/README.md) — `TraceHeaderInterceptor`
  (the client half of distributed tracing, reading a span the browser hands it).
- [`@blue/socket`](../../packages/blue-socket/README.md) — `WebSocketClient`
  (signal status, async-iterable messages, reconnect) against a
  `@socketMapping` handler and the session registry's room broadcast.
- [`@blue/scheduler`](../../packages/blue-scheduler/README.md) — `@scheduled`
  zero-wiring tasks plus their own task spans.
- [`@blue/management`](../../packages/blue-management/README.md) — `/health`
  and `/metrics` on the same process.
- [`@blue/platform-node`](../../packages/blue-platform-node/README.md) —
  `HTTPServer`, `StaticController` (the Vite bundle), `gracefulShutdown`,
  `SecurityHeadersInterceptor` (CSP widened per environment).

## Tests

```bash
pnpm --filter @blue/telemetry-lab test        # vitest, 4 files, 21 tests
```

- `test/telemetry-lab.spec.ts` — `@blue/test` `MockHTTP` integration: the page
  (with the widened CSP), `/health`, both `/work` routes (including the `400`
  problem document and checksum determinism), and the `/metrics`, `/lab/state`,
  `/lab/config` read-backs.
- `test/trace-propagation.spec.ts` — a real listener on an ephemeral port with
  `HTTPServerInstrumentation` and an **in-memory span exporter**: an inbound
  `traceparent` continues as the `SERVER` span (`traceId` matches, parent is the
  client's span id), `lab.work.compute` nests under it, and the handler's
  response echoes the continued trace id. A request without `traceparent` starts
  a fresh root trace.
- `test/scheduled-task.spec.ts` — `LabTicker.tick()` driven directly (no timers):
  the counter increments in both metric views (in-memory metric reader + the
  feature aggregator), the duration is recorded, and the task's root span plus
  the nested work span are exported.
- `test/telemetry-config.spec.ts` — sampler/exporter resolution from the
  environment, including the fail-loud typo path.

## See Also

- [Guide 10 — Telemetry](../../docs/guides/10-telemetry.md): the sampler, exporter
  and flush semantics this app configures.
- [Guide 16 — Persistence and distributed backends](../../docs/guides/16-persistence-and-distributed-backends.md):
  where the telemetry backends sit in a BlueJS deployment.
- [Guide 05 — Scheduling](../../docs/guides/05-scheduling.md),
  [Guide 06 — WebSockets](../../docs/guides/06-websockets.md),
  [Guide 19 — Testing](../../docs/guides/19-testing.md),
  [Guide 20 — The HTTP client](../../docs/guides/20-http-client.md).
- [`apps/04-blue-api`](../04-blue-api/README.md) — the same collector wiring in a
  larger app; `apps/07-blue-views`' client demo for the browser-side
  `TraceHeaderInterceptor` pattern.

[ISC](../../LICENSE)
