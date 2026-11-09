# Guide 01 — Building a Node API

This guide walks through the primary Ndigo server-side workflow end-to-end:
DI-scaffolded bootstrap, dependency configuration, controllers, request
binding, validation, the error contract, and graceful shutdown.

The finished shape of every pattern here lives in `apps/05-ndigo-api` — use it as
the canonical reference. Concepts link to the relevant decision record where the rationale
is worth reading.

**Audience:** Node application developers · **Prerequisites:** Workspace bootstrapped (`pnpm install`) and the Node platform packages built (`pnpm --filter @ndigo/platform-node build:lib`) · **Reference app:** `apps/05-ndigo-api` (minimal companion: `apps/02-ndigo-hello-node`)

## What you'll learn

- Bootstrap with `runNodeApplication` and control the manual `ApplicationBuilder` path.
- Bind configuration classes and register `@entry` beans.
- Map controllers and bind request arguments across every source.
- Return the RFC 9457 error contract and shut the server down cleanly.

## 1. Bootstrap: `runNodeApplication`

An application is assembled around a DI container. The Node preset
(`@ndigo/platform-node`, AD-90) wires the standard assembly — platform
auto-configuration, a `NodeEnvironment`, config files, the managed server,
and graceful shutdown — and returns the refreshed context plus a runtime
handle:

```ts
import 'node:process';
import { runNodeApplication } from '@ndigo/platform-node';

const app = await runNodeApplication([AppConfiguration], { port: 3000 });
// app.context — the refreshed DI container (every bean stays reachable)
// app.server  — the started HTTPServer
// app.port    — the bound port
// app.close() — programmatic teardown
```

The preset composes, it does not replace:

- registers `NodeAutoConfiguration` plus your sources (`platform: false`
  leaves the platform out);
- builds the environment from `NodeEnvironment` (`process.env` arrives in
  the `systemEnvironment` source) and applies `profiles` / `properties`;
- loads `config/application*.json` through the platform reader by default
  (`configFiles: false` disables file loading; a
  `StandardConfigFileLoader` instance overrides it);
- runs `configureBuilder(builder)` before refresh — the seam for secrets,
  the remote config source, interception processors, and defaults;
- runs `beforeStart(context)` after refresh and before the socket binds —
  the seam for migrations and pre-listen wiring;
- starts the managed `HTTP_SERVER` and installs the `SIGINT`/`SIGTERM`
  teardown (`shutdown: false` opts out; `resources` adds teardown
  resources).

When you need to own the sequence, the manual path stays fully supported:

```ts
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@ndigo/platform-node';

const context = await new ApplicationBuilder([NodeAutoConfiguration, AppConfiguration]).run();
```

`ApplicationBuilder.run()`:

1. prepares a `StandardEnvironment` (Node apps can pass their own — see
   `NodeEnvironment`), applying any `@propertySource` / profiles,
2. registers each source conditionally (`@whenNode` gates platform
   configs),
3. `refresh()`es the context: entries are created, and the lifecycle
   processor initializes managed beans (see 5),
4. returns the ready `ApplicationContext`.

`NodeAutoConfiguration` provisions the server-side stack: the 6 argument
resolvers, the handler mapping, the dispatcher, the error-resolver chain
and the managed `httpServer` entry.

## 2. Configuration classes and entries

A `@configuration` class declares beans with `@entry` methods. Each entry
method is called eagerly during `register()` and its return value becomes a
named context value — the factory names it after the method.

```ts
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';

@configuration
export class AppConfiguration {
    @entry greetingController() {
        return new GreetingController();
    }
    @entry todoService() {
        return new TodoService();
    }
}
```

Beans that implement framework awareness contracts are injected automatically
when they are entries — e.g. `ApplicationContextAware` values receive the
context during registration (`ApplicationContextAwareProcessor`). Your own
entries typically don't need this; controllers are plain classes.

## 3. Controllers and mapping

Controllers are plain classes whose methods carry mapping decorators.
`@getMapping` / `@postMapping` (from `@ndigo/dispatcher`) describe path and
method; `@parameters` describes how method arguments are bound.

```ts
import '@tsmetadata/polyfill';
import { getMapping, postMapping, parameters, queryValue, bodyValue, pathValue } from '@ndigo/dispatcher';

@requestMapping('/api')
export class GreetingController {
    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    @postMapping('/echo')
    @parameters({ payload: bodyValue() })
    echo(payload: unknown) {
        return { echo: payload };
    }

    @getMapping('/greet/:name')
    @parameters({ name: pathValue('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }
}
```

Notes:

- Plain object returns are serialized as JSON — no view name is applied to
  non-`ModelAndView` returns.
- The handler mapping discovers controllers at refresh time and
  auto-initializes, so routes are live as soon as `run()` returns (no manual
  `init()` calls).

## 4. Request binding: extractors

`@parameters` maps argument names to _extractors_ — declarative sources for
the argument's value. The Node platform resolves them through
`AbstractPlatformArgumentResolver` subclasses.

| Extractor                   | Source                      | Whole-source                              |
| --------------------------- | --------------------------- | ----------------------------------------- |
| `queryValue(name)`          | query string (`route.data`) | `queryValue()`                            |
| `pathVariable(name)`        | path parameter              | —                                         |
| `matrixValue(name)`         | segment matrix params       | —                                         |
| `headerValue(name)`         | request header              | —                                         |
| `cookieValue(name)`         | cookie                      | —                                         |
| `requestSessionValue(name)` | server session bag          | —                                         |
| `bodyValue(name)`           | request body field          | `bodyValue()` binds the whole parsed body |
| `dataBinderValue('body')`   | whole body → DTO object     | binds flat fields into a nested object    |
| `requestPart(name)`         | multipart JSON/text part    | —                                         |

Omitting the name binds the entire source object (`queryValue()` =
whole query, `bodyValue()` = whole body — the `*Value(name)` whole-source
rule, AD-27 amendment). Whole-source **data
binding** (`dataBinderValue`) and multipart JSON parts (`requestPart`) are
covered in guide [06 — Argument Binding](06-argument-binding.md). Follow
guide [07 — Request Validation](07-request-validation.md) for coercion and
validation on top of extractors.

## 5. Managed beans and the server

Beans can participate in the context lifecycle by implementing
`SmartLifecycle` (from `@ndigo/factory`): on `refresh()` the lifecycle
processor starts beans that are `isAutoStartup`; on `close()` it stops them.
`HTTPServer` is such a bean — `NodeAutoConfiguration` provisions it as the
`httpServer` entry.

Because `refresh()` must never bind sockets, the server is
`isAutoStartup = false`: the app starts it explicitly and awaits readiness.
`runNodeApplication` (1) does this for you and returns the started server;
on the manual path:

```ts
const server = context.getValue<HTTPServer>('httpServer');
await server.start(); // bound + listening
gracefulShutdown(context, { resources: [server] });
```

`gracefulShutdown` wires `SIGINT`/`SIGTERM` to a teardown that closes the
`resources` (the server) in order, then `context.close()`, then exits `0`. A
second signal, a throwing close, or a teardown past `timeoutMs` (default 10s)
force-exits non-zero. Programmatic `context.close()` also stops the server via
the lifecycle processor.

## 6. The error contract (RFC 9457)

Every 4xx/5xx response is an `application/problem+json` document:

```json
{
    "type": "urn:ndigo:not-found",
    "title": "Not Found",
    "status": 404,
    "instance": "/nope"
}
```

The framework maps errors deterministically:

| Condition                                                | Status                          |
| -------------------------------------------------------- | ------------------------------- |
| Malformed URL / body, missing or unconvertible parameter | 400                             |
| Missing/invalid credentials (handler or guard)           | 401 + `WWW-Authenticate`        |
| Insufficient role                                        | 403                             |
| No route / no view                                       | 404                             |
| Path exists, method not allowed                          | 405 + `Allow`                   |
| Zod validation failure                                   | 422 + `errors[]` (see guide 07) |
| Anything unhandled                                       | 500 (internals never leaked)    |

Handlers can return a `ResponseEntity<ProblemDetails>` for full control, or
rely on the default chain. The `urn:ndigo:*` problem-type scheme is a
placeholder — replace with real HTTPS URIs before first public release.

## 6b. WebSockets (`@socketMapping`)

Real-time endpoints are declared with `@socketMapping` and handled as
**async-iterable producer-consumers** — `for await` inbound messages, `yield`
outbound (mirroring the SSE view style):

```ts
import { socketMapping, type SocketSession } from '@ndigo/dispatcher';

@requestMapping('/chat')
class ChatController {
    @socketMapping('/room')
    async *room(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'chat', data: { text: String(message) } };
        }
    }
}
```

- The adapter performs the RFC 6455 handshake (via `ws`) only when the
  request carries `Connection: Upgrade` + `Upgrade: websocket`; a plain HTTP
  request to a socket path is `404`.
- `SocketSession` (`@ndigo/dispatcher`) is transport-neutral: `messages`
  (async iterable), `send`, `close(code, reason)`, `closed`, `isClosed`.
- Params/interceptors run on the upgrade request like a normal request, so
  auth denial rejects the upgrade with `401`/`403`.

**Mapping conditions apply to sockets too.** The same `queryParams` /
`matrixParams` conditions that gate HTTP mappings gate WebSocket upgrades —
the upgrade request's query string is parsed into the route, so e.g.
`@socketMapping({ value: '/room', queryParams: 'token=abc' })` only upgrades
when the URL query matches (`ws://host/room?token=abc`), and a handler can
read the upgrade sources with the standard vocabulary:

```ts
@socketMapping({ value: '/room', queryParams: 'token=abc', private: false })
@parameters({ token: queryValue('token'), via: headerValue('x-via') })
async *room(session: SocketSession) {
    const token = String(session.params['token']);  // bound from ?token=
    const via = String(session.params['via']);      // bound from the x-via header
    // session.query / session.headers / session.cookies also exposed directly
}
```

`@parameters` on a socket method binds its extractors against the **upgrade
request sources** (query, path, header, cookie) into `session.params`
(validated + coerced, Zod included). A missing required parameter closes the
socket with `1008` before the handler runs.

## 6c. Parameter source compatibility (the `@parameters` matrix)

`@parameters` is **mapping-agnostic**: the same decorator + `*Value`
extractors work across `@routeMapping`, `@requestMapping`, and
`@socketMapping`. Each mapping kind exposes different sources, and using a
binder without a source for its mapping is a configuration error — the
framework throws at registration:

| Mapping kind                  | Available `*Value` sources                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `@routeMapping` (method-less) | any source (transport-agnostic: query, path, matrix, header, cookie, request-session, attribute, body, history-state, storage, `data-*`) |
| `@requestMapping` / verbs     | query, path, matrix, header, cookie, request-session, attribute, body, `data-body`, `data-cookie`, `request-part`, multipart-file        |
| `@socketMapping`              | query, path, header, cookie (no body; no browser state)                                                                                  |

So `bodyValue` on a socket mapping is rejected (no body on an upgrade), as is
`historyStateValue`/`sessionStorageValue`/`localStorageValue` on a verbed HTTP
mapping (browser-only sources) — the error says which sources the mapping
kind allows. Method-less `@routeMapping` accepts anything because it may
dispatch on either platform.

## 7. Putting it together

`apps/02-ndigo-hello-node/src/index.ts` is the minimal complete app — the
snippet below is that file:

```ts
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { NodeAutoConfiguration, HTTP_SERVER, gracefulShutdown } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { HelloConfiguration } from './hello-configuration';

// The managed server reads `process.env.PORT` (defaulting to 3000) when no
// explicit port is passed — without this seeding line it would bind 3000 while
// the log lines claim the app default.
process.env['PORT'] ??= '3010';
const PORT = Number(getEnv('PORT', '3010'));
const logger = getLogger('ndigo-hello-node');

async function main() {
    const context = await new ApplicationBuilder([NodeAutoConfiguration, HelloConfiguration]).run();
    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });
    logger.info(`listening on http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
```

Run it with `pnpm --filter @ndigo/hello-node start` (or
`pnpm --filter @ndigo/hello-node exec tsx src/index.ts`) and set `PORT` to
override the default. Logging comes from the dependency-light `@ndigo/log`
leaf; `@ndigo/telemetry` re-exports the same surface when an app already
depends on it (AD-67).

## 8. Deployment topology — TLS and HTTP/2–3 at the edge

The framework's origin listener serves **HTTP/1.1 over plain TCP** and does
not terminate TLS in-process (see [AD-80](../decisions/2026-10-09_AD80_HTTP23_EDGE_TERMINATION.md)).
The supported production topology is:

```text
browser/client ──(TLS, HTTP/2, HTTP/3)──► edge proxy/LB/CDN ──(HTTP/1.1)──► origin
```

The edge terminates TLS, HTTP/2 and HTTP/3 — that is where the
user-visible benefits (multiplexing, HPACK, 0-RTT) are realized. The
origin hop is keep-alive HTTP/1.1, which is by design: Node has no HTTP/3
listener, and WebSockets cannot ride h2 (neither `ws` nor browsers
implement RFC 8441).

- **Bind the origin to the loopback or a private interface.** The default
  bind is `127.0.0.1`; only the edge may reach the origin. Exposing the
  plaintext listener publicly is a misconfiguration.
- **Preserve client identity with the trusted-proxy allowlist.**
  Configure `trustedProxies` (or `NDIGO_TRUSTED_PROXIES`) with the edge's
  addresses (AD-37). Without it every request looks like the proxy's IP —
  rate limiting, audit logs and `remoteAddress` are wrong; with a wrongly
  widened allowlist, spoofed `X-Forwarded-For` headers are trusted. Empty
  = trust nobody, which is the safe default.
- **WebSockets and STOMP:** the proxy must pass `Upgrade`/`Connection`
  headers through. nginx, Caddy and HAProxy do by default; an h2-only edge
  configuration that refuses h1.1 fallback breaks socket upgrades —
  keep the origin's h1.1 path reachable. Browser pages never notice the
  origin hop: they speak h2 to the edge either way.
- **SSE and long-lived streams:** configure the proxy's idle timeout above
  your event cadence (or disable it for the stream paths) so the connection
  is not dropped mid-stream.

### Optional: native TLS + HTTP/2 at the origin

Pass TLS material (`tls` on `HTTPServerOptions`/adapter options, or the
`NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` env pair with optional `NDIGO_TLS_CA`) and
the origin listener switches to `http2.createSecureServer` in
`allowHTTP1` mode — ALPN negotiates **h2** with an **HTTP/1.1 fallback**
on the same port (AD-81):

```ts
new HTTPServer(null, { tls: { key: '/etc/tls/key.pem', cert: '/etc/tls/cert.pem' } });
```

- PEM entries are inline-or-path: a value whose first non-whitespace
  characters are `-----BEGIN` is certificate content; anything else is a
  file path read at bind time. The env pair is all-or-nothing — one key
  without the other throws at construction rather than silently serving
  plaintext; blank env values (`NDIGO_TLS_KEY=`) count as unset. The env
  configures the **default adapter only** — an app that passes a custom
  adapter owns its own TLS story.
- **Certificate files are read once at bind time** — rotating a key or
  certificate requires a restart (same lifecycle as the process).
- **Mutual TLS is opt-in** — `clientAuth: 'request'` asks for a client
  certificate but admits anonymous clients; `clientAuth: 'require'`
  rejects connections without a certificate that verifies against `ca`
  (or Node's baseline trust store when `ca` is absent — which typically
  rejects every presented certificate). `ca` alone never requests a
  client certificate.
- **Bound the h2 stream count for production** — `maxConcurrentStreams`
  caps concurrent HTTP/2 streams per connection (the SETTINGS value).
  Node's default is unbounded, so a single client could open any number
  of concurrent requests; 128 (the nginx default) is a sane ceiling.
- `minVersion` (`'TLSv1.2'` default / `'TLSv1.3'`) and `ciphers`
  (OpenSSL list) tune the cipher policy; keep `minVersion: 'TLSv1.3'` for
  strict deployments.
- **WebSockets keep riding the h1.1 fallback** — neither `ws` nor browsers
  implement RFC 8441, so socket/STOMP endpoints cannot upgrade over h2;
  keep the h1.1 ALPN path reachable.
- **HTTP/3 still terminates at the edge** (Node has no QUIC listener);
  the default topology above remains the supported production shape.
- Options that are h1.1-only (`keepAliveTimeout`, `maxRequestsPerSocket`)
  are no-ops on the secure flavor; request/header timeouts are honored on
  both.

## See also

- [Guide 07 — Request Validation](07-request-validation.md): coercion,
  `validatedBody`, and entity-derived schemas.
- [Guide 10 — Static Files](10-static-files.md): serving a directory over
  HTTP — ETag/Range, precompressed variants, SPA fallback (the reference demo
  is `apps/05-ndigo-api`'s `/static/`).
- Package READMEs: `@ndigo/platform-node`, `@ndigo/dispatcher`, `@ndigo/boot`,
  `@ndigo/orm` for the full symbol surface.
- Decision records: [Zod validation](../decisions/2026-09-05_AD07_ZOD_VALIDATION.md),
  [RFC 9457 problem+json error model](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md).
