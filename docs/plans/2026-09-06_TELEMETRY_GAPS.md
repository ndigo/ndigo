# Telemetry Gaps — Streaming, View Resolution, and Client Streams

**Date:** 2026-09-06
**Status:** Implemented — G1–G4 landed (ServerSentEventViewInstrumentation, resolveViewName spans, ServiceClient.streamCall span, controller dirs removed); see follow-up

## Motivation

The view-resolution/SSE session added new runtime surfaces that the current telemetry instrumentation does not observe. Today's node-side tracing is: `HTTPServer.handleRequest` (SERVER root) → `AbstractDispatcher.dispatch` → `HTTPResponseViewTarget.commit`. Three gaps sit outside that chain, plus one pre-existing stub.

## Gaps

### G1 — Server push (SSE) is invisible after the root span

`ServerSentEventView` writes frames directly to the `ServerResponse` (`res.write` per event) — it deliberately bypasses `HTTPResponseViewTarget.commit`, which is where node-side instrumentation records the response. Consequences:

- A long-lived streaming connection **never completes its view phase**: only the `handleRequest` span exists, open for the whole stream (possibly hours), with no status, no body/event visibility.
- **No frame count, no stream duration, no disconnect detection** — the exact operational questions for a push endpoint (`/events`).
- The `likeView` direct-return path in `NodeDispatcher` means even the _200 status_ is never recorded today for these responses.

**Instrumentation:** `ServerSentEventViewInstrumentation` (node, `ndigo-telemetry-node`) — wrap `ServerSentEventView.prototype.render`:

- span `ServerSentEventView.render`, SERVER kind, child of `handleRequest` (inside the dispatch span's subtree as today)
- attrs: `http.response.status_code = 200`, `http.route` (from the route when available)
- end attrs (set in `onEnd`/at end): `sse.frames` (count), `sse.duration_ms`, and on premature close `sse.client_disconnected=true` (the view's write loop already breaks on `res.destroyed` — surfacing that is the instrumentation's job)
- simplest counters: the view already tracks/breaks on `res.destroyed`; add a `#frames` count on the view instance (cheap, no hot-path work beyond `res.write` returning) and read it at span end
- ERROR status when `render` throws or ends without the full stream

### G2 — View resolution is a blind spot (which resolver served the name?)

`_resolveViewName` iterates the resolver chain; no span or attribute records _which_ resolver won or whether resolution failed (fall-through → `NoViewFoundError`). With the new family (WebComponent/Island/Name/Import/path-based), "which resolver, which name" is genuinely new diagnostic surface.

**Instrumentation:** small `ViewResolutionInstrumentation` (node + web) — wrap `AbstractDispatcher.prototype._resolveViewName`:

- span `Dispatcher.resolveViewName`, INTERNAL
- attrs: `view.name`, `view.resolved_by` (resolver constructor name, set at end), `view.resolved=true|false`
- cheap: one span per name resolution, no hot-path impact

### G3 — Client stream consumption has no spans

`streamCall` (ndigo-service) performs an unbounded-duration response read; today the service client has zero telemetry beyond the `X-Ndigo-Service` correlation header. A stream call is a long-lived client span with no visibility into duration/event count.

**Instrumentation:** `ServiceClientInstrumentation` or a focused span inside `streamCall`:

- span `ServiceClient.streamCall`, CLIENT kind
- attrs: `service.name` (config name), `http.method`, `http.route` (call path); end attrs `stream.events` (or `sse.events`) count + duration
- instrumented from ndigo-service directly (it already imports telemetry hooks) — either a trace-aware wrapper or, cleaner, an OTel span via `@ndigo/telemetry`'s tracer (ndigo-service has no `@ndigo/telemetry` dep today — add to peer/dev + wire one small span, or expose a hook the telemetry package instruments)

Note: G3 has a dependency question — `ndigo-service` currently depends on `@ndigo/context|core|factory|http|util` + zod; adding `@ndigo/telemetry` to peerDeps is the repo-consistent path (`@ndigo/telemetry` is itself a telemetry package with no reverse dep).

### G4 — Empty `controller/` instrumentation dirs (pre-existing)

`ndigo-telemetry-node` and `-web` both carry an empty `instrumentation/controller/` directory. Either implement (e.g. `@traced` handlers covered by dispatcher span already — likely redundant) or remove the empty dirs. **Remove is my suggestion** (redundant with the dispatcher span; keep the surface honest).

## Guidelines applied

- **One span per logical operation, child of the existing request root** (no new roots; consistency with current nesting).
- **Attributes follow OTel semantic conventions** (`http.*`, `error.type`, `service.*`) — no invented naming.
- **Hot-path cost ≈ 0**: frame-count read at span end; no per-frame span (SSE may push hundreds/thousands).
- **Naming**: `*Instrumentation` suffix + package placement mirrors existing (`ndigo-telemetry-node/src/instrumentation/<area>/<area>.ts`).

## Implementation steps

1. G1: `ServerSentEventViewInstrumentation` (node) — wrap `ServerSentEventView.render`; add a `#frames` counter to the view (or read an existing one); set end attrs; test: open SSE connection with the demo store, assert span shape + frame count + disconnect attr on client abort.
2. G2: `ViewResolutionInstrumentation` — wrap `_resolveViewName` in both telemetry packages; test with a composite (ndigo-views fixture) asserting `resolved_by` = the winning resolver.
3. G3: decide service-client dependency approach (span inside ndigo-service vs hook) — recommended: add `@ndigo/telemetry` peerDep + one `streamCall` span; test with a mocked fetch stream (service-client spec has the machinery).
4. G4: delete empty `controller/` dirs (both packages).
5. Wire the new instrumentations into `configureTelemetry`/node+browser config (where the existing instrumentation list is built).
6. Docs: update telemetry README/section listing instrumentations; fold into the view-resolution plan's follow-up. Optional AD-10 for the telemetry surface if a decision record is wanted.
7. Tests: unit spans with a mock OTel provider (existing telemetry test harness), plus one real HTTP SSE smoke asserting the new spans appear.
8. `graft build` refresh.

## Testing strategy

- Reuse the repo's existing telemetry test harness (mock `@opentelemetry/api` tracer capturing spans).
- G1: real SSE connect → assert span attrs `sse.frames` matches pushed count; client abort → `sse.client_disconnected=true` + end/ERROR.
- G2: ndigo-views composite → assert `view.resolved_by === 'WebComponentViewResolver'` for `shell`, `'NameViewResolver'` for `footer`.
- G3: service-client spec with mocked stream → assert CLIENT span + event count.
- Full suites: telemetry-node/web + the packages touched + island demo; lint + format; graft refresh.
- Non-goals honored: no per-frame spans, no new telemetry deps beyond the peer-dep decision for ndigo-service, no instrumentation of `streamToSignal` (state, not a boundary).

## Acceptance criteria

1. Every `/events`-style SSE push produces a `ServerSentEventView.render` span with `sse.frames`, `sse.duration_ms`, status, and disconnect flag — visible next to request/dispatch/commit.
2. View-name resolution records `view.name` + `view.resolved_by`; fall-through (`nope`) records failure.
3. Client stream calls produce a `ServiceClient.streamCall` CLIENT span with service name + event count.
4. Empty `controller/` dirs removed.
5. No per-frame overhead; all spans nest under the existing request root; OTel semantic attrs only.
6. Telemetry docs updated; demo smoke shows the new spans.

## Follow-up (2026-09-06): implementation landed

- **G1** — `ServerSentEventViewInstrumentation` (node, `ndigo-telemetry-node`): wraps `ServerSentEventView.render`; spans carry `http.response.status_code`, `http.route`, `sse.frames`, `sse.duration_ms`, `sse.client_disconnected`. The view gained observable `frameCount` + `clientDisconnected` fields (a `res` `close` listener + destroyed-guard set the flag — Node surfaces aborts on socket close, not on `write`). Tests: completed stream (frames + duration) and mid-stream disconnect flag over a real HTTP server.
- **G2** — `_resolveViewName` span (`Dispatcher.resolveViewName`, INTERNAL) added to both node + web `DispatcherInstrumentation`: `view.name`, `view.resolved` (false on chain fall-through), `view.resolved_by` (the resolved view's class). Correlation spec asserts the winning view for a name-returning route.
- **G3** — `ServiceClient.streamCall` CLIENT span in `ndigo-service`: `service.name`, `http.method`, `http.route`, `stream.events`, `stream.duration_ms`; exception + ERROR status on failure. `@ndigo/telemetry` added to peer+dev deps, `@opentelemetry/api` to dependencies, `@opentelemetry/sdk-trace-base` (test-only) to devDeps. Spec asserts the span attrs with a mocked stream.
- **G4** — empty `controller/` instrumentation dirs removed (redundant with dispatcher spans).
- Full suites green (32 nx targets), docs updated (this plan), graft refreshed.
