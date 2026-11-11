# Guide 11 — The HTTP Client

`@ndigo/http` is the Fetch-based HTTP client: an `HTTP` instance with a base URL
and default settings, an interceptor chain with explicit lifecycle hooks, body
transform pipelines, and WHATWG-aligned query/matrix parsers. Server handlers
and browser code use the same class, so request behavior is identical on both
sides.

For the server side of an HTTP interaction (routing, binding, views), see
[guide 01](./01-building-a-node-api.md); for exercising a client in tests, see
[guide 36](./36-testing.md).

**Audience:** Node and browser application developers · **Prerequisites:** Workspace bootstrapped; no prior guide required · **Reference app:** `[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)`, `[apps/19-ndigo-hn](https://github.com/ndigo/ndigo/tree/main/apps/19-ndigo-hn)`

## What you'll learn

- Create a client with `HTTP.create` and send every verb.
- Use the interceptor lifecycle hooks and built-ins.
- Compose request/response body transforms.
- Parse query and matrix strings.
- Add caching, offline queueing, and retries.

## 1. Create a client

`HTTP.create(config)` is the recommended standalone entry point. It accepts the
default Fetch `RequestInit` surface plus three client-specific keys:

```ts
import { HTTP, TimeoutInterceptor, ContentTypeInterceptor } from '@ndigo/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { 'Content-Type': 'application/json' },
    params: { version: 'v2' }, // merged into every request's query string
    interceptors: [new TimeoutInterceptor(5000), new ContentTypeInterceptor()],
});
```

- `baseURL` — base for relative inputs; a relative base is ignored (the
 platform default applies) so absolute inputs never throw at parse time.
- `headers` / `params` — instance defaults, merged with per-request values.
- `fetch` — a custom Fetch implementation (defaults to `globalThis.fetch`).
- `requestTransforms` / `responseTransforms` — body transform pipelines (added
 as an internal `TransformInterceptor`).

Under dependency injection, construct `new HTTP(interceptors, init, fetch)`
directly (the `AsHTTPStrategy` pattern); `create` is a thin wrapper over it.

## 2. Send requests

Every verb is a thin wrapper over `request(input, init)` that sets the method:

```ts
const res = await api.get('/users/42');
const created = await api.post('/users', { body: JSON.stringify({ name: 'Ada' }) });
await api.put('/users/42', { body: JSON.stringify({ name: 'Grace' }) });
await api.patch('/users/42');
await api.delete('/users/42');
```

Verbs: `get`, `head`, `options`, `post`, `put`, `patch`, `delete`, `connect`,
`trace`, plus `request` for anything else. `input` is resolved against
`baseURL`; instance and request `params` are merged onto the URL.

## 3. Interceptors

An interceptor declares which hooks it implements; the chain runs them in
order:

| Hook | When |
|:------------- |:------------------------------------------------------ |
| `preInit` | before the request is built — veto by returning `false` |
| `preRequest` | can replace the `Request` (auth/header rewrites) |
| `postResponse` | after Fetch resolves — can replace the `Response` |
| `postError` | on a thrown fetch/transform error — can normalize it |
| `postComplete` | always, after the response/error is settled |

Built-in interceptors cover the common cases: `TimeoutInterceptor`,
`ContentTypeInterceptor`, `HeaderInterceptor`, `RetryInterceptor`,
`CacheInterceptor`, `TraceHeaderInterceptor`, `AppResetInterceptor`,
`ErrorNormalizationInterceptor`, `NotOKInterceptor`, `ResponseTypeInterceptor`,
and the response-code/class mappers. Compose them in `interceptors`:

```ts
import { HTTP, RetryInterceptor, ErrorNormalizationInterceptor } from '@ndigo/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    interceptors: [new ErrorNormalizationInterceptor(), new RetryInterceptor()],
});
```

Order matters: a later interceptor can replace the `Request`, so identity-
sensitive interceptors (retry caching, offline replay) must account for that —
see the review register in `docs/plans/2026-10-06_COMPREHENSIVE_REVIEW_AND_MITIGATION.md`.

## 4. Body transforms and parsers

`requestTransforms` / `responseTransforms` run on the way out and back in
(JSON encode/decode, shaping) behind a single `TransformInterceptor`:

```ts
const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    responseTransforms: [(body) => ({ ...body, receivedAt: Date.now() })],
});
```

`QueryString` and `MatrixString` parse the two path/query vocabularies the
framework also uses server-side, so client and server agree byte for byte:

```ts
import { QueryString, MatrixString } from '@ndigo/http';

const params = QueryString.parse('a=1&a=2&b=3'); // { a: ['1','2'], b: '3' }
```

## See also

- Generated API: [`@ndigo/http` api](../../packages/ndigo-http/api/README.md);
 the full symbol surface is on the package README.
- Decision: —
 the body transform pipeline.
- Related: [guide 19](./19-caching.md) (client `memoize`),
 [guide 35](./35-method-interception-and-resilience.md) (retry/circuit-breaker policies),
 [guide 36](./36-testing.md) (`@ndigo/test` exercises HTTP-boundary behavior).

[Back to guides](./README.md)
