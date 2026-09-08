# Guide 01 — Building a Node API

This guide walks through the primary BlueJS server-side workflow end-to-end:
DI-scaffolded bootstrap, dependency configuration, controllers, request
binding, validation, the error contract, and graceful shutdown.

The finished shape of every pattern here lives in `apps/blue-api` — use it as
the canonical reference. Concepts link to the relevant AD where the rationale
is worth reading.

## Prerequisites

- The BlueJS monorepo bootstrapped (`pnpm install`).
- Node platform packages built: `pnpm --filter @blue/platform-node build:lib`
  (workspace packages resolve to their `lib/` outputs).

## 1. Bootstrap: `ApplicationBuilder`

An application is assembled around a DI container: register platform auto-configuration
plus your own `@configuration` classes, then `run()`.

```ts
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';

const context = new ApplicationBuilder([NodeAutoConfiguration, AppConfiguration]).run();
```

`ApplicationBuilder.run()`:

1. prepares a `StandardEnvironment` (Node apps can pass their own — see
   `NodeEnvironment`), applying any `@propertySource` / profiles,
2. registers each source conditionally (`@conditionalOnNode` gates platform
   configs),
3. `refresh()`es the context: entries are created, and the lifecycle
   processor initializes managed beans (see 5),
4. returns the ready `ApplicationContext`.

`NodeAutoConfiguration` provisions the server-side stack: the 6 argument
resolvers, the handler mapping, the dispatcher, the error-resolver chain
(AD-10), and the managed `httpServer` entry.

## 2. Configuration classes and entries

A `@configuration` class declares beans with `@entry` methods. Each entry
method is called eagerly during `register()` and its return value becomes a
named context value — the factory names it after the method.

```ts
import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';

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
`@getMapping` / `@postMapping` (from `@blue/dispatcher`) describe path and
method; `@routeParams` describes how method arguments are bound.

```ts
import '@tsmetadata/polyfill';
import { getMapping, postMapping, routeParams, queryValue, bodyValue, pathValue } from '@blue/dispatcher';

@requestMapping('/api')
export class GreetingController {
    @getMapping('/hello')
    @routeParams({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    @postMapping('/echo')
    @routeParams({ payload: bodyValue('*') })
    echo(payload: unknown) {
        return { echo: payload };
    }

    @getMapping('/greet/:name')
    @routeParams({ name: pathValue('name') })
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

`@routeParams` maps argument names to *extractors* — declarative sources for
the argument's value. The Node platform resolves them through
`AbstractPlatformArgumentResolver` subclasses.

| Extractor | Source | Whole-source |
| --- | --- | --- |
| `queryValue(name)` | query string (`route.data`) | `queryValue('*')` |
| `pathValue(name)` | path parameter | — |
| `headerValue(name)` | request header | — |
| `cookieValue(name)` | cookie | — |
| `sessionValue(name)` | session | — |
| `bodyValue(name)` | request body field | `bodyValue('*')` binds the whole parsed body |

The `'*'` convention binds the entire source object. Follow guide
[02 — Request Validation](02-request-validation.md) for coercion and
validation on top of extractors.

## 5. Managed beans and the server

Beans can participate in the context lifecycle by implementing
`SmartLifecycle` (from `@blue/factory`): on `refresh()` the lifecycle
processor starts beans that are `isAutoStartup`; on `close()` it stops them.
`HTTPServer` is such a bean — `NodeAutoConfiguration` provisions it as the
`httpServer` entry.

Because `refresh()` must never bind sockets, the server is
`isAutoStartup = false`: the app starts it explicitly and awaits readiness.

```ts
const server = context.getValue<HTTPServer>('httpServer');
await server.start();                       // bound + listening
gracefulShutdown(context, { resources: [server] });
```

`gracefulShutdown` wires `SIGINT`/`SIGTERM` to a teardown that closes the
`resources` (the server) in order, then `context.close()`, then exits `0`. A
second signal, a throwing close, or a teardown past `timeoutMs` (default 10s)
force-exits non-zero. Programmatic `context.close()` also stops the server via
the lifecycle processor.

## 6. The error contract (RFC 9457)

Every 4xx/5xx response is an `application/problem+json` document (AD-10):

```json
{
  "type": "urn:blue:not-found",
  "title": "Not Found",
  "status": 404,
  "instance": "/nope"
}
```

The framework maps errors deterministically:

| Condition | Status |
| --- | --- |
| Malformed URL / body, missing or unconvertible parameter | 400 |
| Missing/invalid credentials (handler or guard) | 401 + `WWW-Authenticate` |
| Insufficient role | 403 |
| No route / no view | 404 |
| Path exists, method not allowed | 405 + `Allow` |
| Zod validation failure | 422 + `errors[]` (see guide 02) |
| Anything unhandled | 500 (internals never leaked) |

Handlers can return a `ResponseEntity<ProblemDetails>` for full control, or
rely on the default chain. The `urn:blue:*` problem-type scheme is a
placeholder — replace with real HTTPS URIs before first public release
(tracked in AD-10).

## 6b. WebSockets (`@socketMapping`)

Real-time endpoints are declared with `@socketMapping` and handled as
**async-iterable producer-consumers** — `for await` inbound messages, `yield`
outbound (mirroring the SSE view style):

```ts
import { socketMapping, type SocketSession } from '@blue/dispatcher';

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
- `SocketSession` (`@blue/dispatcher`) is transport-neutral: `messages`
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
async *room(session: SocketSession) {
    const token = String(session.query['token']);       // from the WS URL query
    const auth = String(session.headers['x-auth']);     // from the upgrade headers
    // session.cookies[...] — from the upgrade Cookie header
}
```

`session.query` / `session.headers` / `session.cookies` mirror the HTTP
argument sources, so the original query/matrix/header APIs are reused for
every transport.

## 7. Putting it together

`apps/blue-hello-node/src/index.ts` is the minimal complete app (~30 lines):

```ts
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/telemetry';
import { HelloConfiguration } from './hello-configuration';

const PORT = Number(process.env['PORT'] ?? '3000');
const logger = getLogger('my-app');

async function main() {
    const context = new ApplicationBuilder([NodeAutoConfiguration, HelloConfiguration]).run();
    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });
    logger.info(`listening on http://localhost:${PORT}`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});
```

Run it with `pnpm --filter @blue/hello-node exec tsx src/index.ts` and set
`PORT` to override the default.

## Next steps

- [Guide 02 — Request Validation](02-request-validation.md): coercion,
  `validatedBody`, and entity-derived schemas.
- Package READMEs: `@blue/platform-node`, `@blue/dispatcher`, `@blue/boot`,
  `@blue/orm` for the full symbol surface.
- ADs: [AD-7](../decisions/2026-09-05_AD7_ZOD_VALIDATION.md) (Zod),
  [AD-10](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md) (error model).