# Blue Platform Node

> Node.js HTTP argument resolvers, environment integration, and auto-configuration for @blue/dispatcher.

Blue Platform Node provides Node.js HTTP argument resolvers and environment integration for @blue/dispatcher.

## Installation

```bash
pnpm add @blue/platform-node
```

## Features

### Argument Resolvers

The package provides 9 argument resolvers for binding request data to controller method parameters:

- `NodeQueryValueMethodArgumentResolver`: Binds query parameters from the URL
- `NodePathValueMethodArgumentResolver`: Binds path parameters from the route
- `NodeHeaderValueMethodArgumentResolver`: Binds HTTP headers
- `NodeBodyValueMethodArgumentResolver`: Binds request body data
- `NodeDataBindingMethodArgumentResolver`: Binds a whole source (`body` / `cookie`) into an object
- `NodeRequestPartMethodArgumentResolver`: Binds multipart JSON/text parts
- `NodeMultipartFileMethodArgumentResolver`: Binds multipart file parts
- `NodeCookieValueMethodArgumentResolver`: Binds cookies from the request
- `NodeRequestSessionValueMethodArgumentResolver`: Binds request-session data

### NodeEnvironment

A Node.js environment implementation that includes `process.env` as the first property source, extending `StandardEnvironment`.

### NodeAutoConfiguration

Auto-configuration for Node.js-based applications that provisions:

- Argument-value converter registry
- All 9 argument resolvers
- Default handler mapping for metadata-driven dispatch
- The error-resolver chain (400 binding, 401/403 denials, 422 validation,
  500 last-resort)
  :- An `Accept-Language` language resolver (`AcceptHeaderLanguageResolver`,
  default `en-US`) — the negotiated language reaches views, templates,
  and islands via the route's `language` attribute
  :- A `taskScheduler` + `scheduleRegistry` pair: `@scheduled` methods on
  registered beans are auto-discovered and auto-started with zero wiring
  :- A managed `httpServer` entry (`HTTPServer`, a `SmartLifecycle` bean)
  :- A `socketSessionRegistry` bean (`SocketSessionRegistry`): rooms, path
  broadcast, heartbeat, and backpressure for `@socketMapping` endpoints —
  shared with the managed server's adapter, so any service can push to a
  socket room
  :- An optional `socketRequestAuthenticator` bean: upgrade-time identity for
  sockets, and with it the socket-side `@authenticated`/`@authorized`
  enforcement — see [Socket authentication](#socket-authentication)

Applications that previously relied on no language negotiation now render
with the header-negotiated locale (`en-US` default) — see

## WebSockets (`@socketMapping`)

The managed server serves WebSocket endpoints alongside HTTP routes with
the same dispatcher, `@parameters` binding, and Zod validation. The
registry bean auto-joins every session to its endpoint path and offers
broadcast, named rooms, heartbeats, and a slow-consumer guard.

Transport bounds and behavior are env-tunable:

| Env var                             | Default   | Meaning                                                                                   |
| ----------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS` | `30000`   | Ping cadence; `0` disables the heartbeat                                                  |
| `BLUE_SOCKET_IDLE_TIMEOUT_MS`       | `60000`   | Reap sessions silent past this (close `1001`)                                             |
| `BLUE_SOCKET_MAX_PAYLOAD_BYTES`     | `1048576` | WS frame payload cap (violations close `1009`)                                            |
| `BLUE_SOCKET_MAX_QUEUED_MESSAGES`   | `1024`    | Inbound queue cap per session (overflow closes `1013`)                                    |
| `BLUE_SOCKET_MAX_QUEUED_BYTES`      | `4194304` | Inbound byte budget per session (overflow closes `1013`); `0` disables                    |
| `BLUE_SOCKET_MAX_BUFFERED_BYTES`    | `1048576` | Outbound buffered-bytes watermark (per `onOverflow`); `0` disables                        |
| `BLUE_SOCKET_ON_OVERFLOW`           | `close`   | Over-watermark policy: `close` (`1013`) or `drop`                                         |
| `BLUE_SOCKET_ALLOWED_ORIGINS`       | unset     | Comma-separated bare origins for upgrade checks; unset allows any origin (public sockets) |

Programmatic knobs (`NodeHTTPServerAdapter` / `HTTPServer` options):
`backpressure` (1 MiB watermark, `close` `1013` / `drop` / disabled),
`onOverflow` observer (`addOverflowObserver` for post-construction wiring),
`authenticate(sources)` upgrade hook (populates `session.attributes`,
`null` rejects with `1008`), `authenticateTimeoutMs` (milliseconds the hook
may take before the socket closes `1011`; default `10000`), `maxConnections`
(concurrent connections, counted from the accepted upgrade until close;
default `10000`, overflow closes `1013`, `Infinity` disables),
`allowedWebSocketOrigins`, and `socketLimits`.
See the [websockets guide](../../docs/guides/06-websockets.md) and
[Socket authentication](#socket-authentication).

## Socket authentication

HTTP requests get authentication from the interceptor chain: `AuthRouteGuard`
reads the `@authenticated` / `@authorized` metadata that `@blue/auth-core`
writes onto the controller class. **Sockets do not run interceptors** — they
are dispatched straight to the handler — so the adapter enforces the same
metadata at dispatch time:

- a `@socketMapping` / `@stompMapping` method (or its controller class)
  marked `@authenticated` requires a principal: the upgrade is closed with
  `1008` when `session.attributes['principal']` is missing or is not an
  object with a `hasRole` method;
- `@authorized('role')` additionally requires every declared role on that
  principal (`1008` otherwise); roles imply authentication, as on the HTTP
  path;
- a socket method without auth metadata behaves exactly as before (a public
  endpoint).

Identity comes from one of two places:

1. the `authenticate(sources)` option (`NodeHTTPServerAdapter` /
   `HTTPServer`) — return the attribute bag to merge into
   `session.attributes`, or `null` to refuse the upgrade with `1008`;
2. an application-context bean named `socketRequestAuthenticator`
   implementing the exported `SocketRequestAuthenticator` interface
   (`authenticate(sources)`, same contract). `HTTPServer` resolves it at
   start, so bean-based applications wire identity declaratively; the
   explicit option wins when both are present.

The returned bag MUST carry `principal` for `@authenticated` /
`@authorized` endpoints — any object with `hasRole(role)` works, and
`@blue/auth-core`'s `Principal` satisfies it — and SHOULD carry `user` (a
string id), which the STOMP broker uses for its `/user/*` scope. With no
authenticator configured, sockets accept any client: the explicit
public-endpoint posture.

`apps/blue-api` is the reference wiring: a `socketRequestAuthenticator` bean
resolves a demo token from `?token=` on the upgrade URL or an
`Authorization: Bearer …` header (through the app's own
`lookupPrincipal`), and `/stomp/chat` is marked `@authenticated` while the
raw `/ws/chat` endpoint stays public as the documented contrast.

## Managed server + graceful shutdown

`HTTPServer` is provisioned by `NodeAutoConfiguration` (not constructed
manually). Start it explicitly and wire signals:

```ts
const context = new ApplicationBuilder([NodeAutoConfiguration, AppConfig]).run();
const server = context.getValue<HTTPServer>('httpServer');
await server.start();
gracefulShutdown(context, { resources: [server] });
```

`context.close()` also stops the server via the lifecycle processor.
`gracefulShutdown` drains the server then closes the context on
`SIGINT`/`SIGTERM`, exiting `0`.

## RFC 9457 error documents

Every 4xx/5xx response is `application/problem+json`: `type`
(`urn:blue:*` placeholder), `title`, `status`, `detail`, `instance`, and an
`errors` extension for validation issues. `ProblemDetails`, `ProblemTypes`,
and `writeProblem` are exported for custom errors.

## Guides

- [Building a Node API](../../docs/guides/01-building-a-node-api.md)
- [Request Validation](../../docs/guides/02-request-validation.md)

## Getting Started

### With @blue/boot

Register `NodeAutoConfiguration` alongside `NodeEnvironment` with your `ApplicationContext` to enable full server-side argument resolution:

```typescript
import { GenericApplicationContext } from '@blue/context';
import { NodeAutoConfiguration } from '@blue/platform-node';
import { NodeEnvironment } from '@blue/platform-node';

const context = new GenericApplicationContext('my-app');
context.registerConfiguration(NodeAutoConfiguration);
context.setValue('environment', new NodeEnvironment());
```

### Request Limits and Error Semantics

`NodeHTTPServerAdapter` bounds every request: body size, header size, total
request time, header timeout, keep-alive, and shutdown drain. Defaults are
conservative (1 MiB bodies, 30s request window, 10s header timeout).

```typescript
import { NodeHTTPServerAdapter } from '@blue/platform-node';

const adapter = new NodeHTTPServerAdapter(dispatcher, {
    limits: {
        maxBodyBytes: 2_097_152, // 2 MiB
        requestTimeoutMs: 15_000,
        shutdownTimeoutMs: 5_000,
    },
});
```

Error responses are deterministic and leak no internals:

| Status | Condition                                     | Body                                |
| ------ | --------------------------------------------- | ----------------------------------- |
| `400`  | Malformed URL, malformed JSON, aborted body   | `{"error":"…"}` code                |
| `408`  | Request/body timeout                          | `{"error":"request_timeout"}`       |
| `413`  | Body exceeds `maxBodyBytes`                   | `{"error":"body_too_large"}`        |
| `431`  | Cookie header exceeds `maxHeaderBytes`        | `{"error":"headers_too_large"}`     |
| `500`  | Dispatch failure (details logged server-side) | `{"error":"Internal Server Error"}` |

JSON bodies are parsed strictly against their `Content-Type` — malformed JSON
is a `400`, never silently reshaped. `listen()` rejects on bind errors, and
`close()` drains in-flight requests up to `shutdownTimeoutMs`.

### Controller Example

```typescript
import { requestMapping, getMapping, postMapping, parameters } from '@blue/dispatcher';
import { pathVariable, queryValue, headerValue, bodyValue, cookieValue, requestSessionValue } from '@blue/dispatcher';

@requestMapping('/users')
class UserController {
    @getMapping('/:id')
    @parameters({
        id: pathVariable('id'),
        include: queryValue('include'),
        authHeader: headerValue('authorization'),
    })
    getUser(id: string, include: string, authHeader: string) {
        return { id, include, authHeader };
    }

    @postMapping('/')
    @parameters({
        name: bodyValue('name'),
        sessionId: cookieValue('sessionId'),
        userId: requestSessionValue('userId'),
    })
    createUser(name: string, sessionId: string, userId: string) {
        return { name, sessionId, userId };
    }
}
```

### Custom Configuration

Use `configureNodeArgumentResolvers()` to register the platform resolver
chain explicitly (auto-configuration does this for you):

```typescript
import { configureNodeArgumentResolvers } from '@blue/platform-node';

configureNodeArgumentResolvers(context);
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/platform-node build:lib
pnpm --filter @blue/platform-node test
```

## See Also

- [@blue/dispatcher](../blue-dispatcher/README.md) — platform-independent request dispatch this extends
- [@blue/boot](../blue-boot/README.md) — `ApplicationBuilder` wiring NodeAutoConfiguration

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
