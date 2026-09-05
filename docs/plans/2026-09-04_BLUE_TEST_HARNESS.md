# @blue/test — Integration Test Harness

**Date:** 2026-09-04
**Status:** Spec
**Package:** `@blue/test` (new)
**Depends on:** `@blue/platform-node` (`NodeDispatcher`, `HTTPResponseViewTarget`), `@blue/dispatcher`, `@blue/context` (`ApplicationContext`), `@blue/boot` (`ApplicationBuilder`) — all in-process, socket-free
**Runs on:** Vitest (the existing runner); Playwright remains the E2E layer above.

---

## 1. Motivation

Blue apps today cannot test their own request pipeline. The gap, confirmed by a
survey of `apps/blue-todo/*/test` and `apps/blue-api`:

- **Library tests** (`@blue/dispatcher`, `@blue/platform-node`) test the dispatcher
  _in isolation_ with bespoke mock contexts.
- **App tests** (`blue-todo/test/index-controller.spec.ts`) fabricate a _stubbed
  context_ in each test:

```ts
(controller as any).setApplicationContext({
    getValue: (name) => (name === 'todoService' ? todoService : null),
});
```

`@getMapping`/`@requestMapping` decorators, interceptors, argument resolvers,
view resolution, and the response object are **never exercised**. No app test
answers: "does my controller actually get invoked via the real dispatcher and
return the right model / HTTP response?"

Playwright covers the full browser E2E, but there is a headless gap between
"unit-test the controller with a fake context" and "drive a real browser":
nothing validates the **dispatch → handler → response** contract without a socket.

### Why not just write raw dispatcher tests in each app?

Hand-wiring `MetadataConfigApplicationContext` + `NodeAutoConfiguration` +
`handlerMapping.setApplicationContext+init` + `dispatcher.initStrategies` +
a fake `ServerResponse` (see `packages/blue-platform-node/test/integration-http.spec.ts`)
is ~30 lines per fixture, repeated per app. `@blue/test` packages this.

---

## 2. Relationship to Vitest and Playwright

| Level           | Tool                      | Tests                                                        | Environment                   |
| --------------- | ------------------------- | ------------------------------------------------------------ | ----------------------------- |
| Unit            | **Vitest** (existing)     | Library internals, controller logic                          | jsdom / node                  |
| **Integration** | **`@blue/test`** (new)    | Full app pipeline: context → dispatcher → handler → response | node, in-process, socket-free |
| E2E             | **Playwright** (existing) | Real browser flows                                           | real browser                  |

- `@blue/test` is a **Vitest helper library**, not a competing runner. It provides
  Blue-aware fixtures/bootstraps consumed inside ordinary `test()` blocks.
- Playwright sits _above_ `@blue/test`: it validates the rendered browser
  experience. `@blue/test` covers the headless server/API contract Playwright
  can't reach cheaply.

---

## 3. Core Design

### 3.1 The crux: socket-free dispatch

`NodeDispatcher.render()` reads the response from `route.attributes[NODE_RESPONSE_ATTRIBUTE]`
and writes through `HTTPResponseViewTarget`. The `NodeHTTPServerAdapter` does all
request→`Route` conversion (path, `method`, query params, body, `NodeRequest`,
response attrs) then calls `dispatch(route)`.

`@blue/test` reuses **both** pieces without a socket:

```
MockMVC request  →  build Route (same as adapter)  →  dispatcher.dispatch(route)
                                                        →  HTTPResponseViewTarget
                                                        →  in-memory ResponseSink
                                                        →  assert on { status, headers, body }
```

The response sink swaps the real `ServerResponse` for an in-memory buffer that
captures `writeHead(status, headers)` / `end(body)`. This makes integration
tests fast and deterministic (no ports, no process, no teardown).

### 3.2 The boot helper

`@SpringBootTest`-equivalent: boot a full `ApplicationContext` once per suite.

```ts
// Composable API (the canonical, Vitest-friendly form):
import { bootApp, MockMVC } from '@blue/test';

describe('Todo API', () => {
    let mockMVC: MockMVC;

    beforeAll(() => {
        const app = bootApp([TodoConfiguration]);  // boots the real context + dispatcher
        mockMvc = new MockMVC(app);
    });
    afterAll(() => { /* app.close() */ });

    test('GET /todos lists items') {
        const res = await mockMVC.get('/todos').exec();
        expect(res.json()).toEqual([...]);
    }
});
```

**Under the hood** (`beforeAll`/`afterAll` on the fixture):

1. `new ApplicationBuilder(sources)` → `Application` → `_prepareContext()` →
   `MetadataConfigApplicationContext` with `WebAutoConfiguration`/`NodeAutoConfiguration`
   resolved by platform (this is where the `ApplicationBuilder` already shines).
2. Wire the dispatcher exactly as `blue-hello-node/src/index.ts` does:
    - `handlerMapping.setApplicationContext(context); handlerMapping.init();`
    - `dispatcher.initStrategies(context); dispatcher.applicationContext = context;`
3. Cache the context and dispatcher in the fixture scope; tear down (close) in `afterAll`.

The heavy context boots **once**, not per test — the "test context caching" the
assessment calls for.

### 3.3 The `MockMVC`-style client

```ts
// In-process request against the booted dispatcher.
const res = await mockMVC.get('/todos').query({ filter: 'active' }).exec();
//   = await mockMVC.send({ method: 'GET', path: '/todos?filter=active' })

res.status; // 200
res.headers; // { 'Content-Type': 'application/json' }
await res.json(); // []                       — JSON API response
await res.text(); // '<html>…</html>'          — view (SSR) response
await res.redirect(); // '/login'                  — ResponseEntity redirect

// Fluent assertions (thin, not a new assertion lib — reuse `expect`):
await mockMVC.get('/todos').expect(200).json().toHaveLen(2);
```

**Request surface** mirrors `NodeHTTPServerAdapter`:

- `method` (GET/POST/PUT/DELETE/PATCH/QUERY), `path`, `query`, `body` (JSON object),
  `headers`, `cookies`, `session` — all funnel into the same `NodeRequest` + `Route`
  shape the adapter builds, so behavior is identical to a real HTTP hit.

**Response surface** is what `HTTPResponseViewTarget` produces:

- `status`, `headers`, and either JSON (`body`) or HTML (`text`) — the same contract
  a real server would return. A `ResponseEntity.notFound()` handler yields `404`
  the same way it does over HTTP.

### 3.4 What it does NOT do

- **No socket / no real `node:http` server** — by default `@blue/test` is in-process.
  (An optional `live: true` mode can bind a real port for smoke tests, but it is
  not the default.)
- **No browser** — that is Playwright's job.
- **No new assertion API** — it returns shaped values for Vitest's `expect`.
- **No mocking framework** — you still hand `@blue/context` normal beans; but now
  the _dispatcher and pipeline_ are real.

---

## 4. Package Layout

```
packages/blue-test/
  src/
    index.ts              # exports bootApp, MockMVC, ResponseSink, memoryServer
    blue-test.ts          # bootApp(): context-boot + dispatcher wiring
    mock-mvc.ts           # MockMVC: request builder → dispatch(route)
    request-builder.ts    # method/path/query/body/headers → Route (reuses NodeHTTPServerAdapter shape)
    response-sink.ts      # in-memory ServerResponse capture (writeHead/end)
    memory-response.ts    # MutableResponse { status, headers, body }
  test/                   # self-tests: boots a sample controller, asserts dispatch
  package.json
```

### Dependencies

| Package                     | Reason                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `@blue/platform-node` (dep) | `NodeAutoConfiguration`, `NodeDispatcher`, `NODE_*_ATTRIBUTE`, `NodeRequest` |
| `@blue/dispatcher` (dep)    | `BrowserDispatcher`, argument resolvers                                      |
| `@blue/context` (dep)       | `ApplicationContext`                                                         |
| `@blue/boot` (peerDep)      | `ApplicationBuilder` (users may bring their own)                             |
| `vitest` (devDep)           | runner                                                                       |

---

## 5. Open Questions

| Question                                                           | Recommendation                                                                                                                                                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@blueTest` fixture as decorator vs. explicit `bootApp()` helper?  | **Explicit `bootApp()` + `MockMVC`** — the composable core matches Vitest's `beforeAll`/`afterAll`; no decorator ceremony. Decorator sugar may return if useful.                                         |
| Should `MockMVC.exec()` build a real `ServerResponse` or the sink? | **In-memory sink** (fast, deterministic). Real socket only via `live: true`.                                                                                                                             |
| Where do fixtures live — `@blue/test` or a per-app `test/helpers`? | In `@blue/test`; apps just `import { bootApp, MockMVC } from '@blue/test'`.                                                                                                                              |
| Does `@blue/test` boot the server or just the dispatcher?          | **Dispatcher only** — booting the listener adds nothing for in-process testing.                                                                                                                          |
| Vitest env                                                         | `// @vitest-environment node` (global config is jsdom).                                                                                                                                                  |
| `@blue/test` use `@blue/boot`?                                     | **No** — `@blue/boot`'s index re-exports browser `web-auto-configuration` → `@blue/view-webcomponent` (DOM). `bootApp` uses `MetadataConfigApplicationContext` directly, keeping `@blue/test` node-pure. |

---

## 6. Acceptance Criteria

| Gate                                                                                               | Verification                                                    |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `bootApp` boots a real `MetadataConfigApplicationContext` + `NodeAutoConfiguration` once per suite | Two tests share the same cached context (blue-test.spec.ts)     |
| `mockMVC.get('/todos')` hits a `@getMapping` controller via the real dispatcher                    | Controller invoked; status 200 (blue-test.spec.ts)              |
| JSON API response returns `res.json()`                                                             | Plain-object handler → parsed JSON body                         |
| SSR view response returns `res.text()`                                                             | `StringTemplateView` → HTML string body                         |
| `ResponseEntity.notFound()` → 404                                                                  | Status code + headers honored                                   |
| Query/body/path params bound                                                                       | Argument resolvers run against `NodeRequest` (mock-mvc.spec.ts) |
| Context torn down after suite                                                                      | `afterAll` calls `app.close()`                                  |
| Runs under `pnpm test`                                                                             | New package's specs pass in the normal run                      |

---

## 7. Follow-ups (post-MVP)

- ~~**Test context caching**~~ ✅ `cachedBootApp`/`releaseCachedApp` — per-worker
  dedupe across suites booting the same sources; cross-file sharing requires
  `isolate: false` (documented safety trade-off).
- ~~**`@blue/test` for browser apps**~~ ✅ `BrowserMockMVC` + `bootBrowserApp` +
  `MemoryViewTarget` (drives `BrowserDispatcher`, captures rendered output).
- **`@blue/test`-driven e2e breadcrumbs** — assert the API contract headlessly,
  then use Playwright only for render assertions.
- Revisit **automatic Node auto-registration** in `@blue/boot` when packages are
  regrouped into `web`/`node`/`isomorphic` (see `NODE_PLATFORM_FOUNDATION.md` §6.2).
