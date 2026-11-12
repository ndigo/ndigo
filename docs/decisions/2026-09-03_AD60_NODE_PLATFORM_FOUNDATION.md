# AD-60: Node platform foundation — HTTP server, dispatcher, request pipeline

**Date:** 2026-09-03
**Status:** Accepted — implemented; `HTTPServer` + `NodeDispatcher` + server
view targets + telemetry instrumentations landed in `@ndigo/platform-node`.

## Context

`@ndigo/platform-node` had argument resolvers, a `NodeRequest`, a
`NodeEnvironment`, and a `FileSystemRouter` stub, but no HTTP server, no
dispatcher, and no server view rendering. Every Node app hand-wrote 50+ lines
of raw `node:http` boilerplate, built route objects manually, and bypassed the
dispatcher/interceptor/error/view pipeline. The browser side already had a
DOM-free `BrowserDispatcher` (in `@ndigo/dispatcher`) whose `render()` resolves
a view and commits through a `ViewTarget` entry; the browser-ness lived only in
`@ndigo/platform-web`'s `DOMElementViewTarget`. This AD completes the
server-pipeline design that AD-05 scoped at MVP level.

## Evidence

- `packages/ndigo-platform-node/src/http-server.ts` — `export class HTTPServer
  implements SmartLifecycle, ApplicationContextAware` (line 105); born
  `0a212eb1` (2026-09-04). Adapter in `node-http-server-adapter.ts`
  (`NodeHTTPServerAdapter implements HTTPServerAdapter`, line 236).
- `packages/ndigo-platform-node/src/node-dispatcher.ts` — `NodeDispatcher`
  (born `0a212eb1`, 2026-09-04), extending `BrowserDispatcher` for server
  render semantics.
- Server view targets: `packages/ndigo-platform-node/src/node-view-target.ts`
  (`HTTPResponseViewTarget`), plus `response-entity.ts` / `response-entity-view.ts`
  (status/headers from `@ndigo/http`'s `ResponseStatus`/`HTTPHeaders`),
  `static-file-view.ts`, `node-auto-configuration.ts`.
- `@ndigo/view` isomorphic server surface: `view-target.ts` (`ViewTarget`
  interface, `EventBridgeViewTarget`), `island-view.ts`, `island-view-resolver.ts`.
- HTTP-method decorators live in the dispatcher, shared across platforms:
  `@requestMapping`/`@getMapping`/`@postMapping`… in `@ndigo/dispatcher`
  (verified in the plan's file table; the mapping stack filters on
  `Route.method?`).
- Telemetry instrumentations in `packages/ndigo-telemetry-node/src/instrumentation/`:
  `http-server/`, `http-response-view-target/`, plus `dispatcher/`,
  `context/`, `counted.ts`, `server-sent-event-view/`, `websocket-server/`.

## Decision

- **D-1** `NodeDispatcher` extends the shared `BrowserDispatcher`, inheriting
  `dispatch()`/`_processDispatchResult()`/`_processHandlerError()` and
  overriding only `render()` for HTTP semantics; no base-class extraction yet
  (deferred `AbstractDispatcher` follow-up).
- **D-2** `HTTPServer` is a `SmartLifecycle` entry auto-started on context
  refresh over a pluggable `HTTPServerAdapter`, default
  `NodeHTTPServerAdapter` wrapping raw `node:http` (zero deps — Hono/Express
  were considered and rejected).
- **D-3** `HTTPResponseViewTarget` writes rendered output to the response;
  server views resolve via the existing `ContentNegotiationViewResolver`
  `Accept`-header wiring; `StaticFileView` serves the filesystem.
- **D-4** HTTP vocabulary is reused from `@ndigo/http` (`HTTPMethod`,
  `HTTPHeaders`, `ResponseStatus`/`ResponseStatuses`) via **type-only**
  imports where the consumer must stay isomorphic (`@ndigo/dispatcher`,
  `@ndigo/router`); `@ndigo/platform-node` consumes the constants at runtime.
- **D-5** New OTel instrumentations: `HTTPServerInstrumentation` (spans
  `listen`/`close`) and `HTTPResponseViewTargetInstrumentation` (captures the
  final `http.status_code`, invisible to the dispatch span). Existing
  `DispatcherInstrumentation` covers `NodeDispatcher` automatically since it
  wraps the inherited `dispatch`.

## Consequences

- Node apps can register a `@configuration`, call
  `ApplicationBuilder.run()`, and get a running, dispatched, view-rendering
  HTTP server — replacing the hand-built `node:http` plumbing (AD-05's
  platform-node MVP surface grows: see also AD-09 SSE, AD-28 static files).
- HTTP-method-restricted handlers (`@getMapping` etc.) exist platform-wide;
  `@routeMapping` without a method still matches any method (backward
  compatible).
- `@ndigo/telemetry` gained `@ndigo/platform-node` instrumentations, building on
  the AD-10 error model and the telemetry completion work (AD-32).

## References

- Plan: `docs/plans/2026-09-03_NODE_PLATFORM_FOUNDATION.md`
- Implementation: `packages/ndigo-platform-node/src/http-server.ts`,
  `node-dispatcher.ts`, `node-view-target.ts`,
  `packages/ndigo-telemetry-node/src/instrumentation/http-server/`,
  commits `0a212eb1` (2026-09-04), `383904c7` (2026-09-05)
- Related: [AD-05](2026-05-27_AD05_PLATFORM_NODE_MVP_SCOPE.md),
  [AD-09](2026-09-05_AD09_SERVER_PUSH.md),
  [AD-10](2026-09-07_AD10_RFC9457_ERROR_MODEL.md)

## Revisit Trigger

Revisit if a real consumer needs the deferred `AbstractDispatcher` extraction
(to free telemetry from its `BrowserDispatcher` import), or if the
`HTTPServerAdapter` abstraction needs a non-`node:http` backend. Until then the
`NodeDispatcher`-inherits-`BrowserDispatcher` shortcut is maintained.
