# Blue Platform Node

Blue Platform Node provides Node.js HTTP argument resolvers and environment integration for @blue/dispatcher.

## Installation

```bash
pnpm add @blue/platform-node
```

## Features

### Argument Resolvers

The package provides 6 argument resolvers for binding request data to controller method parameters:

- `NodeQueryValueMethodArgumentResolver`: Binds query parameters from the URL
- `NodePathValueMethodArgumentResolver`: Binds path parameters from the route
- `NodeHeaderValueMethodArgumentResolver`: Binds HTTP headers
- `NodeBodyValueMethodArgumentResolver`: Binds request body data
- `NodeCookieValueMethodArgumentResolver`: Binds cookies from the request
- `NodeSessionValueMethodArgumentResolver`: Binds session data

### NodeEnvironment

A Node.js environment implementation that includes `process.env` as the first property source, extending `StandardEnvironment`.

### NodeAutoConfiguration

Auto-configuration for Node.js-based applications that provisions:

- Argument-value converter registry
- All 6 argument resolvers
- Default handler mapping for metadata-driven dispatch
- The error-resolver chain (400 binding, 401/403 denials, 422 validation,
  500 last-resort — AD-10)
- An `Accept-Language` language resolver (`AcceptHeaderLanguageResolver`,
  default `en-US`) — the negotiated language reaches views, templates,
  and islands via the route's `language` attribute (AD-19)
- A `taskScheduler` + `scheduleRegistry` pair: `@scheduled` methods on
  registered beans are auto-discovered and auto-started with zero wiring
  (AD-20)
- A managed `httpServer` entry (`HTTPServer`, a `SmartLifecycle` bean)

Applications that previously relied on no language negotiation now render
with the header-negotiated locale (`en-US` default) — see
[the i18n guide](../../docs/guides/04-i18n-and-content.md) to override the
resolver bean.

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

Every 4xx/5xx response is `application/problem+json` (AD-10): `type`
(`urn:blue:*` placeholder), `title`, `status`, `detail`, `instance`, and an
`errors` extension for validation issues. `ProblemDetails`, `ProblemTypes`,
and `writeProblem` are exported for custom errors.

## Guides

- [Building a Node API](../../docs/guides/01-building-a-node-api.md)
- [Request Validation](../../docs/guides/02-request-validation.md)

## Usage

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
import { controller, get, post, query, path, header, body, cookie, session } from '@blue/dispatcher';

@controller('/users')
class UserController {
    @get('/:id')
    getUser(@path('id') id: string, @query('include') include: string, @header('authorization') authHeader: string) {
        return { id, include, authHeader };
    }

    @post('/')
    createUser(@body('name') name: string, @cookie('sessionId') sessionId: string, @session('userId') userId: string) {
        return { name, sessionId, userId };
    }
}
```

### Custom Configuration

Use `configureNodeArgumentResolvers()` to register resolvers with custom options:

```typescript
import { configureNodeArgumentResolvers } from '@blue/platform-node';

configureNodeArgumentResolvers(context, {
    query: 'string',
    body: 'json',
    converterRegistry: myCustomConverterRegistry,
    strictNamedConverterLookup: true,
});
```
