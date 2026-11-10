# Guide 00 — Core Concepts & Mental Model

Ndigo is one application model with two runtimes: a browser app and a Node
server share the same dependency container, the same route/dispatch vocabulary,
and the same view contracts. The difference is the platform preset that supplies
the runtime — a socket and HTTP server on Node, hash routing and DOM targets in
the browser.

This guide is the map. It names the pieces, shows how a request and a render
flow through them, and points at the guide that teaches each surface. Read it
before guide 01 (Node) or guide 02 (browser) if the package names are still
unfamiliar.

**Audience:** New Ndigo developers · **Prerequisites:** Workspace bootstrapped (`pnpm install`) · **Reference app:** `apps/05-ndigo-api` (browser companion: `apps/08-ndigo-views`)

## What you'll learn

- The five nouns every Ndigo application uses: context, bean, route, handler, view.
- How a request becomes a handler result and a rendered representation.
- Which package family owns which concern.
- When to use signals, context events, SSE/WebSockets, jobs, or flags.

## 1. One application, one context

An application is assembled around an **application context** — a dependency
container with a lifecycle. You register configuration classes and entries; the
context creates the beans, injects their collaborators, and closes them in
order when the app stops.

```ts
import { runNodeApplication } from '@ndigo/platform-node';

const app = await runNodeApplication([AppConfiguration], { port: 3000 });
// app.context is the live container; app.server is the bound HTTP server
```

The browser preset returns the same shape:

```ts
import { createWebApplication } from '@ndigo/platform-web';

const app = await createWebApplication([AppConfiguration]);
// app.context, plus the router and DOM view target
```

Everything else in this guide is reachable from that context. A **bean** is a
named value the context owns. A **configuration class** contributes entries; an
**entry** is the factory method that creates a bean. Guide 04 covers the
registration and lifecycle rules in depth.

## 2. The request path

Node requests and browser navigations both produce a **route**, and both are
handled by a **dispatcher**:

```text
transport (HTTP request / hash change)
        │
        ▼
Route  ── path, method, query, params, attributes
        │
        ▼
Router / handler mapping ── picks the handler method
        │
        ▼
RouteHandlerMethod ── binds @parameters, validates, invokes
        │
        ▼
ModelAndView / value ── view name + model
        │
        ▼
View resolver ── renders the representation
```

- **Route** — the request-shaped value (`path`, `method`, query/params, headers,
  cookies, body, attributes).
- **Handler mapping** — the table that maps a route to a handler method. Ndigo
  uses metadata decorators (`@getMapping`, `@postMapping`, `@requestMapping`)
  plus optional conditions (query, matrix, method, access).
- **Handler method** — the controller method plus its parameter metadata.
- **Argument resolvers** — turn `@parameters` declarations into method
  arguments, then validation and conversion run.
- **View** — the representation. A handler returns a `ModelAndView`, a view
  name, or a value the adapter knows how to render.

Guides 05 (routing), 06 (binding), 07 (validation), and 08 (errors) cover each
stage. Guide 09 covers the view side.

## 3. The view path

A view is a contract, not a template engine. The same handler can return:

- a named view resolved by a configured view resolver (EJS on Node, a Web
  Component in the browser);
- a serializing view (`JSONView`, `CSVView`, `TextView`, `OctetStreamView`);
- a `ProducerView` that streams a body;
- an `IslandView` that renders server HTML and hydrates on the client.

**Content negotiation** chooses the representation from the route (path
extension and `Accept` header) before the view resolver runs. The view target is
the platform half: an HTTP response on Node, a DOM element in the browser.

Guide 09 covers view contracts, targets, negotiation, EJS, Web Components, and
themes.

## 4. The platform split

The same application code runs on two platforms; the preset decides what
"transport" and "render target" mean:

| Concern       | Node (`@ndigo/platform-node`)      | Browser (`@ndigo/platform-web`)        |
| ------------- | ---------------------------------- | -------------------------------------- |
| Bootstrap     | `runNodeApplication`               | `createWebApplication`                 |
| Transport     | HTTP/1.1, HTTP/2, WebSocket server | hash/history routing, `fetch`          |
| View target   | HTTP response                      | DOM element                            |
| Static assets | filesystem handler / static views  | Vite dev server and bundles            |
| Test harness  | `bootApp` + `MockHTTP`             | `bootBrowserApp` + `BrowserMockClient` |

Platform packages are adapters, not forks: `@ndigo/platform-node` and
`@ndigo/platform-web` wire the shared contracts to a runtime. Guides 01 and 02
walk each preset end to end.

## 5. The package families

The 47 packages group into layers. You do not need all of them; the ones you
install are the ones your app imports.

| Layer         | Packages                                                                                                                                                | What it gives you                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Foundation    | `@ndigo/core`, `@ndigo/util`, `@ndigo/factory`, `@ndigo/context`, `@ndigo/boot`                                                                         | primitives, DI, configuration, lifecycle, presets     |
| Web           | `@ndigo/router`, `@ndigo/dispatcher`, `@ndigo/view`, `@ndigo/view-ejs`, `@ndigo/view-webcomponent`, `@ndigo/view-toon`, `@ndigo/http`, `@ndigo/openapi` | routes, binding, views, client, API docs              |
| Platforms     | `@ndigo/platform-node`, `@ndigo/platform-web`                                                                                                           | runtime adapters                                      |
| Data          | `@ndigo/orm`, `@ndigo/orm-drizzle`, `@ndigo/cache`, `@ndigo/redis`                                                                                      | persistence, caching, shared stores                   |
| Security      | `@ndigo/auth-core`, `@ndigo/auth-server`, `@ndigo/auth-client`, `@ndigo/rate-limit`                                                                     | credentials, sessions, JWT, OIDC, limits              |
| Async         | `@ndigo/scheduler`, `@ndigo/jobs`, `@ndigo/locks`, `@ndigo/cluster`, `@ndigo/socket`                                                                    | scheduled/background work, coordination, realtime     |
| Cross-cutting | `@ndigo/log`, `@ndigo/telemetry*`, `@ndigo/management`, `@ndigo/proxy`, `@ndigo/resilience`, `@ndigo/flags`, `@ndigo/content`                           | observability, interception, flags, i18n              |
| Browser       | `@ndigo/signals`, `@ndigo/host`, `@ndigo/dom`                                                                                                           | reactive state, micro-frontend shell, DOM integration |

The package READMEs are the per-package reference; the guides are the
task-shaped paths through them.

## 6. Choosing a communication primitive

One of the most common design questions is "where does this update live?". The
framework deliberately separates four mechanisms:

| Need                                                      | Use                                                  | Guide  |
| --------------------------------------------------------- | ---------------------------------------------------- | ------ |
| Local, synchronous derived state in one component/service | signals (`signal`, `computed`, `effect`)             | 29     |
| Cross-context notification inside one application         | application events (`context.emit` / `EventGateway`) | 04     |
| Server → client live push                                 | SSE (`ServerSentEventView`) or WebSockets            | 15, 29 |
| Work that must survive a restart or run later             | jobs + outbox                                        | 22     |
| Work that runs on a clock                                 | `@scheduled`                                         | 23     |
| Boot-time or request-time feature decision                | `@whenFeature` / feature flags                       | 34     |

Signals are **not** an event bus, and context events are **not** a durable
queue. Picking the right one up front avoids most of the "why did this update
twice?" bugs.

## 7. Lifecycle at a glance

```text
create builder
    │
    ▼
register configuration classes
    │
    ▼
refresh() ── create beans, inject aware values, run init hooks, start lifecycles
    │
    ▼
serve / render
    │
    ▼
close() ── stop lifecycles (reverse phase order), destroy beans, close children
```

`refresh()` is idempotent while active; `close()` is idempotent after
destruction. Child contexts close depth-first before the parent. Guide 04
covers the hooks and ordering in detail; the reference doc is
[Application Context Lifecycle](../reference/2026-08-22_CONTEXT_LIFECYCLE.md).

## 8. Where to go next

- **Build a Node API:** guide 01, then 03 → 05 → 06 → 07 → 08 → 09.
- **Build a browser app:** guide 02, then 29 → 30 → 31.
- **Learn the container:** guide 04.
- **See the full map:** [ARCHITECTURE.md](../../ARCHITECTURE.md).

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the Node tutorial
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser tutorial
- [Guide 04 — Dependency Injection, Scopes & Lifecycle](04-dependency-injection-and-lifecycle.md) — the container in depth
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — layers, principles, and package map
