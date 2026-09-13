# Blue HTTP

An HTTP client for BlueJS built on the Fetch API, with a flexible
interceptor system, body transforms, and type-safe HTTP vocabulary.

## Features

- **Interceptor system** — lifecycle hooks (`preInit`, `preRequest`,
  `postResponse`, `postError`, `postComplete`) with URL-pattern-matched
  application (`MappedHTTPInterceptor`)
- **Built-in interceptors** — timeout, content-type, response-class, cache,
  trace-header, and friends — compose per request
- **Body transforms** — request/response transform pipelines
- **Parsers** — `QueryString` aligned with the WHATWG `URLSearchParams`
  parser (empty values as `''`, `&`-only splitting, lenient percent-decoding;
  repeated keys aggregate into arrays); `MatrixString` for path-segment
  parameters. Full parity with the built-in parser is asserted by
  `url-search-params-compat.spec.ts`
- **HTTP vocabulary** — status code and header constants for type-safe code

## Usage

### 1. Static factory (standalone)

```ts
import { HTTP } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { 'Content-Type': 'application/json' },
});

const res = await api.request('GET', '/users/42');
```

### 2. Interceptors and transforms

```ts
import { HTTP, TimeoutInterceptor, ContentTypeInterceptor } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    interceptors: [new TimeoutInterceptor(5000), new ContentTypeInterceptor()],
});
```

## Development

```bash
pnpm --filter @blue/http build:lib
pnpm --filter @blue/http test
```

## See Also

- [@blue/test](../blue-test/README.md) — in-process dispatch for exercising
  HTTP-boundary behavior
- [@blue/platform-web](../blue-platform-web/README.md) — offline queueing and
  fetch-credentials interceptors built on this client