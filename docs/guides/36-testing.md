# Guide 36 — Integration Testing

Unit tests prove a function works; integration tests prove the request pipeline works. The test harness boots a real application context and dispatcher, then sends requests without opening a port — interceptors, binding, validation, handlers, and view resolution all run. Tests assert on a shaped in-memory response.

**Use for:** route-level behavior, interceptor chains, and error contracts.

**Not for:** isolated logic (use plain unit tests) or end-to-end browser flows (use Playwright).

`@ndigo/test` provides `bootNodeApp`, `MockHTTP`, and the timing helpers.

**Audience:** All application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) or [Guide 02](02-building-a-browser-app.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)

## What you'll learn

- Boot a real application with `bootNodeApp`.
- Drive requests through `MockHTTP`.
- Test browser apps with `MockWebClient`.
- Use the timing helpers for async work.
- Know what the harness deliberately is not.

## 1. Boot the application

`bootNodeApp(sources)` accepts `@configuration` classes (registered with the
context) and/or plain controller classes (stored by class name for the handler
mapping). It wires `NodeAutoConfiguration`, the handler mapping, and the
dispatcher, returning `{ context, dispatcher, close }`:

```ts
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootNodeApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { TodoController } from '../src/todo-controller';

describe('Todo API', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootNodeApp([TodoController]); // register the sources
        http = new MockHTTP(app);
    });

    afterAll(() => app.close()); // closes the context
});
```

`app.context` is the live `MetadataConfigApplicationContext` — reach in for
entries (`app.context.getValue(...)`), or pass `@configuration` classes that
register them.

`bootNodeApp(sources, { processors })` registers entry processors before
refresh, the test-side equivalent of `ApplicationBuilder.processors(...)`. That
is how a suite wires `@ndigo/advice` rules, since a declared annotation on an
unadvised instance is inert:

```ts
import { hasAnnotation, interception } from '@ndigo/advice';
import { CachedInterceptor, cachedSpec } from '@ndigo/cache';

const app = bootNodeApp([TodoConfiguration], {
    processors: [interception([{ when: hasAnnotation(cachedSpec), use: new CachedInterceptor() }])],
});
```

`cachedBootNodeApp` takes the same options and keeps advised and unadvised apps
apart in its cache; callers needing two different advice sets of the same length
should use `bootNodeApp` directly.

### Reuse one booted context across suites

Booting is the expensive part. `cachedBootNodeApp(sources, options?)` returns the **same**
app for repeated calls with the same sources within a Vitest worker
(ref-counted); `releaseCachedNodeApp(sources, options?)` (or `app.close`) drops
one reference and closes on the last:

```ts
import { cachedBootNodeApp, releaseCachedNodeApp, MockHTTP } from '@ndigo/test';

const app = cachedBootNodeApp([TodoController]); // boots once per worker
// ... suite A ...
releaseCachedNodeApp([TodoController]); // suite B's cachedBootNodeApp reuses it
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
| Dispatch | `.exec` → `Promise<MockResult>`                                                          |

```ts
const res = await http.get('/todos').query({ filter: 'active' }).exec();
const created = await http.post('/todos').body({ text: 'write docs' }).exec();
const secured = await http.get('/me').headers({ Authorization: 'Bearer t' }).exec();
```

`MockResult` is `{ response, route, json, text }`; `response` is a
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

For browser apps (jsdom), `bootWebApp` (async) wires the real
`BrowserDispatcher` plus a `MemoryViewTarget` that captures the rendered view:

```ts
// @vitest-environment jsdom
import { bootWebApp, MockWebClient } from '@ndigo/test';

const app = await bootWebApp([TodoConfiguration]);
const browser = new MockWebClient(app);
await browser.dispatch('/account/settings');

expect(app.viewTarget.lastRender?.model).toEqual({ section: 'settings' });
app.close();
```

`MockWebClient.dispatch(path)` returns the captured render — the output
element plus the model — and records it on `app.viewTarget`, so you can
assert the view a route renders, not just the response.

An app that installs `viewTargeters` chooses its own destinations: a matched
targeter sends the output to its target and the capture stays empty, which
`dispatch` reports with a hint. Assert the real destination in jsdom, or
render a result that carries an explicit `ModelAndView.viewTarget`
([Guide 50 — View Targeting](50-view-targeting.md) §8). The capture is reset
per dispatch, so a redirected render can never surface as the previous
result.

## 4. Timing helpers

`delay(ms)` is a shared promise-based helper for specs that await real or fake
timers (re-exported from `@ndigo/util`). Use it instead of ad-hoc `setTimeout`
promises so fake-timer suites stay deterministic.

## 5. What the harness deliberately is not

- No real listener — sockets are Playwright's job.
- No assertion library — it returns shaped values for Vitest's `expect`.
- No mocking framework — it exercises real entries and real dispatch.

## See also

in-process, socket-free harness.

- Generated API: run `pnpm doc:api` for `@ndigo/test`.
- Demo usage: [apps/03-ndigo-todo-web](https://github.com/ndigo/ndigo/tree/main/apps/03-ndigo-todo-web) —
  harness-driven controller and shell-router specs.

[Back to guides](./README.md)
