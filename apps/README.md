# Ndigo Applications

Runnable example applications built with Ndigo, numbered in recommended
reading order: `apps/NN-ndigo-<slug>`.

The number is **reading order only** — it never appears in a package name,
import specifier, or nx target. Package names are stable (`@ndigo/<slug>`), so
renumbering the ladder is a mechanical directory sweep and nothing more. New
apps append at the next free number: `ndigo new <slug> --kind node|browser`
scaffolds the skeleton and allocates the number and dev port (AD-85, guide 37);
add the app's row below by hand. See the
[example-applications plan](../docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md)
for the planned `08+` portfolio.

Paired front-end/back-end apps use the `-web` / `-api` role suffixes and sit
next to each other in the ladder (`03-ndigo-todo-web` + `04-ndigo-todo-api`,
`10-ndigo-conduit-web` + `11-ndigo-conduit-api`). The full directory, package,
and file-naming convention is in
[guide 91 — Application Conventions](../docs/guides/91-application-conventions.md).

## Progression

| #   | Directory                  | Package                  | Runtime             | Dev port         | Demonstrates                                                                                                                                                                                                                       |
| --- | -------------------------- | ------------------------ | ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `01-ndigo-hello`           | `@ndigo/hello`           | Browser (Vite)      | 3001             | Browser — context + route + template/Web Component render                                                                                                                                                                          |
| 2   | `02-ndigo-hello-node`      | `@ndigo/hello-node`      | Node (`tsx`)        | 3010             | Node — `HTTPServer` + `NodeDispatcher` + `@getMapping`, JSON responses, WebSocket echo                                                                                                                                             |
| 3   | `03-ndigo-todo-web`        | `@ndigo/todo-web`        | Browser (Vite)      | 3003             | Browser — TodoMVC + micro frontend shell (`@ndigo/host` one-call registration, relay gateway)                                                                                                                                      |
| 4   | `04-ndigo-todo-api`        | `@ndigo/todo-api`        | Node (`tsx`)        | 3030             | Node — the Todo-Backend REST spec (CRUD + CORS/HEAD/OPTIONS/status contract), verified against the public runner's checklist                                                                                                       |
| 5   | `05-ndigo-api`             | `@ndigo/api`             | Node (`tsx`)        | 3000             | Node — controllers, opaque session-token auth, ORM (+Drizzle), content negotiation, problem+json errors, **management `/health`/`/metrics`**, **Accept-Language i18n**, config bindings                                            |
| 6   | `06-ndigo-host-demo`       | `@ndigo/host-demo`       | Browser (Vite)      | 3100             | Browser — micro frontend host: `@ndigo/host` `HostManager` + 3 lazy-loaded feature chunks, shared-dependency validation                                                                                                            |
| 7   | `07-ndigo-island`          | `@ndigo/island`          | Node + built client | 3200             | Node SSR — EJS shell + island hydration, SSE push → `@ndigo/signals`, typed service stream, registry-installed ndigo-ui controls (AD-95)                                                                                           |
| 8   | `08-ndigo-views`           | `@ndigo/views`           | Browser (Vite)      | 3005             | Browser — view-resolution composite (three view locations), i18n (`@ndigo/content`), HTTP client with cache + offline queueing                                                                                                     |
| 9   | `09-ndigo-httpbin`         | `@ndigo/httpbin`         | Node (`tsx`)        | 3020             | Node — HTTP semantics playground: cross-source binding, redirects/status/cookies/auth challenges, compression, rate limiting, matrix params (modelled on httpbin)                                                                  |
| 10  | `10-ndigo-conduit-web`     | `@ndigo/conduit-web`     | Browser (Vite)      | 3400             | Browser — RealWorld frontend: hash routes, auth guard + 401 session drop, forms with error-envelope mapping, optimistic favorite/follow with rollback, markdown (escape-by-default), pagination (proxies `/api` → the Conduit API) |
| 11  | `11-ndigo-conduit-api`     | `@ndigo/conduit-api`     | Node (`tsx`)        | 3040             | Node — RealWorld (Conduit) API conformance: JWT auth, articles/comments/tags/favorites/follows, pagination + filters, spec-exact error envelope                                                                                    |
| 12  | `12-ndigo-petclinic`       | `@ndigo/petclinic`       | Node (`tsx`)        | 3050             | Node SSR — EJS forms + validation re-render, i18n (en/fr), paginated owner/pet/visit/vet flows, JSON negotiation, static assets (spring-petclinic port)                                                                            |
| 13  | `13-ndigo-chat`            | `@ndigo/chat`            | Node + built client | 3060             | Real-time rooms: history replay, presence, typing, reconnect — plus STOMP interop with a third-party client (`@stomp/stompjs`)                                                                                                     |
| 14  | `14-ndigo-kanban`          | `@ndigo/kanban`          | Node + built client | 3070             | Collaborative board: versioned cards, 409 conflict on stale writes, optimistic UI with rollback, live multi-client updates (snapshot-then-events on reconnect)                                                                     |
| 15  | `15-ndigo-resilience-lab`  | `@ndigo/resilience-lab`  | Node (`tsx`)        | 3080             | Node — `@retry`/`@circuitBreaker` lab: controllable flaky upstream, breaker state machine + health indicator, counters, deterministic clock                                                                                        |
| 16  | `16-ndigo-redis-fanout`    | `@ndigo/redis-fanout`    | Node (`tsx`)        | 3160 (2nd: 3161) | Node — shared cache + cross-node socket fan-out via `@ndigo/redis` when `NDIGO_REDIS_URL` is set; clean single-node fallback without Redis                                                                                         |
| 17  | `17-ndigo-telemetry-lab`   | `@ndigo/telemetry-lab`   | Node + built client | 3090             | Node — end-to-end observability: browser→server trace continuation, scheduled-task spans, socket metrics, sampling, console/OTLP exporters                                                                                         |
| 18  | `18-ndigo-auth-playground` | `@ndigo/auth-playground` | Node + built client | 3110             | Node — auth matrix: secure cookies + session rotation, JWT expiry/refresh, role guards on HTTP and sockets, rate-limited login, durable LibSQL sessions, embedded OIDC issuer (code + PKCE S256)                                   |
| 19  | `19-ndigo-hn`              | `@ndigo/hn`              | Browser (Vite)      | 3450             | Browser — Hacker News reader: cached/offline HTTP client, incremental long-list rendering, deep links, comment tree bounded to depth 3                                                                                             |
| 20  | `20-ndigo-ui-lab`          | `@ndigo/ui-lab`          | Browser (Vite)      | 3460             | Browser — owned design system: full 42-item registry (tokens, native-first primitives, Zag.js behaviour, five blocks), typed token catalog, axe-clean                                                                              |
| 21  | `21-ndigo-agent-lab`       | `@ndigo/agent-lab`       | Node (`tsx`)        | 3210             | Node — local-model tool loop over MCP tools: MCP App (`ui://orders`), A2UI report, Streamable HTTP, SSE + one GenAI trace                                                                                                          |

## Applications

### 01-ndigo-hello

Minimal Ndigo SPA: a context, a route, and a Web Component view saying hello.

```bash
cd apps/01-ndigo-hello && pnpm dev
```

### 02-ndigo-hello-node

Minimal Node HTTP server using the Node platform foundation. One controller,
`@getMapping`, JSON out, plus a WebSocket echo endpoint.

```bash
cd apps/02-ndigo-hello-node && pnpm start
# GET http://127.0.0.1:3010/hello?name=Ndigo
```

### 03-ndigo-todo-web

TodoMVC implementation with a micro frontend shell: feature mount manager,
relay gateway, and feature routing registry. Vite dev server + integration tests.
The matching Todo-Backend spec server is
[04-ndigo-todo-api](04-ndigo-todo-api/README.md).

```bash
cd apps/03-ndigo-todo-web && pnpm dev
```

### 04-ndigo-todo-api

Implementation of the [Todo-Backend](https://www.todobackend.com/) REST spec:
five JSON operations plus the protocol surface its public browser runner
exercises (CORS preflight, `HEAD`, `OPTIONS`, exact statuses). The paired
frontend is [03-ndigo-todo-web](03-ndigo-todo-web/README.md).

```bash
cd apps/04-ndigo-todo-api && pnpm start
# GET http://127.0.0.1:3030/todos
```

### 05-ndigo-api

Full Node server demo: greeting/echo controllers, opaque session-token auth,
ORM-backed notes, matrix-parameter product routes, `ResponseEntity`
(status/headers), and static file serving.

```bash
cd apps/05-ndigo-api && pnpm start
# GET  http://127.0.0.1:3000/api/hello?name=Alice
# POST http://127.0.0.1:3000/auth/login {"username":"admin","password":"demo"}
# GET  http://127.0.0.1:3000/notes  (Authorization: Bearer <token>)
```

### 06-ndigo-host-demo

Micro frontend host: a shell context with a shared dependency registry, three
features (catalog, checkout, reports) loaded as lazy chunks via `mountLazy` +
dynamic `import()`, and one-call feature registration through the
`@ndigo/host` `HostManager` (exclusive activation).

```bash
cd apps/06-ndigo-host-demo && pnpm dev
# navigate to /catalog, /checkout, /reports
```

Build output shows each feature as its own chunk (`catalog-*.js`,
`checkout-*.js`, `reports-*.js`) — fetched only on demand.

### 07-ndigo-island

Hybrid island demo: the Node server renders a whole shell document with EJS
(`@ndigo/view-ejs`) containing server-side island markup, serves the built
client bundle that hydrates it, and pushes source-of-truth model updates to
islands over SSE.

```bash
cd apps/07-ndigo-island && pnpm dev
# GET http://127.0.0.1:3200/
# GET http://127.0.0.1:3200/events   (SSE stream)
```

### 08-ndigo-views

View-resolution demo: one ordered resolver chain over three view locations
(component module, context entry, module on disk). Content negotiation — one
logical view served as JSON or CSV — lives in
[05-ndigo-api](05-ndigo-api/README.md).

```bash
cd apps/08-ndigo-views && pnpm dev
```

### 09-ndigo-httpbin

HTTP semantics playground modelled on [httpbin](https://github.com/postmanlabs/httpbin):
echo what the dispatcher saw, and shape the response back — statuses,
redirect chains, cookies, auth challenges, compression, delays, binary bodies,
matrix-parameter routes, and a rate-limited endpoint.

```bash
cd apps/09-ndigo-httpbin && pnpm start
# GET http://127.0.0.1:3020/get?a=1
```

### 10-ndigo-conduit-web

The RealWorld (Conduit) frontend: hash-routed pages for feeds, articles,
profiles, editor and settings on top of
[11-ndigo-conduit-api](11-ndigo-conduit-api/README.md) (the Vite dev server
proxies `/api` to the API, so the browser stays same-origin).

```bash
cd apps/11-ndigo-conduit-api && pnpm start   # in one terminal
cd apps/10-ndigo-conduit-web && pnpm dev     # in another
# open http://127.0.0.1:3400/
```

### 11-ndigo-conduit-api

The [RealWorld](https://github.com/gothinkster/realworld) "Conduit" backend: JWT
auth, articles/tags/comments, follows and favorites, pagination and filters,
with the spec-exact `{errors:{…}}` envelope — in-memory, zero infrastructure.
The paired frontend is [10-ndigo-conduit-web](10-ndigo-conduit-web/README.md).

```bash
cd apps/11-ndigo-conduit-api && pnpm start
# GET http://127.0.0.1:3040/api/tags
```

### 12-ndigo-petclinic

A [spring-petclinic](https://github.com/spring-projects/spring-petclinic)-style
vertical: server-rendered EJS pages for owners, pets, visits and vets, with form
binding, localized validation that re-renders with the entered values, and JSON
representations of the same resources.

```bash
cd apps/12-ndigo-petclinic && pnpm start
# GET http://127.0.0.1:3050/
```

### 13-ndigo-chat

Real-time chat rooms with a Web Component client: room history replay on join,
presence and typing events, reconnect with resubscribe — and a STOMP endpoint
verified against the third-party `@stomp/stompjs` client.

```bash
cd apps/13-ndigo-chat && pnpm dev
# open http://127.0.0.1:3060/
```

### 14-ndigo-kanban

A collaborative kanban board: versioned cards with 409 conflict handling,
optimistic drag-and-drop with rollback, and live updates across tabs — open two
browsers to watch a card move in both.

```bash
cd apps/14-ndigo-kanban && pnpm dev
# open http://127.0.0.1:3070/
```

### 15-ndigo-resilience-lab

Retry and circuit-breaker lab: one process runs a controllable flaky upstream
and a `@ndigo/service` client whose methods carry `@retry`/`@circuitBreaker`
policies, with a control plane to drive the breaker open, probe it half-open,
and watch it close (plus a health indicator and counters).

```bash
cd apps/15-ndigo-resilience-lab && pnpm start
# GET http://127.0.0.1:3080/health
```

### 16-ndigo-redis-fanout

Two instances of one app share a cache and fan socket messages out across
nodes when `NDIGO_REDIS_URL` points at Redis; without it the same binary runs in
single-node memory mode. `GET /health` reports the active backend.

```bash
# optional: docker run -d -p 6379:6379 redis:7-alpine
NDIGO_REDIS_URL=redis://127.0.0.1:6379 PORT=3160 pnpm start   # then PORT=3161 in a second terminal
```

### 17-ndigo-telemetry-lab

End-to-end observability: instrumented HTTP routes, a scheduled task and a
socket push, with browser→server trace continuation, counters/gauges at
`/metrics`, and console or OTLP export (one-line collector container documented).

```bash
cd apps/17-ndigo-telemetry-lab && pnpm dev
# GET http://127.0.0.1:3090/health
```

### 18-ndigo-auth-playground

Six auth modes side by side, all self-contained: hardened session cookies with
id rotation, JWT expiry/refresh, role guards on HTTP and sockets, login rate
limiting behind trusted proxies, durable LibSQL sessions that survive a restart,
and an embedded OIDC issuer running the authorization-code + PKCE S256 flow.

```bash
# API + OIDC issuer on :3110
cd apps/18-ndigo-auth-playground && pnpm start
# GET http://127.0.0.1:3110/health
# client dev server on :3440 (second terminal)
pnpm dev
# open http://127.0.0.1:3440/
```

### 19-ndigo-hn

A Hacker News reader over the official API: cached and offline-capable HTTP
client, incremental long-list rendering, deep-linkable items, and a comment tree
bounded to depth 3.

```bash
cd apps/19-ndigo-hn && pnpm dev
# open http://127.0.0.1:3450/
```

## Ports

Dev ports are reserved in the registry below; Node apps read `PORT` and Vite
apps accept `--port`, so any port can be overridden for one-off runs. Keep new
apps on the next free port.

| Port        | App                                                                 |
| ----------- | ------------------------------------------------------------------- |
| 3000        | `05-ndigo-api` (the flagship Node app owns the 3000 default)        |
| 3001        | `01-ndigo-hello` (Vite)                                             |
| 3003        | `03-ndigo-todo-web` (Vite dev; e2e preview uses 4173)               |
| 3005        | `08-ndigo-views` (Vite)                                             |
| 3010        | `02-ndigo-hello-node`                                               |
| 3020        | `09-ndigo-httpbin`                                                  |
| 3030        | `04-ndigo-todo-api`                                                 |
| 3040        | `11-ndigo-conduit-api`                                              |
| 3050        | `12-ndigo-petclinic`                                                |
| 3060        | `13-ndigo-chat` (serves its built client)                           |
| 3070        | `14-ndigo-kanban` (serves its built client)                         |
| 3080        | `15-ndigo-resilience-lab`                                           |
| 3090        | `17-ndigo-telemetry-lab` (server + built client)                    |
| 3100        | `06-ndigo-host-demo` (Vite)                                         |
| 3110        | `18-ndigo-auth-playground` (client dev server 3440)                 |
| 3160 / 3161 | `16-ndigo-redis-fanout` (two instances for the fan-out demo)        |
| 3200 / 3280 | `07-ndigo-island` (dev / e2e)                                       |
| 3400        | `10-ndigo-conduit-web` (Vite dev; proxies `/api` → 3040)            |
| 3450        | `19-ndigo-hn` (Vite)                                                |
| 4000–4200   | dedicated `pnpm apps:smoke` probe ports (never reused as dev ports) |

## Development

**Run an application:**

```bash
cd apps/<app-dir>
pnpm dev     # browser apps (Vite), or `pnpm start` for Node apps
```

**Boot-probe every Node app** (spawn on the probe port, assert the documented
route, require a clean SIGTERM exit):

```bash
pnpm apps:smoke
```

**Build an application** (per app type):

```bash
# Browser apps — 01-ndigo-hello, 03-ndigo-todo-web, 06-ndigo-host-demo,
# 08-ndigo-views, 10-ndigo-conduit-web, 19-ndigo-hn
cd apps/<app-dir> && pnpm build

# 07-ndigo-island — builds only the client bundle; the server runs from source
cd apps/07-ndigo-island && pnpm build:client

# Node apps — 02-ndigo-hello-node and 05-ndigo-api have no build step;
# pnpm start runs src/index.ts directly through tsx.
```

Not every app defines a `build` script and `07-ndigo-island` defines
`build:client` instead, so the generic `cd apps/<app-dir> && pnpm build` does
not apply to all of them.

Browser apps lower TC39 decorators for both `vite dev` and `vite build` through
[`scripts/vite-plugin-lower-decorators.mjs`](../scripts/vite-plugin-lower-decorators.mjs);
new browser apps must include the plugin (see `01-ndigo-hello/vite.config.ts`).
Every app's imports must satisfy `pnpm manifest:check` (dependency-closure and
dead-dependency rules for app manifests).

## Per-App READMEs

Each application directory carries its own README with run instructions,
endpoints, and what the app demonstrates:

- [01-ndigo-hello](01-ndigo-hello/README.md)
- [02-ndigo-hello-node](02-ndigo-hello-node/README.md)
- [03-ndigo-todo-web](03-ndigo-todo-web/README.md)
- [04-ndigo-todo-api](04-ndigo-todo-api/README.md)
- [05-ndigo-api](05-ndigo-api/README.md)
- [06-ndigo-host-demo](06-ndigo-host-demo/README.md)
- [07-ndigo-island](07-ndigo-island/README.md)
- [08-ndigo-views](08-ndigo-views/README.md)
- [09-ndigo-httpbin](09-ndigo-httpbin/README.md)
- [10-ndigo-conduit-web](10-ndigo-conduit-web/README.md)
- [11-ndigo-conduit-api](11-ndigo-conduit-api/README.md)
- [12-ndigo-petclinic](12-ndigo-petclinic/README.md)
- [13-ndigo-chat](13-ndigo-chat/README.md)
- [14-ndigo-kanban](14-ndigo-kanban/README.md)
- [15-ndigo-resilience-lab](15-ndigo-resilience-lab/README.md)
- [16-ndigo-redis-fanout](16-ndigo-redis-fanout/README.md)
- [17-ndigo-telemetry-lab](17-ndigo-telemetry-lab/README.md)
- [18-ndigo-auth-playground](18-ndigo-auth-playground/README.md)
- [19-ndigo-hn](19-ndigo-hn/README.md)
- [20-ndigo-ui-lab](20-ndigo-ui-lab/README.md)
- [21-ndigo-agent-lab](21-ndigo-agent-lab/README.md)

## Configuration

Applications in this directory:

- Extend from `apps/tsconfig.json`
- Are not published to npm (`private: true`)
- Can depend on any `@ndigo/*` package
- Use bundlers (Vite, etc.) for browser apps, `tsx` for node apps

See individual app directories for specific details, and
[guide 91 — Application Conventions](../docs/guides/91-application-conventions.md)
for the shared layout and naming rules.
