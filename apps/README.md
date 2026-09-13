# BlueJS Applications

This directory contains applications built with the BlueJS framework, arranged
from simple to complex. Each app demonstrates a distinct slice of the framework.

## Progression

| #   | App               | Demonstrates                                                                                                                                                           |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `blue-hello`      | Browser — context + route + template/Web Component render                                                                                                              |
| 2   | `blue-hello-node` | Node — `HTTPServer` + `NodeDispatcher` + `@getMapping`, JSON responses                                                                                                 |
| 3   | `blue-todo`       | Browser — TodoMVC + micro frontend shell (`@blue/host` one-call registration, relay gateway)                                                                           |
| 4   | `blue-api`        | Node — controllers, JWT auth, ORM (+Drizzle), content negotiation, problem+json errors, **management `/health`/`/metrics`**, **Accept-Language i18n**, config bindings |
| 5   | `blue-host`       | Browser — micro frontend host: `@blue/host` `HostManager` + 3 lazy-loaded feature chunks, shared-dependency validation                                                 |
| 6   | `blue-island`     | Node SSR — EJS shell + island hydration, SSE push → `@blue/signals`, typed service stream                                                                              |
| 7   | `blue-views`      | Browser — view-resolution composite, i18n/themes (`@blue/content`), HTTP client with offline queueing                                                                  |

## Applications

### blue-hello

Minimal BlueJS SPA: a context, a route, and a Web Component view saying hello.

```bash
cd apps/blue-hello && pnpm dev
```

### blue-hello-node

Minimal Node HTTP server using the Node platform foundation. One controller,
`@getMapping`, JSON out.

```bash
cd apps/blue-hello-node && pnpm start
# GET http://127.0.0.1:3000/hello?name=Blue
```

### blue-todo

TodoMVC implementation with a micro frontend shell: feature mount manager,
relay gateway, and feature routing registry. Vite dev server + integration tests.

```bash
cd apps/blue-todo && pnpm dev
```

### blue-api

Full Node server demo: greeting/echo controllers, JWT auth, ORM-backed notes,
matrix-parameter product routes, `ResponseEntity` (status/headers), and static
file serving.

```bash
cd apps/blue-api && pnpm start
# GET  http://127.0.0.1:3000/api/hello?name=Alice
# POST http://127.0.0.1:3000/auth/login {"username":"admin","password":"demo"}
# GET  http://127.0.0.1:3000/notes  (Authorization: Bearer <token>)
```

### blue-host

Micro frontend host: a shell context with a shared dependency registry, three
features (catalog, checkout, reports) loaded as lazy chunks via `mountLazy` +
dynamic `import()`, and one-call feature registration through the
`@blue/host` `HostManager` (exclusive activation).

```bash
cd apps/blue-host && pnpm dev
# navigate to /catalog, /checkout, /reports
```

Build output shows each feature as its own chunk (`catalog-*.js`,
`checkout-*.js`, `reports-*.js`) — fetched only on demand.

## Development

**Run an application:**

```bash
cd apps/<app-name>
pnpm dev     # or pnpm start for node apps
```

**Build an application:**

```bash
cd apps/<app-name>
pnpm build
```

## Configuration

Applications in this directory:

- Extend from `apps/tsconfig.json`
- Are not published to npm (`private: true`)
- Can depend on any `@blue/*` package
- Use bundlers (Vite, etc.) for browser apps, `tsx` for node apps

See individual app directories for specific details.
