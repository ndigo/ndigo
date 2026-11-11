# Guide 01 — Building a Node API

This guide walks through the primary Ndigo server-side workflow end-to-end:
DI-scaffolded bootstrap, dependency configuration, controllers, request
binding, validation, the error contract, and graceful shutdown.

The finished shape of every pattern here lives in `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)` — use it as
the canonical reference. Concepts link to the relevant decision record where the rationale
is worth reading.

**Audience:** Node application developers · **Prerequisites:** Workspace bootstrapped (`pnpm install`) and the Node platform packages built (`pnpm --filter @ndigo/platform-node build:lib`) · **Reference app:** `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)` (minimal companion: `[apps/02-ndigo-hello-node](https://github.com/ndigo/ndigo/tree/main/apps/02-ndigo-hello-node)`)

## What you'll learn

- Bootstrap with `runNodeApplication` and control the manual `ApplicationBuilder` path.
- Bind configuration classes and register `@entry` beans.
- Map controllers and bind request arguments across every source.
- Return the RFC 9457 error contract and shut the server down cleanly.

## 1. Bootstrap: `runNodeApplication`

An application is assembled around a DI container. The Node preset
(`@ndigo/platform-node`, ) wires the standard assembly — platform
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

`ApplicationBuilder.run`:

1. prepares a `StandardEnvironment` (Node apps can pass their own — see
 `NodeEnvironment`), applying any `@propertySource` / profiles,
2. registers each source conditionally (`@whenNode` gates platform
 configs),
3. `refresh`es the context: entries are created, and the lifecycle
 processor initializes managed beans (see 5),
4. returns the ready `ApplicationContext`.

`NodeAutoConfiguration` provisions the server-side stack: the 6 argument
resolvers, the handler mapping, the dispatcher, the error-resolver chain
and the managed `httpServer` entry.

## 2. Configuration classes and entries

A `@configuration` class declares beans with `@entry` methods. Each entry
method is called eagerly during `register` and its return value becomes a
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
method; `@parameters` describes how method arguments are bound. The full
routing surface — patterns, conditions, precedence, partitions — is
[guide 05](05-routing-and-route-conditions.md).

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
 auto-initializes, so routes are live as soon as `run` returns (no manual
 `init` calls).

## 4. Request binding: extractors

`@parameters` maps argument names to _extractors_ — declarative sources for
the argument's value. The Node platform resolves them through
`AbstractPlatformArgumentResolver` subclasses.

| Extractor | Source | Whole-source |
| --------------------------- | --------------------------- | ----------------------------------------- |
| `queryValue(name)` | query string (`route.data`) | `queryValue` |
| `pathVariable(name)` | path parameter | — |
| `matrixValue(name)` | segment matrix params | — |
| `headerValue(name)` | request header | — |
| `cookieValue(name)` | cookie | — |
| `requestSessionValue(name)` | server session bag | — |
| `bodyValue(name)` | request body field | `bodyValue` binds the whole parsed body |
| `dataBinderValue('body')` | whole body → DTO object | binds flat fields into a nested object |
| `requestPart(name)` | multipart JSON/text part | — |

Omitting the name binds the entire source object (`queryValue` =
whole query, `bodyValue` = whole body — the `*Value(name)` whole-source
rule, amendment). Whole-source **data
binding** (`dataBinderValue`) and multipart JSON parts (`requestPart`) are
covered in guide [06 — Argument Binding](06-argument-binding.md). Follow
guide [07 — Request Validation](07-request-validation.md) for coercion and
validation on top of extractors.

## 5. Managed beans and the server

Beans can participate in the context lifecycle by implementing
`SmartLifecycle` (from `@ndigo/factory`): on `refresh` the lifecycle
processor starts beans that are `isAutoStartup`; on `close` it stops them.
`HTTPServer` is such a bean — `NodeAutoConfiguration` provisions it as the
`httpServer` entry.

Because `refresh` must never bind sockets, the server is
`isAutoStartup = false`: the app starts it explicitly and awaits readiness.
`runNodeApplication` (1) does this for you and returns the started server;
on the manual path:

```ts
const server = context.getValue<HTTPServer>('httpServer');
await server.start(); // bound + listening
gracefulShutdown(context, { resources: [server] });
```

`gracefulShutdown` wires `SIGINT`/`SIGTERM` to a teardown that closes the
`resources` (the server) in order, then `context.close`, then exits `0`. A
second signal, a throwing close, or a teardown past `timeoutMs` (default 10s)
force-exits non-zero. Programmatic `context.close` also stops the server via
the lifecycle processor.

## 6. The error contract (RFC 9457)

The extension surface — `@errorMapping`, custom resolvers, and the error
lineage — is [guide 08](08-errors-and-problem-details.md). This section shows
the shape every handler can rely on.

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

| Condition | Status |
| -------------------------------------------------------- | ------------------------------- |
| Malformed URL / body, missing or unconvertible parameter | 400 |
| Missing/invalid credentials (handler or guard) | 401 + `WWW-Authenticate` |
| Insufficient role | 403 |
| No route / no view | 404 |
| Path exists, method not allowed | 405 + `Allow` |
| Zod validation failure | 422 + `errors[]` (see [guide 07](07-request-validation.md)) |
| Anything unhandled | 500 (internals never leaked) |

Handlers can return a `ResponseEntity<ProblemDetails>` for full control, or
rely on the default chain. The `urn:ndigo:*` problem-type scheme is a
placeholder — replace with real HTTPS URIs before first public release.

## 6b. WebSockets

Real-time endpoints use `@socketMapping` and async-iterable producer-consumers.
The session registry, rooms, heartbeat, client, STOMP, and cross-node fan-out
are [guide 15](15-websockets.md) and [guide 42](42-stomp.md). A minimal handler:

```ts
import { requestMapping, socketMapping, type SocketSession } from '@ndigo/dispatcher';

@requestMapping('/chat')
class ChatController {
    @socketMapping('/room')
    async *room(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'chat', data: String(message) };
        }
    }
}
```

## 6c. Parameter source compatibility (the `@parameters` matrix)

`@parameters` is **mapping-agnostic**: the same decorator + `*Value`
extractors work across `@routeMapping`, `@requestMapping`, and
`@socketMapping`. Each mapping kind exposes different sources, and using a
binder without a source for its mapping is a configuration error — the
framework throws at registration:

| Mapping kind | Available `*Value` sources |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `@routeMapping` (method-less) | any source (transport-agnostic: query, path, matrix, header, cookie, request-session, attribute, body, history-state, storage, `data-*`) |
| `@requestMapping` / verbs | query, path, matrix, header, cookie, request-session, attribute, body, `data-body`, `data-cookie`, `request-part`, multipart-file |
| `@socketMapping` | query, path, header, cookie (no body; no browser state) |

So `bodyValue` on a socket mapping is rejected (no body on an upgrade), as is
`historyStateValue`/`sessionStorageValue`/`localStorageValue` on a verbed HTTP
mapping (browser-only sources) — the error says which sources the mapping
kind allows. Method-less `@routeMapping` accepts anything because it may
dispatch on either platform.

## 7. Putting it together

`[apps/02-ndigo-hello-node](https://github.com/ndigo/ndigo/tree/main/apps/02-ndigo-hello-node)/src/index.ts` is the minimal complete app — the
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
depends on it .

## 8. Deployment topology

The production checklist — TLS/HTTP2–3 at the edge or `NDIGO_TLS_KEY`/`CERT`,
trusted proxies, health probes, graceful shutdown, clustering, and static
caching — is [guide 38](38-deployment-and-production-readiness.md). Keep the
local dev server plaintext; terminate TLS at the edge unless you are running
the Node listener as the public origin.

## See also

- [Guide 07 — Request Validation](07-request-validation.md): coercion,
 `validatedBody`, and entity-derived schemas.
- [Guide 10 — Static Files](10-static-files.md): serving a directory over
 HTTP — ETag/Range, precompressed variants, SPA fallback (the reference demo
 is `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`'s `/static/`).
- Package READMEs: `@ndigo/platform-node`, `@ndigo/dispatcher`, `@ndigo/boot`,
 `@ndigo/orm` for the full symbol surface.
- Decision records: [Zod validation](../decisions/2026-09-05_AD07_ZOD_VALIDATION.md),
 [RFC 9457 problem+json error model](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md).
