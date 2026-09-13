# Blue Service

Service-layer abstractions for BlueJS: typed service clients, server-sent
event streams, and service registration.

## Overview

`@blue/service` packages remote services behind BlueJS contracts:

- **`serviceClient`** — build a typed client for a service definition; each
  method yields validated response data, or an async iterable of events for
  streaming endpoints
- **`@service` decorators** — declare service methods and schemas on a class
- **Server-sent events** — `feed`/`finish` helpers for SSE-style streams with
  request-id correlation
- **Service registry** — locate service definitions at runtime

## Usage

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

## Development

```bash
pnpm --filter @blue/service build:lib
pnpm --filter @blue/service test
```

## See Also

- [@blue/http](../blue-http/README.md) — the underlying HTTP client
- [apps/blue-island](../../apps/blue-island/README.md) — typed service streams
  bridged to signals