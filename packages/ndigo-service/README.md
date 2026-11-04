# Ndigo Service

> Service-layer abstractions for Ndigo: typed service clients, server-sent event streams, and service registration.

`@ndigo/service` packages remote services behind Ndigo contracts: `serviceClient` turns a `@service`-decorated class into a typed client whose methods resolve schema-validated JSON — or an async iterable of parsed Server-Sent Events for `{ stream: true }` calls. `ServerSentEventParser` and `parseServerSentEvents` decode `text/event-stream` bodies incrementally, while `MapServiceRegistry`, `EventEmitterTelemetryHooks`, and `CryptoRequestIdCorrelation` cover registration, telemetry, and request-id correlation.

## Installation

```bash
pnpm add @ndigo/service @tsmetadata/polyfill
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

The decorators read and write TC39 decorator metadata (`Symbol.metadata`). Import the polyfill once, before any decorated class is evaluated:

```ts
import '@tsmetadata/polyfill';
```

## Getting Started

```ts
import '@tsmetadata/polyfill';
import { service, getCall, serviceClient, type ServerSentEvent } from '@ndigo/service';
import { HTTP } from '@ndigo/http';

@service('ticker', { baseUrl: 'https://api.example.com' })
class TickerAPI {
    @getCall('/ticks', { stream: true })
    ticks(): AsyncIterable<ServerSentEvent> {
        return undefined as never; // implemented by the serviceClient proxy
    }
}

const client = serviceClient(TickerAPI, new HTTP());

for await (const event of client.ticks()) {
    console.log(event.event, event.data);
}
```

## Usage

### JSON calls with a response schema

Declare the expected body with `responseSchema` (any Zod schema); the client validates the JSON response and resolves the parsed data. Without a schema the raw `Response` is returned, and `:name` path slots are filled from the method arguments in order.

```ts
import { z } from 'zod';
import { service, getCall, serviceClient } from '@ndigo/service';
import { HTTP } from '@ndigo/http';

const Account = z.object({ id: z.number(), name: z.string() });

@service('accounts', { baseUrl: 'https://api.example.com' })
class AccountsAPI {
    @getCall('/accounts/:id', { responseSchema: Account })
    getById(id: number): Promise<z.infer<typeof Account>> {
        return undefined as never;
    }
}

const accounts = serviceClient(AccountsAPI, new HTTP());
const account = await accounts.getById(42);
```

`@postCall`, `@putCall`, `@patchCall`, `@deleteCall`, and `@queryCall` declare the other HTTP methods; the first object argument becomes the JSON request body.

### Streaming SSE calls

`{ stream: true }` sends `Accept: text/event-stream` and returns an `AsyncIterable` of parsed events. With a `responseSchema`, each event's `data` payload is validated and the typed value is yielded instead of the raw event:

```ts
import { z } from 'zod';
import { service, getCall, serviceClient } from '@ndigo/service';
import { HTTP } from '@ndigo/http';

const Tick = z.object({ n: z.number() });

@service('ticker', { baseUrl: 'https://api.example.com' })
class TickerAPI {
    @getCall('/ticks', { stream: true, responseSchema: Tick })
    ticks(): AsyncIterable<z.infer<typeof Tick>> {
        return undefined as never;
    }
}

for await (const tick of serviceClient(TickerAPI, new HTTP()).ticks()) {
    console.log(tick.n);
}
```

### Parsing an event stream directly

`parseServerSentEvents` turns an async iterable of decoded chunks into events; `ServerSentEventParser.feed()` / `.finish()` expose the same parsing incrementally when you own the read loop.

```ts
import { parseServerSentEvents } from '@ndigo/service';

async function* chunks(): AsyncGenerator<string> {
    yield 'event: tick\ndata: {"n":1}\n\n';
}

for await (const event of parseServerSentEvents(chunks())) {
    console.log(event.event, event.data);
}
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Clients** — `serviceClient`, `service`, the call decorators (`getCall`, `postCall`, `putCall`, `deleteCall`, `patchCall`, `queryCall`), `fillPathTemplate`, `resolveCallBody`, `SERVICE_NAME_HEADER`, `getServiceConfig` / `getServiceCalls`
- **Streams** — `parseServerSentEvents`, `ServerSentEventParser`, `ServerSentEvent`
- **Interceptors** — `MappedServiceInterceptor`, `ServiceExecutionChain`, the `like*ServiceInterceptor` guards
- **Registry, telemetry, correlation** — `MapServiceRegistry`, `EventEmitterTelemetryHooks`, `CryptoRequestIdCorrelation`

## Development

```bash
pnpm --filter @ndigo/service build:lib
pnpm --filter @ndigo/service test
```

## See Also

- [@ndigo/http](../ndigo-http/README.md) — the underlying HTTP client
- [apps/06-ndigo-island](../../apps/06-ndigo-island/README.md) — a server-push SSE demo bridged to signals

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
