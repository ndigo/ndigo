# AD-09: Server push (SSE/WebSocket) — transport for the hybrid topology

**Date:** 2026-09-05
**Status:** Implemented (SSE-first landed 2026-09-06 — see follow-up below); WebSocket remains opt-in, gated on a bidirectional consumer

## Background

The hybrid island topology (AD-08 follow-ups) needs server→client push: the server holds source-of-truth model state; an island should receive model updates _after_ initial hydration. The demo (`apps/blue-island`) proves the _static_ hybrid (server renders island → client hydrates); this AD decides the _reactive_ half — the transport that pushes model changes into `@blue/signals` (local reactive state) which re-renders the island.

BlueJS currently has **no socket/SSE code** — `blue-platform-node` wraps raw `node:http` (`createServer`, `IncomingMessage`, `ServerResponse`). There is no transport upgrade path yet.

## Research findings

### Library: SSE needs nothing; WebSocket needs `ws`

- **SSE** is plain HTTP (`text/event-stream`) — no library required. It rides the existing `node:http` server, headers, auth, and (potentially) the interceptor chain. Zero new deps.
- **WebSocket** needs a library. `ws` is the standard minimal option (pure JS, battle-tested, same-event-loop friendly, works with `node:http` `upgrade`); `uWebSockets.js` is faster but a C++ native addon that breaks isomorphic/toolchain portability. **`ws` is the choice if/when bidirectional is needed.**
- Consensus (2026): SSE handles most push scenarios (dashboards, AI streaming, model updates) with far less complexity; WebSocket is for bidirectional chat/presence/low-latency-interactive.

### Pattern: SSE-first for islands, WebSocket as opt-in

| Criterion        | SSE                                                  | WebSocket           |
| ---------------- | ---------------------------------------------------- | ------------------- |
| Direction        | server→client (exactly the island/model-push case)   | bidirectional       |
| Deps             | none (raw HTTP)                                      | `ws`                |
| Reconnect        | automatic (EventSource)                              | manual              |
| Auth/correlation | reuse HTTP headers/interceptors                      | separate handshake  |
| BlueJS fit       | reuses `node:http` + cookies/auth + telemetry header | new upgrade surface |

**Decision: SSE-first.** The hybrid island push is unidirectional server→client model updates. SSE maps directly onto the existing stack and `@blue/signals`. WebSocket becomes a later, opt-in adapter when a bidirectional consumer appears (chat etc.) — not now.

### Normalization: sockets as a _response modality of the service layer_

The established industry model: reactive push is a **stream alongside REST** (Flux/Mono, SseEmitter), and RSocket/WebFlux extend the interaction model (request/response, request/stream, fire-and-forget, channel) rather than inventing a separate socket paradigm.

BlueJS analog: **a service call can declare a streaming response.** In the `@blue/service` proxy (AD-08), a `@getCall`/`@postCall` that returns a _stream_ (SSE) is the same service contract as one returning a single value — the socket is not a new paradigm but a **response modality**. Concretely:

```ts
@service('ticks', { baseUrl: 'https://…' })
class MarketAPI {
    @getCall('/stream', { stream: true })   // SSE response
    stream(): AsyncIterable<Price> { … }
}
```

The normalization answer: **services + HTTP + SSE are one continuum**; a "socket" is a service method whose response is a stream. This avoids a parallel socket-client API and keeps correlation/telemetry/auth uniform.

## Decision

1. **Implement server push as SSE** in `blue-platform-node`: a view/response type that writes `text/event-stream` and streams model events; client side consumes via `EventSource` into `@blue/signals` → island re-render.
2. **No WebSocket now**; adopt `ws` only when a bidirectional consumer exists (documented opt-in path).
3. **Normalize through the service layer (AD-08 proxy)**: a `stream: true` option on `@*Call` makes the service method return an async iterable/stream; the same interceptor/correlation/telemetry pipeline applies. Socket ≠ new paradigm; socket = streaming service response.
4. **Reuse the hybrid demo** (`apps/blue-island`) as the proving consumer: server pushes model-update events over SSE; the island subscribes via a signal.

## Consequences

- **No new dependency** for SSE (raw `node:http`); `ws` deferred.
- **Unified mental model**: services/HTTP/SSE are one layer; the developer declares a stream where needed.
- The reactive hybrid (server push → signal → island) becomes implementable and testable.

## Adopting WebSockets (`@socketMapping`)

**Status (2026-09-07):** implemented. `@socketMapping` decorator +
`SocketSession` contract in `@blue/dispatcher`; the Node adapter
(`@blue/platform-node`) performs the RFC 6455 handshake via the `ws`
library and dispatches upgraded connections to socket handlers
(async-iterable producer-consumers — `for await` inbound, `yield`
outbound, mirroring the SSE view). The model keeps the AD-09 principle —
reactive push is a stream alongside REST — extended to full-duplex:
sockets and SSE coexist; `GET` to a socket path is 404 (socket-only
endpoints do not serve plain HTTP). See
`docs/guides/01-building-a-node-api.md` §6b.

Revisit WebSocket when a **bidirectional** consumer (chat, collaborative presence) appears; revisit uWebSockets.js only if throughput profiling demands it (native addon cost accepted).

## Implementation order (proposed)

1. SSE response support in `blue-platform-node` (`ServerSentEventView`/streaming response).
2. `stream: true` on `@blue/service` `@*Call` (AD-08 proxy returns `AsyncIterable`).
3. Client `EventSource` → `@blue/signals` bridge.
4. Wire the island demo: server pushes tick/model events; island re-renders.

## Follow-up (2026-09-06): SSE-first implementation landed

All four implementation-order items are built and proven by the hybrid demo (`apps/blue-island`):

1. **SSE response support in `blue-platform-node`** — `ServerSentEventView` (exported from the package index; naming cleanup, see plan): an imperative view constructed per request with its own async-iterable event source, writing `text/event-stream` frames (JSON `data:` lines, optional `event:` name) and ending the response when the source ends. `MediaTypes.TEXT_EVENT_STREAM` added in `blue-core`; the wire envelope is the shared `ServerSentEvent` type (also produced by the client parser). Headers are flushed before the stream begins (Node buffers headers until the first write — a waiting stream deadlocks otherwise). Handlers return the view directly (imperative View — rendered through the direct-View branch). Verified over a real `node:http` server in `test/server-sent-event-view.spec.ts`.

2. **`stream: true` on `@blue/service` calls** — `ServiceCallConfig.stream`; the AD-08 proxy returns an `AsyncIterable` of parsed Server-Sent Events for a `stream: true` call (sends `Accept: text/event-stream`), validating each event's `data` with the call's `responseSchema` when declared. `ServerSentEventParser`/`parseServerSentEvents` (exported) implement incremental `text/event-stream` parsing (fields, JSON data fallback to raw, comments, CRLF, chunk-boundary assembly). Same interceptor/correlation/telemetry pipeline as any call.

3. **Client `EventSource`→signals bridge** — instead of the DOM `EventSource` (no fetch, no typed contracts), the demo consumes the typed service stream; `streamToSignal(source, signal)` (`@blue/signals`) writes each yielded value into a `Signal`, and an `effect` re-renders the island. `stop()` cancels consumption and closes the source.

4. **Island demo wired** — `TodoModelStore` (server-owned snapshot + push channel with unsubscribe) feeds `GET /events`; the shell's initial model and the pushed models share one store instance (composition root in `IslandConfiguration` — cross-entry `this.method()` calls do NOT share beans, so a private field is the single source). The client subscribes via a `@service('blue-island')` typed stream (`responseSchema` zod — AD-07) and re-renders on each push.

## Consequences (updated)

- **No new dependency** — SSE rides raw `node:http` + `fetch`/`ReadableStream`; `ws` remains deferred (opt-in, bidirectional consumers only).
- **Unified mental model realized** — a push endpoint is a streaming response of the service layer: `@getCall('/events', { stream: true })` + `serviceClient()` is the whole client API; the server side is a controller returning `new ServerSentEventView(events)` (the view is imperative — constructed per request — unlike resolved views; see the view-resolution strategy plan).
- **The reactive hybrid is demonstrated** — server push → signal → island re-render, exercised by `apps/blue-island/test` (10 tests, incl. two sequential pushes over a real server) and live smoke.
