# Blue HTTP

> Fetch-based HTTP client for BlueJS — interceptor system, body transforms, and a type-safe HTTP vocabulary.

An HTTP client for BlueJS built on the Fetch API, with a flexible interceptor system, body transforms, and type-safe HTTP vocabulary.

## Installation

```bash
pnpm add @blue/http
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

### Static factory (standalone)

```ts
import { HTTP } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { 'Content-Type': 'application/json' },
});

const res = await api.request('GET', '/users/42');
```

## Usage

### Interceptors and transforms

```ts
import { HTTP, TimeoutInterceptor, ContentTypeInterceptor } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    interceptors: [new TimeoutInterceptor(5000), new ContentTypeInterceptor()],
});
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

- **Client** — `HTTP.create(...)` static factory
- **Interceptors** — timeout, content-type, response-class, cache, trace-header (lifecycle hooks: `preInit`, `preRequest`, `postResponse`, `postError`, `postComplete`)
- **Parsers** — `QueryString` (WHATWG `URLSearchParams` parity), `MatrixString` for path-segment parameters
- **Body transforms** — request/response transform pipelines
- **HTTP vocabulary** — status code and header constants
- **URL matching** — `EqualsURLMatcher` matches exact URLs and ranks exact matches
  first through the core `AbstractValueComparator` base; nonmatching patterns tie.

## Development

```bash
pnpm --filter @blue/http build:lib
pnpm --filter @blue/http test
```

## See Also

- [@blue/test](../blue-test/README.md) — in-process dispatch for exercising HTTP-boundary behavior
- [@blue/platform-web](../blue-platform-web/README.md) — offline queueing and fetch-credentials interceptors built on this client

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
