# AD-63: `@ndigo/test` — in-process, socket-free integration test harness

**Date:** 2026-09-04
**Status:** Accepted — implemented; `bootNodeApp` + `MockHTTP` on Vitest.

## Context

Ndigo apps could not test their own request pipeline. Library tests exercised
the dispatcher in isolation with bespoke mock contexts; app tests fabricated a
stubbed `setApplicationContext` in each test. `@getMapping`/`@requestMapping`
decorators, interceptors, argument resolvers, view resolution, and the
response object were never exercised end-to-end. Hand-wiring
`MetadataConfigApplicationContext` + `NodeAutoConfiguration` + a fake
`ServerResponse` was ~30 lines per fixture. Playwright covers full-browser E2E
but leaves a headless gap between unit-testing a controller and driving a real
browser: nothing validates the dispatch → handler → response contract without
a socket.

## Evidence

- `packages/ndigo-test/src/ndigo-test.ts` — `export function bootNodeApp(sources:
  Function[]): NdigoTestApp` (line 43), plus
  `export function cachedBootNodeApp(sources: Function[]): NdigoTestApp` (line 124,
  per-worker context dedupe). Born `17a4dd85` (2026-09-04).
- `packages/ndigo-test/src/mock-http.ts` — `MockHTTP` + `MockHTTPRequestBuilder`
  (request builder → `dispatch(route)`), born `b03d2831` (2026-09-08).
- `packages/ndigo-test/src/index.ts` exports `MockHTTP, MockHTTPRequestBuilder`
  from `./mock-http` and `bootNodeApp, cachedBootNodeApp, releaseCachedNodeApp` from
  `./ndigo-test`; supporting `request-builder.ts`, `memory-response.ts`
  (`MemoryResponse`/`ResponseSink`), `memory-view-target.ts`,
  `browser-mock-client.ts` (`BrowserMockHTTP`).
- `@ndigo/test` is node-pure: `bootNodeApp` uses `MetadataConfigApplicationContext`
  directly rather than `@ndigo/boot` (whose index re-exports DOM-coupled
  `web-auto-configuration`); runs under Vitest.

## Decision

- **D-1** `@ndigo/test` is a Vitest helper library, not a competing runner —
  an explicit `bootNodeApp()` (not a decorator) boots a real context + dispatcher
  once per suite; `MockHTTP` sends in-process requests against the real
  pipeline.
- **D-2** Socket-free: the response sink swaps the real `ServerResponse` for
  an in-memory buffer capturing `writeHead`/`end`, so tests are fast and
  deterministic (no ports, no teardown). A `live: true` mode is optional.
- **D-3** `MockHTTP` mirrors the `NodeHTTPServerAdapter` request surface
  (method/path/query/body/headers/cookies/session) and the
  `HTTPResponseViewTarget` response contract (status/headers/JSON-or-HTML).
- **D-4** Thin, not a new assertion framework — returns shaped values for
  Vitest's `expect`; no browser (Playwright's job), no mocking framework
  (real entries, real dispatch).
- **D-5** Caching via `cachedBootNodeApp`/`releaseCachedNodeApp` (per-worker dedupe)
  boots the heavy context once.

## Consequences

- App-level integration tests now exercise the true dispatch → interceptor →
  argument-resolver → view/response pipeline headlessly; a
  `ResponseEntity.notFound()` handler yields 404 exactly as over HTTP.
- Browser apps tested via `BrowserMockHTTP` + `MemoryViewTarget` (drives
  `BrowserDispatcher`, captures rendered output).
- Playwright remains the E2E layer; `@ndigo/test` covers the headless
  server/API contract cheaply. It stays node-pure until AD-64's boot split.

## References

- Plan: `docs/plans/2026-09-04_NDIGO_TEST_HARNESS.md`
- Implementation: `packages/ndigo-test/src/ndigo-test.ts`,
  `packages/ndigo-test/src/mock-http.ts`, commit `17a4dd85` (2026-09-04),
  `b03d2831` (2026-09-08)
- Related: [AD-60](2026-09-03_AD60_NODE_PLATFORM_FOUNDATION.md)

## Revisit Trigger

Revisit if a consumer needs cross-file context sharing (requires
`isolate: false` today) or real-socket smoke coverage as a default rather than
the opt-in `live: true` mode. Until then in-process `bootNodeApp` + `MockHTTP`
stand.
