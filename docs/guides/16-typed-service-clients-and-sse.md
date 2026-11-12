# Guide 16 — Typed Service Clients & SSE

`@ndigo/service` turns a decorated class into a typed remote-service client:
method metadata declares the HTTP call, a Zod schema validates the response, and
`{ stream: true }` switches the same method to Server-Sent Events. The HTTP
transport and its interceptors still come from `@ndigo/http` (guide 11); this
package is the domain façade over it.

**Audience:** Node and browser application developers · **Prerequisites:** Guides [11](11-http-client.md) and [15](15-websockets.md) · **Reference app:** [apps/07-ndigo-island](https://github.com/ndigo/ndigo/tree/main/apps/07-ndigo-island)

## What you'll learn

- Declare a service and its calls with `@service` and the `@*Call` decorators.
- Fill path slots and request bodies from method arguments.
- Validate JSON responses with a Zod schema.
- Consume SSE as an async iterable, with or without per-event validation.
- Add registry, telemetry, request-id correlation, and interceptors.

## 1. Declare a service

A service is a decorated class whose methods are never implemented — the
`serviceClient` proxy supplies them. Import the metadata polyfill once before
any decorated class is evaluated:

```ts
import '@tsmetadata/polyfill';
import { service, getCall, serviceClient } from '@ndigo/service';
import { HTTP } from '@ndigo/http';

@service('accounts', { baseUrl: 'https://api.example.com', timeoutMs: 5_000 })
class AccountsAPI {
    @getCall('/accounts/:id', { responseSchema: Account })
    getById(id: number): Promise<Account> {
        return undefined as never;
    }
}

const accounts = serviceClient(AccountsAPI, new HTTP());
const account = await accounts.getById(42);
```

`@service` records the name (the registry token and correlation tag), base URL,
optional timeout, and default headers. The client proxy resolves the call
metadata, fills the URL, delegates to the HTTP client, and returns the validated
body. A method with no `responseSchema` returns the raw `Response`.

## 2. Calls and arguments

| Decorator     | Method             |
| ------------- | ------------------ |
| `@getCall`    | `GET`              |
| `@postCall`   | `POST`             |
| `@putCall`    | `PUT`              |
| `@patchCall`  | `PATCH`            |
| `@deleteCall` | `DELETE`           |
| `@queryCall`  | `QUERY` (RFC 9889) |

Path slots (`:id`) are filled from the method arguments in order. For
body-carrying methods, the first object argument becomes the JSON request body:

```ts
@postCall('/accounts')
createAccount(input: CreateAccount): Promise<Account> {
    return undefined as never;
}
```

`fillPathTemplate` and `resolveCallBody` are exported if you need the same
rules outside the proxy. Without a response schema the caller owns parsing and
error handling; with one, a validation failure rejects the call with an
`IllegalStateError` that names the failing path.

## 3. Streaming with SSE

Add `{ stream: true }` to send `Accept: text/event-stream` and return an
`AsyncIterable` of parsed events:

```ts
@service('ticker', { baseUrl: 'https://api.example.com' })
class TickerAPI {
    @getCall('/ticks', { stream: true })
    ticks(): AsyncIterable<ServerSentEvent> {
        return undefined as never;
    }
}

for await (const event of serviceClient(TickerAPI, new HTTP()).ticks()) {
    console.log(event.event, event.data);
}
```

With `responseSchema`, each event's `data` payload is validated and the typed
value is yielded instead of the raw event:

```ts
const Tick = z.object({ n: z.number() });

@getCall('/ticks', { stream: true, responseSchema: Tick })
ticks(): AsyncIterable<z.infer<typeof Tick>> {
    return undefined as never;
}
```

The stream ends when the server closes it; a network failure rejects the
iteration. There is no automatic reconnect or replay — implement resume logic in
the consumer or use the socket client (guide 15) when you need it.

## 4. Parsing an event stream directly

When you own the read loop (a custom transport, a test, a proxy), use the
parser:

```ts
import { parseServerSentEvents } from '@ndigo/service';

async function* chunks(): AsyncGenerator<string> {
    yield 'event: tick\ndata: {"n":1}\n\n';
}

for await (const event of parseServerSentEvents(chunks())) {
    console.log(event.event, event.data);
}
```

`ServerSentEventParser.feed(chunk)` and `.finish` expose the same incremental
behavior. The parser handles multi-line `data:`, comments, `id:`, `retry:`, and
the blank-line frame boundary; it does not reconnect.

## 5. Registry, telemetry, correlation

Three small adapters cover common operational needs:

- `MapServiceRegistry` — token → endpoint lookup; register each service once
  and resolve the base URL at wiring time.
- `EventEmitterTelemetryHooks` — emits `service:request:start`,
  `service:request:end`, and `service:request:error` on a context emitter.
- `CryptoRequestIdCorrelation` — generates a request id and exposes the header
  to attach, so logs and downstream traces share one id.

They are plain classes; wire them in a configuration entry and pass them to the
code that builds the client. The service client itself stays transport-only.

## 6. Interceptors

The client uses the `HTTP` instance you pass in, so the HTTP interceptor
lifecycle applies unchanged (guide 11): auth headers, retries, tracing, and
caching compose around the service call. `ServiceExecutionChain` and the
`ServiceInterceptor` contracts exist for the stateful `Service` class; a
`serviceClient` is the simpler default.

## 7. Pitfalls

- **Declare return types as never-implemented.** The decorated method body is
  replaced by the proxy; throwing “not implemented” at call time means the
  client was not built with `serviceClient`.
- **Import the metadata polyfill first.** A decorated class evaluated before
  the polyfill silently loses its metadata.
- **A missing `responseSchema` returns a `Response`, not data.** Parse and
  validate it yourself or add the schema.
- **SSE is one-shot.** Reconnect/resume is the consumer's job; the parser only
  decodes frames.
- **Do not put auth in the service decorator.** Use the HTTP client's header
  interceptor so token refresh and retries see the current credential.
- **Paths are templates, not URLs.** `:name` slots are positional; encode
  values before passing them.

## See also

- [Guide 11 — The HTTP Client](11-http-client.md) — transport, interceptors, and retries
- [Guide 15 — WebSockets](15-websockets.md) — the persistent realtime alternative
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — `streamToSignal` over an SSE call
- [`@ndigo/service`](../../packages/ndigo-service/README.md) — the full client/stream surface
- [apps/07-ndigo-island](https://github.com/ndigo/ndigo/tree/main/apps/07-ndigo-island) — SSE → signals in a real app
- and — the service and server-push decisions
