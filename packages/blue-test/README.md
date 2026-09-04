# @blue/test

Blue integration test harness — **MockMvc**-style, socket-free request dispatch
for testing Blue applications end-to-end (dispatcher → interceptors → argument
resolvers → handler → JSON/view response) without binding a port.

Part of the Blue framework. Companion to the feature assessment's "Testing
Harness" priority (`docs/reference/2026-09-01_FEATURE_ASSESSMENT.md`); design in
`docs/plans/2026-09-04_BLUE_TEST_HARNESS.md`.

## Why

Blue app tests today hand-fabricate a stubbed `ApplicationContext` per test, so
the real dispatcher, `@getMapping` decorators, argument resolvers, interceptors,
and view resolution are never exercised. `@blue/test` boots the **real pipeline**
in-process and asserts on the HTTP response.

## Usage

```ts
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockMvc } from '@blue/test';
import { TodoController } from '../src/todo-controller';

describe('Todo API', () => {
    let mockMvc: MockMvc;
    let close: () => void;

    beforeAll(() => {
        const app = bootApp([TodoController]); // boots context + dispatcher
        mockMvc = new MockMvc(app);
        close = app.close;
    });

    afterAll(() => close());

    test('GET /todos lists items', async () => {
        const res = await mockMvc.get('/todos').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual([{ text: 'buy milk', checked: false }]);
    });

    test('POST /todos binds the JSON body', async () => {
        const res = await mockMvc.post('/todos').body({ text: 'write docs' }).exec();
        expect(res.json()).toEqual({ text: 'write docs', checked: false });
    });

    test('unknown route yields 404', async () => {
        const res = await mockMvc.get('/nope').exec();
        expect(res.response.status).toBe(404);
    });
});
```

`bootApp` accepts `@configuration` classes (registered via `context.register`)
or plain `@getMapping` controller classes (stored by class name).

## API

- **`bootApp(sources: Function[]): BlueTestApp`** — boots a real
  `MetadataConfigApplicationContext` with `NodeAutoConfiguration`, wires the
  handler mapping + dispatcher. Returns `{ context, dispatcher, close }`.
- **`MockMvc(dispatcher | app)`** — socket-free request client. Methods
  `get/post/put/delete/patch/query`, then fluent `.query()/.body()/.headers()/
  .cookies()/.session()`, then `.exec()` → `MockResult`.
- **`MockResult`** — `{ response, route, json(), text() }`. `response` is a
  `MemoryResponse` `{ status, headers, body, completed }`.
- **`bootApp` returns `BlueTestApp`** with `.close()` teardown.

## How it works

`NodeDispatcher.render()` reads the response from
`route.attributes[NODE_RESPONSE_ATTRIBUTE]` and writes through
`HTTPResponseViewTarget`. MockMvc builds the same `Route` + `NodeRequest` a real
HTTP request would, swaps the real `ServerResponse` for an in-memory
`ResponseSink`, and dispatches — so behavior matches a real HTTP hit with **no
socket, no process, no port**.

## Not included

- No browser (use Playwright for E2E).
- No real listener by default (`live: true` is a future mode).
- No assertion library — MockMvc returns shaped values for Vitest's `expect`.

## Package layout

```
src/
  index.ts              # exports bootApp, MockMvc, buildRoute, createMemoryResponse
  blue-test.ts          # bootApp(): context boot + dispatcher wiring
  mock-mvc.ts           # MockMvc + MockMvcRequestBuilder
  request-builder.ts    # MockRequest → Route/NodeRequest (matches NodeHTTPServerAdapter)
  memory-response.ts    # in-memory ResponseSink + MemoryResponse capture
```