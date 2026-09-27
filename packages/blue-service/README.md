# Blue Service

> Service-layer abstractions for BlueJS: typed service clients, server-sent event streams, and service registration.

`@blue/service` packages remote services behind BlueJS contracts: a `serviceClient` builds a typed client whose methods yield validated response data (or an async iterable of events for streaming endpoints); `@service` decorators declare service methods and schemas on a class; `feed`/`finish` helpers build SSE-style streams with request-id correlation; and a service registry locates service definitions at runtime.

## Installation

```bash
pnpm add @blue/service
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { serviceClient, getCall } from '@blue/service';
import { HTTP } from '@blue/http';

class TickerAPI {
    @getCall('/events')
    events(): AsyncIterable<{ n: number }>;
}

const client = serviceClient(TickerAPI, http);
for await (const event of client.events()) {
    console.log(event.n);
}
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **Clients** — `serviceClient`, `getCall` (and related call decorators)
- **SSE helpers** — `feed`, `finish`

## Development

```bash
pnpm --filter @blue/service build:lib
pnpm --filter @blue/service test
```

## See Also

- [@blue/http](../blue-http/README.md) — the underlying HTTP client
- [apps/blue-island](../../apps/blue-island/README.md) — typed service streams bridged to signals

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
