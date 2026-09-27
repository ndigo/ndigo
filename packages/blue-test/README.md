# @blue/test

> Integration test harness for BlueJS — in-process MockHTTP request dispatch without binding a port.

Blue integration test harness — **MockHTTP**-style, socket-free request dispatch for testing Blue applications end-to-end (dispatcher → interceptors → argument resolvers → handler → JSON/view response) without binding a port. Tests boot the real pipeline in-process and assert on the HTTP response instead of hand-fabricating stubbed contexts.

## Installation

```bash
pnpm add -D @blue/test
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@blue/test';
import { TodoController } from '../src/todo-controller';

describe('Todo API', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        const app = bootApp([TodoController]); // boots context + dispatcher
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

`bootApp` accepts `@configuration` classes (registered via `context.register`) or plain `@getMapping` controller classes (stored by class name).

## API
Complete generated reference (all exports, via `pnpm doc:api`): [`doc/api/README.md`](doc/api/README.md).


- **`bootApp(sources: Function[]): BlueTestApp`** — boots a real `MetadataConfigApplicationContext` with `NodeAutoConfiguration`, wires the handler mapping + dispatcher. Returns `{ context, dispatcher, close }`.
- **`cachedBootApp(sources)` / `releaseCachedApp(sources)`** — same-sources dedupe within a worker: multiple suites booting the same sources share one context (ref-counted; released via `releaseCachedApp` or `app.close()`).
- **`MockHTTP(dispatcher | app)`** — socket-free request client. Methods `get/post/put/delete/patch/query`, then fluent `.query()/.body()/.headers()/.cookies()/.session()`, then `.exec()` → `MockResult`.
- **`MockResult`** — `{ response, route, json(), text() }`. `response` is a `MemoryResponse` `{ status, headers, body, completed }`.

## How it works

`NodeDispatcher.render()` reads the response from `route.attributes[NODE_RESPONSE_ATTRIBUTE]` and writes through `HTTPResponseViewTarget`. MockHTTP builds the same `Route` + `NodeRequest` a real HTTP request would, swaps the real `ServerResponse` for an in-memory `ResponseSink`, and dispatches — so behavior matches a real HTTP hit with no socket, no process, no port.

## Not included

- No browser for `MockHTTP` (use Playwright for E2E; `BrowserMockClient` for jsdom).
- No real listener by default.
- No assertion library — MockHTTP returns shaped values for Vitest's `expect`.

## Development

```bash
pnpm --filter @blue/test build:lib
pnpm --filter @blue/test test
```

## See Also

- [apps/blue-todo](../../apps/blue-todo/README.md) — harness-driven controller/pipeline tests

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
