# Guide 19 — Testing with `@ndigo/test`

`@ndigo/test` is the in-process integration harness (AD-63): `bootApp` boots a
real application context and dispatcher, and `MockHTTP` sends socket-free
requests through the whole pipeline — interceptors, argument resolvers,
validation, handler, view resolution, and the response contract. No port, no
process, no hand-wired `ServerResponse`. Tests assert on a shaped in-memory
response with Vitest's `expect`.

This is the layer between unit-testing a controller and driving a real browser
with Playwright. It mirrors the `NodeHTTPServerAdapter` passing a real request
into `NodeDispatcher`, but swaps the network for an in-memory `ResponseSink`.

## 1. Boot the application

`bootApp(sources)` accepts `@configuration` classes (registered with the
context) and/or plain controller classes (stored by class name for the handler
mapping). It wires `NodeAutoConfiguration`, the handler mapping, and the
dispatcher, returning `{ context, dispatcher, close }`:

```ts
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { TodoController } from '../src/todo-controller';

describe('Todo API', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootApp([TodoController]); // register the sources
        http = new MockHTTP(app);
    });

    afterAll(() => app.close()); // closes the context
});
```

`app.context` is the live `MetadataConfigApplicationContext` — reach in for
beans (`app.context.getValue(...)`), or pass `@configuration` classes that
register them.

### Reuse one booted context across suites

Booting is the expensive part. `cachedBootApp(sources)` returns the **same**
app for repeated calls with the same sources within a Vitest worker
(ref-counted); `releaseCachedApp(sources)` (or `app.close()`) drops one
reference and closes on the last:

```ts
import { cachedBootApp, releaseCachedApp, MockHTTP } from '@ndigo/test';

const app = cachedBootApp([TodoController]); // boots once per worker
// ... suite A ...
releaseCachedApp([TodoController]); // suite B's cachedBootApp reuses it
```

Vitest isolates modules per file by default, so the cache is per file. Sharing
one context across spec files requires `isolate: false` — a deliberate
trade-off, since a shared mutable context lets suites interfere.

## 2. Drive requests with `MockHTTP`

Construction takes the booted app (or a bare dispatcher). The fluent request
builder mirrors the adapter's request surface:

| Step     | Methods                                                                                  |
| :------- | :--------------------------------------------------------------------------------------- |
| Method   | `get(path)`, `post(path)`, `put(path)`, `delete(path)`, `patch(path)`, `query(path)`     |
| Mutate   | `.query({...})`, `.body({...})`, `.headers({...})`, `.cookies({...})`, `.session({...})` |
| Dispatch | `.exec()` → `Promise<MockResult>`                                                        |

```ts
const res = await http.get('/todos').query({ filter: 'active' }).exec();
const created = await http.post('/todos').body({ text: 'write docs' }).exec();
const secured = await http.get('/me').headers({ Authorization: 'Bearer t' }).exec();
```

`MockResult` is `{ response, route, json(), text() }`; `response` is a
`MemoryResponse` (`{ status, headers, body, completed }`):

```ts
expect(created.response.status).toBe(200);
expect(created.json()).toEqual({ text: 'write docs', checked: false });
expect(res.response.headers['content-type']).toContain('application/json');
```

Because the real interceptor chain runs, denials behave exactly as they do over
HTTP: a guard's `denialOf(403)` yields the `403` `application/problem+json`
document, a `401` adds the `WWW-Authenticate: Bearer` challenge, and a
`redirect` denial yields `302` + `Location`.

```ts
const denied = await http.get('/admin').exec();
expect(denied.response.status).toBe(403);
expect(denied.json()).toMatchObject({ status: 403 });
```

## 3. Browser applications

For browser apps (jsdom), `bootBrowserApp` (async) wires the real
`BrowserDispatcher` plus a `MemoryViewTarget` that captures the rendered view:

```ts
// @vitest-environment jsdom
import { bootBrowserApp, BrowserMockClient } from '@ndigo/test';

const app = await bootBrowserApp([TodoConfiguration]);
const browser = new BrowserMockClient(app);
await browser.dispatch('/account/settings');

expect(app.viewTarget.lastRender?.model).toEqual({ section: 'settings' });
app.close();
```

`BrowserMockClient.dispatch(path)` returns the captured render (output element

- model) and records it on `app.viewTarget`, so you can assert the view a
  route renders — not just the response.

## 4. Timing helpers

`delay(ms)` is a shared promise-based helper for specs that await real or fake
timers (re-exported from `@ndigo/util`). Use it instead of ad-hoc `setTimeout`
promises so fake-timer suites stay deterministic.

## 5. What the harness deliberately is not

- No real listener — sockets are Playwright's job.
- No assertion library — it returns shaped values for Vitest's `expect`.
- No mocking framework — it exercises real beans and real dispatch.

## References

- Decision: [AD-63](../decisions/2026-09-04_AD63_NDIGO_TEST_HARNESS.md) — the
  in-process, socket-free harness.
- Generated API: [`@ndigo/test` api](../../packages/ndigo-test/api/README.md).
- Demo usage: [`apps/03-ndigo-todo`](../../apps/03-ndigo-todo/README.md) —
  harness-driven controller and shell-router specs.

[Back to guides](./README.md)
