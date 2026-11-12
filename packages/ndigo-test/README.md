# @ndigo/test

> Integration test harness for Ndigo — in-process MockHTTP request dispatch without binding a port.

Ndigo integration test harness — **MockHTTP**-style, socket-free request dispatch for testing Ndigo applications end-to-end (dispatcher → interceptors → argument resolvers → handler → JSON/view response) without binding a port. Tests boot the real pipeline in-process and assert on the HTTP response instead of hand-fabricating stubbed contexts.

## Installation

```bash
pnpm add -D @ndigo/test
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootNodeApp, MockHTTP } from '@ndigo/test';
import { TodoController } from '../src/todo-controller';

describe('Todo API', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        const app = bootNodeApp([TodoController]); // boots context + dispatcher
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => close());

    test('GET /todos lists items', async () => {
        const res = await mockHTTP.get('/todos').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual([{ text: 'buy milk', checked: false }]);
    });

    test('POST /todos binds the JSON body', async () => {
        const res = await mockHTTP.post('/todos').body({ text: 'write docs' }).exec();
        expect(res.json()).toEqual({ text: 'write docs', checked: false });
    });

    test('unknown route yields 404', async () => {
        const res = await mockHTTP.get('/nope').exec();
        expect(res.response.status).toBe(404);
    });
});
```

`bootNodeApp` accepts `@configuration` classes (registered via `context.register`) or plain `@getMapping` controller classes (stored by class name).

## Usage

### How it works

`NodeDispatcher.render()` reads the response from `route.attributes[NODE_RESPONSE_ATTRIBUTE]` and writes through `HTTPResponseViewTarget`. MockHTTP builds the same `Route` + `NodeRequest` a real HTTP request would, swaps the real `ServerResponse` for an in-memory `ResponseSink`, and dispatches — so behavior matches a real HTTP hit with no socket, no process, no port.

Interceptor denials are finalized by the same helper as the live `NodeHTTPServerAdapter`: a guard's bare `denialOf(403)` yields the `403` `application/problem+json` document, a `401` adds the `WWW-Authenticate: Bearer` challenge, a `redirect` denial yields `302` + `Location`, and an interceptor that already ended the response is left untouched.

### Not included

- No browser for `MockHTTP` (use Playwright for E2E; `BrowserMockClient` for jsdom).
- No real listener by default.
- No assertion library — MockHTTP returns shaped values for Vitest's `expect`.

## API

Complete generated reference (all exports): [`api/README.md`](api/README.md).

- **`bootNodeApp(sources: Function[]): NdigoTestApp`** — boots a real `MetadataConfigApplicationContext` with `NodeAutoConfiguration`, wires the handler mapping + dispatcher. Returns `{ context, dispatcher, close }`.
- **`cachedBootNodeApp(sources)` / `releaseCachedNodeApp(sources)`** — same-sources dedupe within a worker: multiple suites booting the same sources share one context (ref-counted; released via `releaseCachedNodeApp` or `app.close()`).
- **`MockHTTP(dispatcher | app)`** — socket-free request client. Methods `get/post/put/delete/patch/query`, then fluent `.query()/.body()/.headers()/.cookies()/.session()`, then `.exec()` → `MockResult`.
- **`MockResult`** — `{ response, route, json(), text() }`. `response` is a `MemoryResponse` `{ status, headers, body, completed }`.
- **`delay(ms)`** — shared promise-based timing helper for specs awaiting real or fake timers; re-exported from `@ndigo/util` (where packages the harness itself depends on import it directly).

## Development

```bash
pnpm --filter @ndigo/test build:lib
pnpm --filter @ndigo/test test
```

## See Also

- [apps/03-ndigo-todo-web](../../apps/03-ndigo-todo-web/README.md) — harness-driven controller/pipeline tests

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
