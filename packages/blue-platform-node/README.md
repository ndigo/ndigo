# Blue Platform Node

> Node.js HTTP argument resolvers, environment integration, and auto-configuration for @blue/dispatcher.

Blue Platform Node provides Node.js HTTP argument resolvers and environment integration for @blue/dispatcher.

## Installation

```bash
pnpm add @blue/platform-node
```

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

## Usage

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

### TLS and HTTP/2 origin (opt-in)

The origin listens on plaintext HTTP/1.1 by default — the edge-terminated
posture (see [guide 01 §8](../../docs/guides/01-building-a-node-api.md#8-deployment-topology--tls-and-http23-at-the-edge)
and [AD-80](../../docs/decisions/2026-10-09_AD80_HTTP23_EDGE_TERMINATION.md)).
Pass TLS material and the listener becomes an `http2.createSecureServer`
in `allowHTTP1` mode: ALPN negotiates HTTP/2 with an HTTP/1.1 fallback on
one port, and WebSockets keep riding h1.1 (neither `ws` nor browsers
implement RFC 8441 — [AD-81](../../docs/decisions/2026-10-09_AD81_NATIVE_HTTP2.md)).

```ts
const server = new HTTPServer(dispatcher, {
    tls: {
        key: '/etc/tls/key.pem', // inline PEM or path
        cert: '/etc/tls/cert.pem',
        clientAuth: 'require', // mutual TLS: 'none' | 'request' | 'require'
        maxConcurrentStreams: 128, // bound h2 streams per connection
    },
});
```

Environment-driven alternative (default adapter only, all-or-nothing:
a half-configured pair throws rather than serving plaintext):

```text
BLUE_TLS_KEY=/etc/tls/key.pem
BLUE_TLS_CERT=/etc/tls/cert.pem
BLUE_TLS_CA=                      # optional; blank values count as unset
```

`node:http2` is stable in the supported Node 24 LTS line; it cannot load
only on Node builds compiled without crypto support (rare — distro
hardened builds), in which case the module import fails at startup and
plaintext serving is unavailable. Certificates are read once at bind
time; rotate by restarting the process.

### CSRF Protection

`CSRFInterceptor` enforces double-submit-cookie validation on mutating
requests (`POST`/`PUT`/`DELETE`/`PATCH`/`QUERY`): the `X-CSRF-Token` header
(or `csrf_token` body field) must match the `__Host-blue-csrf` cookie,
compared in constant time. Safe requests mint the cookie when it is absent.

The `__Host-` prefix is the server-side binding: browsers only accept such a
cookie when it is `Secure`, `Path=/`, and has no `Domain` attribute (the
interceptor's defaults), so a sibling subdomain cannot overwrite it — the
cookie-tossing attack that defeats an unprefixed double-submit cookie.
**Trust assumption:** this protection holds only while the prefix and the
`Secure`/`Path=/` attributes are kept. Overriding `cookieName` with a
non-prefixed name gives up the host pinning: any sibling subdomain can then
set the cookie and forge a matching submission — do that only when every
subdomain is trusted. Dropping `Secure`/`Path=/` (or adding a `Domain`)
while keeping the prefix makes browsers reject the cookie, so mutating
requests fail closed. Pair the interceptor with
`NodeSessionInterceptor` and `AuthRouteGuard` for cookie-authenticated
routes; see the [authentication guide](../../docs/guides/11-authentication-and-sessions.md#6-csrf-on-auth-mutations).

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

### Argument Resolvers

The package provides 9 argument resolvers for binding request data to controller method parameters:

- `QueryValueMethodArgumentResolver`: Binds query parameters from the URL (the dispatcher's platform-independent default, shared with the browser)
- `PathValueMethodArgumentResolver`: Binds path parameters from the route (the dispatcher's platform-independent default, shared with the browser)
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
  :- A `jobDriver` + `jobQueue` + `jobHandlerRegistry` + `jobRunner` set
  (`@blue/jobs`): `@jobHandler` methods are discovered at refresh, and the
  runner starts explicitly (worker processes call `start()`; an unstarted
  runner arms no timer) — see
  [guide 22](../../docs/guides/22-jobs-and-outbox.md)
  :- A `lockDriver` bean (`@blue/locks`): the default in-process driver
  coordinates schedulers within one process; register a `RedisLockDriver`
  bean to make `@scheduled({ lock })` arbitrate across nodes — see
  [guide 23](../../docs/guides/23-distributed-locks.md)
  :- A `flagEvaluator` + `flagContextResolver` pair (`@blue/flags`): the
  `@whenFeature` gate is default-on and evaluates through them — the default
  evaluator reads `feature.*` properties live, the default context resolver
  targets the session principal (else the client address); override either
  bean for vendor flagging and tenant/attribute targeting — see
  [guide 28](../../docs/guides/28-feature-flags.md)
  :- A managed `httpServer` entry (`HTTPServer`, a `SmartLifecycle` bean)
  :- A `socketSessionRegistry` bean (`SocketSessionRegistry`): rooms, path
  broadcast, heartbeat, and backpressure for `@socketMapping` endpoints —
  shared with the managed server's adapter, so any service can push to a
  socket room
  :- An optional `socketRequestAuthenticator` bean: upgrade-time identity for
  sockets, and with it the socket-side `@authenticated`/`@authorized`
  enforcement — see [Socket authentication](#socket-authentication)

Applications that previously relied on no language negotiation now render
with the header-negotiated locale (`en-US` default) — see the
[content and i18n guide](../../docs/guides/04-i18n-and-content.md).

### WebSockets (`@socketMapping`)

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

#### Opt-in cross-node paths and rooms

The default registry remains process-local. Supply an application-owned fanout
transport explicitly; `HTTPServer` does not register it or connect it for you:

```ts
import { RedisConnection } from '@blue/redis';
import { RedisSocketFanout } from '@blue/redis/pubsub';
import { HTTPServer, NodeSocketSessionRegistry } from '@blue/platform-node';

const url = process.env.REDIS_URL!;
const publisher = new RedisConnection({ url });
const fanout = new RedisSocketFanout({
    connection: publisher,
    subscriberUrl: url,
    namespace: 'my-app.production',
});
const registry = new NodeSocketSessionRegistry({ fanout });
const server = new HTTPServer(dispatcher, { socketRegistry: registry });
await publisher.connect();
await fanout.connect();
await registry.connect(); // path + room subscriptions ready before serving
await server.start();
await registry.broadcast('/ws/chat', { event: 'notice' });
await registry.broadcastTo('lobby', new Uint8Array([0, 1, 255]));
```

`dispatcher` is your existing `NodeDispatcher`. The `socketRegistry` option is
for the default adapter only; a custom adapter must receive its registry itself.
Without the explicit option, the managed server resolves the
`socketSessionRegistry` context bean. Either way, services must publish through
the **same** registry used by the adapter. Joins, counts and socket ownership
remain local; only path/room payloads cross nodes. `broadcast` and `broadcastTo`
return `Promise<void>` even in local mode; await them. Configured transport
failure rejects before best-effort local delivery, never falls back silently.

Stop producers and close the server, then await `registry.close()` (unsubscribe
and stop heartbeat), `fanout.close()` (owned subscriber), and
`publisher.close()` before synchronous context shutdown. Ensure later cleanup
runs with `finally` even on failure, including failed startup. The registry does
not own/close the transport. `StompBroker({ fanout })` can share it for topics;
await `broker.connect()` before serving and `broker.close()` before transport
shutdown. Each transport permits one consumer per scope. See the
[websockets guide](../../docs/guides/06-websockets.md#cross-node-live-fan-out-opt-in)
for complete composition, failure semantics, Redis limits and deployment policy.

### Socket authentication

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

`apps/04-blue-api` is the reference wiring: a `socketRequestAuthenticator` bean
resolves a demo token from `?token=` on the upgrade URL or an
`Authorization: Bearer …` header (through the app's own
`lookupPrincipal`), and `/stomp/chat` is marked `@authenticated` while the
raw `/ws/chat` endpoint stays public as the documented contrast.

### Managed server + graceful shutdown

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

### RFC 9457 error documents

Every 4xx/5xx response is `application/problem+json`: `type`
(`urn:blue:*` placeholder), `title`, `status`, `detail`, `instance`, and an
`errors` extension for validation issues. `ProblemDetails`, `ProblemTypes`,
and `writeProblem` are exported for custom errors.

### Guides

- [Building a Node API](../../docs/guides/01-building-a-node-api.md)
- [Request Validation](../../docs/guides/02-request-validation.md)

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
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
