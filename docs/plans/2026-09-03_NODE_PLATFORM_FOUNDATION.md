# Node Platform Foundation — HTTP Server, Dispatcher, and Request Pipeline

**Date:** 2026-09-03
**Packages:** `@ndigo/platform-node` (core), `@ndigo/dispatcher` (method decorators, `Route.method`), `@ndigo/view` (server view targets), `@ndigo/telemetry` (new instrumentations)
**Status:** Spec
**Depends on:** Existing `@ndigo/platform-node` argument resolvers, `@ndigo/dispatcher` `BrowserDispatcher`, `@ndigo/boot` `ApplicationBuilder`

---

## 1. Motivation

`@ndigo/platform-node` has argument resolvers, a `NodeRequest` model, a `NodeEnvironment`, and a `FileSystemRouter` stub. But there is no HTTP server, no dispatcher, and no view rendering for the server. Every Node app — including the demo — writes 50+ lines of raw `node:http` boilerplate, manually constructs route objects, and bypasses the entire interceptor/error/view pipeline.

The goal is a Spring Boot–like experience: register a `@configuration` class, call `ApplicationBuilder.run()`, and have a running HTTP server with full dispatch, interception, error handling, and view rendering.

---

## 2. Dispatcher

### 2.1 Decision: reuse `BrowserDispatcher`

`BrowserDispatcher`'s `render()` is **DOM-free** — it resolves the view, pulls the `ViewTarget` entry from the application context, and calls `view.render(model, route, viewTarget)`. The browser-ness lives entirely in `@ndigo/platform-web`'s `DOMElementViewTarget` entry, not in the dispatcher.

So `BrowserDispatcher` **stays in `@ndigo/dispatcher`** for this work. `NodeDispatcher` extends it in `@ndigo/platform-node`, inheriting the full dispatch/interceptor/error pipeline and overriding only `render()` for server semantics.

> **TODO (future):** move `BrowserDispatcher` to `@ndigo/platform-web` (its true home — the class is a browser-platform concern). That move requires either extracting the shared dispatch logic into an `AbstractDispatcher` base class or re-exporting, plus re-arranging `@ndigo/platform-node` and `@ndigo/telemetry` package dependencies. Deferred to keep this change set small and avoid a dispatcher ↔ platform-web dependency cycle; tracked as follow-up.

### 2.2 Design

```ts
// @ndigo/dispatcher — unchanged
export class BrowserDispatcher extends AsViewResolverStrategy(/* … mixins … */)
    implements RouteDispatcher, RouteRenderer {
    async dispatch(route: Route): Promise<void> { /* handler mapping, interceptors, error handling */ }
    async render(mv: ModelAndView, route: Route): Promise<void> { /* resolves view, uses ViewTarget entry */ }
}

// @ndigo/platform-node — new
export class NodeDispatcher extends BrowserDispatcher {
    /** Server render: Accept-header negotiation, ResponseEntity status/headers, HTTPResponseViewTarget. */
    override async render(mv: ModelAndView, route: Route): Promise<void> { … }
}
```

**Inherited unchanged:** `dispatch()`, `_processDispatchResult()`, `_processHandlerError()`, `_resolveViewName()`, `_applyDefaultViewName()`, plus all mixin-provided methods. No base-class extraction, no re-export shim, no dispatcher ↔ platform-web dependency cycle.

**Backward compatibility:** zero — `BrowserDispatcher` and all existing imports are untouched.

---

## 3. HTTP Server

### 3.1 Design

A managed HTTP server that integrates with the `ApplicationContext` lifecycle. It accepts an adapter abstraction so the same API works with `node:http`, Hono, or Express.

```ts
interface HTTPServerAdapter {
    /** Start listening. */
    listen(port: number, host?: string): Promise<void>;
    /** Stop the server. */
    close(): Promise<void>;
    /** The underlying server (for integration tests, etc.). */
    readonly server: unknown;
}

interface HTTPServerOptions {
    port: number;
    host?: string;
    adapter?: HTTPServerAdapter; // defaults to NodeHTTPServerAdapter
}
```

### 3.2 Default Adapter: `NodeHTTPServerAdapter`

Wraps `node:http.createServer()`. The request handler:

1. Parse `IncomingMessage` into a `NodeRequest` (headers, body, cookies, URL)
2. Create a `Route` from the URL path
3. Store `NodeRequest` in `route.attributes[NODE_REQUEST_ATTRIBUTE]`
4. Call `dispatcher.dispatch(route)`
5. Write the rendered output to the `ServerResponse`

This eliminates the 50+ lines of boilerplate in `ndigo-demo-node/src/index.ts`.

```ts
@configuration
class NodeServerConfiguration {
    @entry
    httpServer(context: ApplicationContext, dispatcher: NodeDispatcher): HTTPServer {
        const server = new HTTPServer(dispatcher, { port: 3000 });
        return server;
    }
}
```

### 3.3 Lifecycle

| Event                       | Action                                        |
| --------------------------- | --------------------------------------------- |
| `context.refresh()`         | `HTTPServer` entry created, not yet listening |
| `context started` event     | `server.listen()` — auto-starts               |
| `context close` / `destroy` | `server.close()` — graceful shutdown          |

---

## 4. Server View Targets

### 4.1 `HTTPResponseViewTarget`

Writes rendered view output to the HTTP response. Supports content negotiation:

```ts
class HTTPResponseViewTarget implements ViewTarget {
    constructor(private response: ServerResponse) {}

    async prepare(route: Route): Promise<void> {
        // Set default content type, headers
    }

    async commit(output: unknown, model: any, route: Route): Promise<void> {
        if (typeof output === 'string') {
            this.response.end(output);
        } else {
            this.response.end(JSON.stringify(output));
        }
    }
}
```

### 4.2 Content Negotiation in Node

The existing `ContentNegotiationViewResolver` resolves views by media type. When a Node request comes in with `Accept: text/html`, the resolver returns a `StringTemplateView`. When `Accept: application/json`, it returns a JSON-serializing view.

The `NodeDispatcher.render()` delegates to `ContentNegotiationViewResolver` which already exists in `@ndigo/view`. The gap is wiring the `Accept` header from the `NodeRequest` into the resolver.

### 4.3 `StaticFileView`

Serves static files from the filesystem:

```ts
class StaticFileView implements View {
    constructor(private basePath: string) {}

    async render(model: any, route: Route, target: ViewTarget): Promise<void> {
        const filePath = path.join(this.basePath, route.path);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        await target.commit(content, model, route);
    }
}
```

This is the Node equivalent of Spring's `ResourceHttpRequestHandler`.

---

## 5. HTTP Method Decorators

### 5.1 Motivation

Every route handler currently needs a `@routeMapping` decorator with an explicit path string. On the server, handlers also need to specify which HTTP method they handle (GET, POST, PUT, DELETE). Currently there's no way to express this — a handler matches any method.

### 5.2 Design — Three tiers

The decorators form an inheritance ladder, each tier adding HTTP request semantics on top of the shared mapping metadata:

```
@routeMapping                    base — path + conditions. Method-agnostic (client + server)
@requestMapping                 extends — adds method?: HTTPMethod (server-facing)
@getMapping / @postMapping / @queryMapping / …  wraps @requestMapping — method fixed
```

```ts
@requestMapping({ value: '/users', method: HTTPMethod.GET })
handleUsers(route: Route) { … }

@postMapping('/users')
createUser(route: Route) { … }

@requestMapping({ value: '/users/{id}', method: HTTPMethod.DELETE })
deleteUser(route: Route) { … }
```

**`@requestMapping` is its own decorator, not an alias of `@routeMapping`.** It is the server-side entry point carrying HTTP request semantics (`method` now; `headers`, `consumes`, `produces` later — fields that have no meaning on a client navigation route). It writes the **same** `Symbol.metadata` record as `@routeMapping` with a superset config, so:

- One shared mapping stack (`RadixMetadataHandlerMapping`, `RouteMappingInfo`, `AbstractHandlerMethodMapping`) consumes both — no fork.
- Hybrid controllers work: a single controller serves client routes and server HTTP. Client routing ignores `method`; server dispatch filters on it.
- `@requestMapping('/users')` without `method` behaves exactly like `@routeMapping` today. Existing code compiles.

**Backward compatibility:** `@routeMapping` without `method` matches **any** HTTP method (current behavior). `@getMapping`/`@postMapping`/etc. are restrictive. Matches Spring's `@RequestMapping` (any method) vs `@GetMapping` (GET only).

### 5.3 Implementation

```ts
// request-mapping.ts
// HTTPMethod is a type-only import from @ndigo/http — erased at emit, no runtime DOM coupling.
import type { HTTPMethod } from '@ndigo/http';

export interface RequestMappingConfiguration extends RouteMappingConfiguration {
    method?: HTTPMethod; // undefined = any method
}

export function requestMapping(route: string | RequestMappingConfiguration) {
    // writes the same metadata key as routeMapping, with the superset config
}

// http-method-mapping.ts
export function getMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(isString(route) ? { value: route, method: 'GET' } : { ...route, method: 'GET' });
}
// postMapping, putMapping, deleteMapping, patchMapping, queryMapping identical
```

The handler mappings (`LinearMetadataHandlerMapping` / `RadixMetadataHandlerMapping`) gain an `HTTPMethodCondition` following the existing `queryParams` / `matrixParams` condition pattern. The condition passes when either `route.method` or the mapping's `method` is absent; otherwise it requires equality. `Route.method?: HTTPMethod` is set by the HTTP server adapter.

### 5.4 Naming

All decorators are camelCase to match JS/TS conventions:

| Decorator         | Convention    | Role                                          |
| ----------------- | ------------- | --------------------------------------------- |
| `@routeMapping`   | Stays         | Base — path + conditions, method-agnostic     |
| `@requestMapping` | Own decorator | Extends base with HTTP method semantics       |
| `@getMapping`     | camelCase     | Wrap `@requestMapping`, method fixed          |
| `@postMapping`    | camelCase     | Same                                          |
| `@putMapping`     | camelCase     | Same                                          |
| `@deleteMapping`  | camelCase     | Same                                          |
| `@patchMapping`   | camelCase     | Same                                          |
| `@queryMapping`   | camelCase     | Same — RFC 9889 QUERY (safe method with body) |

---

## 6. `@ndigo/boot` Node Integration

### 6.1 Current State

`Application._prepareContext()` checks only `WebAutoConfiguration`:

```ts
if (isActiveForCurrentPlatform(WebAutoConfiguration)) {
    context.register(WebAutoConfiguration);
}
```

`NodeAutoConfiguration` is never auto-registered.

### 6.2 Fix

Original intent — register `NodeAutoConfiguration` alongside `WebAutoConfiguration`:

```ts
if (isActiveForCurrentPlatform(WebAutoConfiguration)) {
    context.register(WebAutoConfiguration);
}
if (isActiveForCurrentPlatform(NodeAutoConfiguration)) {
    context.register(NodeAutoConfiguration);
}
```

**Decision (2026-09-04):** `@ndigo/boot` does **not** statically depend on `@ndigo/platform-node`. `@ndigo/boot` is consumed by browser applications (`app-browser`/`ndigo-todo` import `ApplicationBuilder`), and `@ndigo/platform-node`'s index re-exports `node-http-server-adapter`, which does a real `import { createServer } from 'node:http'`. Routing `NodeAutoConfiguration` through boot would drag `node:http` into every browser build.

Instead, Node applications register `NodeAutoConfiguration` explicitly as an `ApplicationBuilder` source (see `apps/ndigo-hello-node` and `apps/ndigo-api`):

```ts
const app = new ApplicationBuilder([NodeAutoConfiguration, MyConfiguration]);
```

`_prepareContext` already loops `this.#sources` and conditionally registers each via `isActiveForCurrentPlatform`.

**Resolved (2026-09-04):** after the package-separation refactor, `@ndigo/boot` now auto-registers `NodeAutoConfiguration` on the node platform. It imports it via the browser-safe `@ndigo/platform-node/node-auto-configuration` subpath (its transitive `node:http` imports are type-only, so no runtime `node:http` is dragged into browser bundles). Node apps no longer need to pass `NodeAutoConfiguration` explicitly; the SSR demo simplifies accordingly.

### 6.3 `NodeAutoConfiguration` should also register:

- `NodeDispatcher` (replaces the manual `handlerMapping` + `handlerAdapter` setup)
- `HTTPServer` (auto-started on context refresh)
- `HTTPResponseViewTarget` (as the default view target)
- `StaticFileView` (for a configured static directory)

---

## 7. ResponseEntity

### 7.1 Motivation

Current route handlers return plain objects. The demo serializes them to JSON. There's no way to set HTTP status codes, headers, or content types from a handler.

### 7.2 Design

Status codes and header names reuse the existing vocabulary from `@ndigo/http` (`ResponseStatus`, `ResponseStatuses`, `HTTPHeaders`) rather than reinventing raw numbers and strings:

```ts
import { ResponseStatus, ResponseStatuses } from '@ndigo/http';

class ResponseEntity<T = unknown> {
    readonly body: T;
    readonly status: ResponseStatus;
    readonly headers: Record<string, string>;

    constructor(body: T, status: ResponseStatus, headers: Record<string, string> = {}) {
        this.body = body;
        this.status = status;
        this.headers = headers;
    }

    // status is a ResponseStatus from existing ResponseStatuses constants
    static ok<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.OK);
    }
    static created<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.CREATED);
    }
    static noContent(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NO_CONTENT);
    }
    static notFound(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NOT_FOUND);
    }
}
```

The `NodeDispatcher.render()` or a `ResponseEntityView` checks for `ResponseEntity` in the `ModelAndView.model` and writes status/headers/body accordingly. Header names come from `HTTPHeaders` constants (e.g. `HTTPHeaders.CONTENT_TYPE`, `HTTPHeaders.LOCATION`) instead of string literals.

---

## 7.5 Reuse from `@ndigo/http`

The Node foundation overlaps with `@ndigo/http` — reuse its HTTP vocabulary instead of inventing parallel types:

| `@ndigo/http`                                         | Used for                                                                                 | Replaces in spec                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------- |
| `HTTPMethod` union (incl. new `'QUERY'` per RFC 9889) | `@requestMapping.method`, `Route.method`, `HTTPMethodCondition`                          | The proposed `RequestMethod` enum |
| `HTTPHeaders` (typed header constants)                | Response/request header names in `HTTPResponseViewTarget`, `ResponseEntity`, server CORS | Raw string literals               |
| `ResponseStatus` / `ResponseStatuses`                 | `ResponseEntity.status`                                                                  | Raw `number` status codes         |

**Dependency direction:** `@ndigo/dispatcher` uses a **type-only** `import type { HTTPMethod }` — erased at emit, no runtime coupling to the DOM-global `fetch` code in `@ndigo/http`. `@ndigo/platform-node` consumes the constants at runtime (Node-only package, not subject to the isomorphic no-browser-globals rule; Node 18+ ships the fetch globals `@ndigo/http` references).

**Server-side CORS** (a noted gap) registers headers via `HTTPHeaders.ACCESS_CONTROL_*` and includes `HTTPMethod.QUERY` in the default allowed-methods list (safe method). The existing client `cors-interceptor.ts` in `@ndigo/platform-web` keeps its current defaults (user-configurable) but should switch its hardcoded `DEFAULT_METHODS` strings to use the `HTTPMethod` type.

**Longer-term:** if the dependency direction ever bites, extract the vocabulary (`HTTPMethod`, `HTTPHeader`, `HTTPHeaders`, `ResponseStatus`, `ResponseStatuses`) into a neutral low-level module consumed by both `@ndigo/http` and the server stack. Not worth doing until the coupling is a real problem.

---

## 7.6 Telemetry

`@ndigo/telemetry` instruments Ndigo classes with OpenTelemetry. The Node foundation both **preserves** existing instrumentation and **adds** new spans.

### Existing instrumentation — impact

| Instrumentation             | Wraps                                  | Impact                                                                                                                                                                                                                                                                                                    |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DispatcherInstrumentation` | `BrowserDispatcher.prototype.dispatch` | **None** — because `NodeDispatcher extends BrowserDispatcher`, `dispatch` is inherited and the existing wrap covers both platforms automatically. Upgrade its attributes to the OTel server conventions once `Route.method` exists: `http.method`, `http.route`, `http.target`. Span kind stays `SERVER`. |
| `RouterInstrumentation`     | `HashRouter._setRoute`                 | None                                                                                                                                                                                                                                                                                                      |
| `ContextInstrumentation`    | `GenericApplicationContext.destroy`    | None                                                                                                                                                                                                                                                                                                      |
| `CountedInstrumentation`    | `@counted` metadata                    | None — new classes opt in via `@counted` where useful                                                                                                                                                                                                                                                     |

### New instrumentations

| Instrumentation                         | Wraps                                    | Span / attributes                                                                                                                                                   |
| --------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTPServerInstrumentation`             | `HTTPServer.listen` / `HTTPServer.close` | kind `SERVER`; `server.address`, `server.port` (OTel `http.*` semconv at pinned `~1.25.1`)                                                                          |
| `HTTPResponseViewTargetInstrumentation` | `HTTPResponseViewTarget.commit`          | kind `SERVER`; `http.status_code` (from `ResponseStatus`), `content-type`. This is the only place the final status code is visible — the dispatch span can't see it |

### Packaging

`@ndigo/telemetry` adds `@ndigo/platform-node` to devDependencies + peerDependencies (same one-directional pattern as the existing `@ndigo/platform-web` dep for `RouterInstrumentation`). New files live under `src/instrumentation/http-server/` and `src/instrumentation/http-response-view-target/`, exported from `src/index.ts`.

> **TODO (future):** when `BrowserDispatcher` moves to `@ndigo/platform-web`, `DispatcherInstrumentation`'s import must follow (it currently imports `BrowserDispatcher` from `@ndigo/dispatcher`). The deferred §2.1 TODO and this one move together.

---

## 8. What Changes

### New Files

| File                                                                                                  | Description                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ndigo-dispatcher/src/request-mapping.ts`                                                    | `@requestMapping` decorator + `RequestMappingConfiguration`                                                                                                                        |
| `packages/ndigo-dispatcher/src/http-method-mapping.ts`                                                | `@getMapping`, `@postMapping`, `@putMapping`, `@deleteMapping`, `@patchMapping`, `@queryMapping`                                                                                   |
| `packages/ndigo-dispatcher/src/http-method-condition.ts`                                              | `HTTPMethodCondition` — filters mappings by `route.method` (`HTTPMethod` type-only import from `@ndigo/http`)                                                                      |
| `packages/ndigo-platform-node/src/http-server.ts`                                                     | `HTTPServer`, `HTTPServerOptions`, `HTTPServerAdapter` interface                                                                                                                   |
| `packages/ndigo-platform-node/src/node-http-server-adapter.ts`                                        | `NodeHTTPServerAdapter` wrapping `node:http`                                                                                                                                       |
| `packages/ndigo-platform-node/src/node-dispatcher.ts`                                                 | `NodeDispatcher extends BrowserDispatcher`, overrides `render()` for HTTP response                                                                                                 |
| `packages/ndigo-platform-node/src/node-view-target.ts`                                                | `HTTPResponseViewTarget`                                                                                                                                                           |
| `packages/ndigo-platform-node/src/static-file-view.ts`                                                | `StaticFileView`                                                                                                                                                                   |
| `packages/ndigo-platform-node/src/response-entity.ts`                                                 | `ResponseEntity`                                                                                                                                                                   |
| `packages/ndigo-platform-node/src/response-entity-view.ts`                                            | View that handles `ResponseEntity`                                                                                                                                                 |
| `packages/ndigo-router/src/route.ts`                                                                  | `Route` interface gains `method?: HTTPMethod` (type-only import from `@ndigo/http` — precedent already set by the runtime `QueryString`/`MatrixString` imports in `@ndigo/router`) |
| `packages/ndigo-telemetry/src/instrumentation/http-server/http-server.ts`                             | `HTTPServerInstrumentation` — spans `HTTPServer.listen`/`close`                                                                                                                    |
| `packages/ndigo-telemetry/src/instrumentation/http-response-view-target/http-response-view-target.ts` | `HTTPResponseViewTargetInstrumentation` — spans `HTTPResponseViewTarget.commit`, records `http.status_code`                                                                        |

### Modified Files

| File                                                           | Change                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/ndigo-dispatcher/src/index.ts`                       | Export `@requestMapping`, `@getMapping`, `@postMapping`, etc., `HTTPMethodCondition`                               |
| `packages/ndigo-dispatcher/src/route-mapping.ts`               | `RouteMappingConfiguration` gains optional `method?: HTTPMethod`; shared metadata writer used by `@requestMapping` |
| `packages/ndigo-boot/src/conditional.ts`                       | Rename `ConditionalOnBrowser` → `conditionalOnBrowser`, `ConditionalOnNode` → `conditionalOnNode` (camelCase)      |
| `packages/ndigo-boot/src/web-auto-configuration.ts`            | Update to `@conditionalOnBrowser`                                                                                  |
| `packages/ndigo-boot/test/conditional.spec.ts`                 | Update to camelCase names                                                                                          |
| `packages/ndigo-dispatcher/src/radix-route-handler-mapping.ts` | Filter by HTTP method when present                                                                                 |
| `packages/ndigo-platform-node/src/node-auto-configuration.ts`  | Register `NodeDispatcher`, `HTTPServer`, view target                                                               |
| `packages/ndigo-platform-node/src/index.ts`                    | Export new symbols                                                                                                 |
| `packages/ndigo-boot/src/application.ts`                       | Register `NodeAutoConfiguration` alongside `WebAutoConfiguration`                                                  |
| `packages/ndigo-platform-web/src/cors-interceptor.ts`          | Type `DEFAULT_METHODS` against `HTTPMethod` (currently hardcoded string literals); defaults unchanged              |

### Package Dependencies

| Package                | Adds                                                                | Reason                                                                |
| ---------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `@ndigo/dispatcher`    | `@ndigo/http` (type-only) — devDep for build, peerDep for consumers | `HTTPMethod` in `RequestMappingConfiguration` / `HTTPMethodCondition` |
| `@ndigo/router`        | `@ndigo/http` (type-only)                                           | `Route.method?: HTTPMethod`                                           |
| `@ndigo/platform-node` | `@ndigo/http` (runtime)                                             | `ResponseStatus`, `ResponseStatuses`, `HTTPHeaders` constants         |
| `@ndigo/telemetry`     | `@ndigo/platform-node` (devDep + peerDep)                           | `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`  |

### Unchanged

| `@ndigo/view` `StringTemplateView` | `@ndigo/view` `ContentNegotiationViewResolver` | `@ndigo/router` `RouteRegistry` | `@ndigo/context` `FeatureContextMountManager` | All existing tests |

---

## 9. Open Questions

| Question                                          | Options                                                                                                 | Recommendation                                                                                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Depend on Hono or wrap `node:http` directly?      | (a) Raw `node:http`, (b) Hono, (c) Express                                                              | **Raw `node:http`** for the adapter — zero deps. Users can wrap Hono/Express themselves if they want routing sugar                                                                                                |
| Where should `@getMapping`/`@postMapping` live?   | (a) `@ndigo/dispatcher`, (b) `@ndigo/platform-node`, (c) `@ndigo/router`                                | **`@ndigo/dispatcher`** — they work on both platforms; the method is just metadata                                                                                                                                |
| Where should `BrowserDispatcher` ultimately live? | (a) Move to `@ndigo/platform-web` now, (b) Keep in `@ndigo/dispatcher`, defer move                      | **(b)** — defer (TODO in §2.1). `NodeDispatcher extends BrowserDispatcher` works today; the move needs an `AbstractDispatcher` extraction and package re-arrangement                                              |
| `@requestMapping` alias vs own decorator?         | (a) Pure alias of `@routeMapping`, (b) Own decorator extending the shared metadata config with `method` | **(b)** — it carries HTTP request semantics (`method` now, `headers`/`consumes`/`produces` later) that a client route never has. Shares the metadata key so the mapping stack and hybrid controllers stay unified |
| Should `@ndigo/boot` auto-start the HTTP server?  | (a) Auto-start on context refresh, (b) Manual `.start()` call                                           | **(a) Auto-start** — Spring Boot does this. The `HTTPServer` entry listens after context refresh                                                                                                                  |
| Port configuration?                               | (a) Hardcoded in `@entry`, (b) `@ConfigurationProperties`, (c) `process.env.PORT`                       | **(b) + (c)** — `@ConfigurationProperties` for explicit config, fallback to `PORT` env var                                                                                                                        |

---

## 10. Acceptance Criteria

| Gate                                                                              | Verification                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NodeDispatcher` inherits the full dispatch pipeline                              | All existing `BrowserDispatcher` tests pass unchanged; `NodeDispatcher` overrides only `render()` |
| `NodeDispatcher.dispatch()` processes a route end-to-end                          | Integration test: start server, send HTTP request, receive response                               |
| `@getMapping('/test')` matches only GET requests                                  | `@postMapping('/test')` handler does not fire on GET; `@queryMapping('/q')` fires only on QUERY   |
| `@routeMapping` without method matches any method                                 | Existing handlers unchanged                                                                       |
| `HTTPResponseViewTarget` writes rendered view to response                         | `StringTemplateView` → response body contains rendered HTML                                       |
| `ResponseEntity` sets status code and headers                                     | Handler returns `ResponseEntity.notFound()` → 404 response                                        |
| `StaticFileView` serves a file from disk                                          | Request to `/style.css` returns file content                                                      |
| `@ndigo/boot` auto-starts server on Node                                          | `ApplicationBuilder.run()` → server listening on port                                             |
| All existing tests pass                                                           | `pnpm build && pnpm test`                                                                         |
| `ndigo-demo-node` uses `NodeDispatcher` + `HTTPServer` instead of raw `node:http` | Demo compiles, starts, responds to requests                                                       |
