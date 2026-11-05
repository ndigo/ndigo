# AD-90: Application lifecycle presets — entrypoint defaults, not configuration classes

**Date:** 2026-11-05
**Status:** Accepted
**Deciders:** Framework owner (2026-11-05 application-defaults review)

---

## Context

Ndigo already ships meaningful defaults at the **bean** layer:

- `NodeAutoConfiguration` provisions the Node argument resolvers, converter
  registry, handler mapping (security headers, feature gate, rate limit,
  CORS), dispatcher, error resolvers, managed `HTTPServer`, scheduler, jobs,
  locks, cache, conversion service, socket registry, and view resolver
  (`packages/ndigo-platform-node/src/node-auto-configuration.ts:71`).
- `WebAutoConfiguration` provisions the browser resolvers, handler mapping,
  view resolver chain, and language resolver
  (`packages/ndigo-platform-web/src/web-auto-configuration.ts:42`).
- Management endpoints, OpenAPI docs, auth, and ORM stay explicitly opt-in
  because they are security- or deployment-sensitive.

What the framework does **not** default is the **entrypoint**. Every Node app
repeats the same sequence — build the context, resolve `HTTP_SERVER`, start it,
install `gracefulShutdown`, and catch startup failures — and every browser app
repeats the same runtime wiring — create a view target, a `BrowserDispatcher`,
a `HashRouter`, register the framework tokens, and navigate. Measured on
2026-11-05:

- 13/13 Node app entrypoints repeat `ApplicationBuilder` +
  `context.getValue(HTTP_SERVER)` + `await server.start()` +
  `gracefulShutdown(context, …)` under `apps/*/src/index.ts`.
- 11/13 additionally mutate `process.env['PORT']` before building the context
  so the managed server and the logged URL agree.
- 5/5 browser entrypoints repeat `new DOMElementViewTarget` +
  `new BrowserDispatcher` + `new HashRouter`, and two of them duplicate the
  same `currentPath()` helper.
- `apps/05-ndigo-api/src/index.ts:34-42` hand-writes a `ConfigFileReader`
  because the platform ships none.
- `apps/10-ndigo-conduit-web/src/app/conduit-runtime.ts:48-52` documents that
  `@ndigo/boot` cannot be used in a browser (`ReferenceError: process is not
  defined`), while the root README recommends `@ndigo/boot` for client-side
  apps (`README.md:63`) and the boot README lists the Browser web
  auto-configuration as a supported environment.

Two candidate defaults were evaluated: a `@defaultParameters` controller
decorator and `DefaultNodeConfiguration` / `DefaultWebConfiguration` classes.
Neither removes the repetition above, and both would add a second defaulting
mechanism alongside the existing auto-configuration.

## Evidence

- `packages/ndigo-platform-node/src/node-auto-configuration.ts:103-117` —
  the default handler mapping already registers security headers, feature
  gate, rate limiting, and CORS; it does not start the server.
- `packages/ndigo-platform-node/src/http-server.ts:218-219` — `HTTPServer` is
  deliberately `isAutoStartup = false`: `refresh()` must never bind a socket.
- `packages/ndigo-boot/src/application.ts:299,314,346` — direct `process.env`
  reads in `_configureProfiles` / `#profileGroups` are the browser blocker.
- `packages/ndigo-dispatcher/src/parameters.ts:43` and
  `packages/ndigo-openapi/src/spec.ts:514-549` — OpenAPI parameters are built
  from the `MethodParameter[]` produced by `@parameters`; there is no runtime
  type metadata to infer an implicit binding from.
- `packages/ndigo-dispatcher/src/zod-validated-by.ts:126-150` — the typed,
  validated, OpenAPI-friendly DTO defaults already exist as
  `validatedBody(schema)` and `validatedQuery(schema)`.
- `packages/ndigo-test/src/browser-mock-client.ts:91-93` — the framework's own
  test harness notes that `WebAutoConfiguration` provides no dispatcher entry
  and the app must wire `BrowserDispatcher` manually.
- `apps/04-ndigo-todo-api/src/todo-http-interceptors.ts:80-89` — apps still mutate
  `HANDLER_MAPPING.interceptors` because there is no additive registration
  seam (tracked separately; not part of this decision).
- `docs/decisions/2026-11-01_AD85_APP_SCAFFOLDING.md` D-4.4 — an umbrella
  meta-package is rejected; the platform hubs carry the entry packages.
- `src/oxlint/_layers.ts` — `platform-node` (rank 8) and `platform-web`
  (rank 7) may depend on `boot` (rank 5); the direction is downward and
  acyclic.

## Decision

### D-1 — Explicit parameter binding stays the only binding surface

Do **not** add `@defaultParameters` (or any implicit source inference).
`@parameters` plus the `*Value` extractors remain the only way to bind
arguments. The documented DTO defaults are `validatedQuery(schema)`,
`validatedBody(schema)`, and `dataBinderValue(source)`.

The rejected alternative cannot preserve the contract: TypeScript types are
erased at runtime, path/query/matrix/header/cookie/body sources are
ambiguous by name, requiredness and conversion are not inferable, and the
OpenAPI generator needs an explicit `in`/`name`/schema per parameter. Route
changes would also silently change handler inputs. The existing
`validatedQuery` surface already covers the whole-query case in one line.

### D-2 — No `DefaultNodeConfiguration` / `DefaultWebConfiguration` classes

`NodeAutoConfiguration` and `WebAutoConfiguration` **are** the bean defaults;
a `Default*Configuration` wrapper would duplicate them. A class that also
gathered management, OpenAPI docs, auth, or ORM would silently turn on
security-sensitive surfaces (management endpoints are open by default).
`DefaultNodeConfiguration` as a name would additionally collide with the
established `Default*` convention for interface implementations.

### D-3 — Add lifecycle presets in the platform packages

Add two additive entrypoint presets:

- `runNodeApplication(sources, options)` in `@ndigo/platform-node`.
- `createWebApplication(sources, options)` in `@ndigo/platform-web`.

Both:

- auto-register the platform auto-configuration (`NodeAutoConfiguration` /
  `WebAutoConfiguration`) by default, with **`platform: false`** to opt out;
- compose the lower-order defaults rather than reimplementing them;
- return both the refreshed context and a runtime handle, so callers can
  reach every bean and service; the Node handle's `port` is the bound port
  (the ephemeral port when `port: 0` is requested), not just the requested
  value;
- expose explicit hooks for app-specific behavior (`configureBuilder` /
  `beforeStart` / `beforeNavigate`) and `false` switches for every implicit
  action;
- leave `ApplicationBuilder`, `MetadataConfigApplicationContext`,
  `NodeAutoConfiguration`, `WebAutoConfiguration`, `HTTPServer.start()`, and
  `gracefulShutdown()` public and unchanged.

No new `@ndigo/starters` package: AD-85 D-4.4 rejects umbrella packages that
duplicate the platform hubs and drift.

### D-4 — Node config files are default-on through a platform reader

Add `nodeConfigFileReader: ConfigFileReader` to `@ndigo/platform-node` (the
`ConfigFileReader` seam already lives in `@ndigo/context` for exactly this
split). `runNodeApplication` defaults `configFiles: true`, which constructs
`new StandardConfigFileLoader({ reader: nodeConfigFileReader })`; `false`
disables file loading and a loader instance overrides it.

Existing files are optional by default (`StandardConfigFileLoader` probes
`./config/` and `./` and skips missing files), so default-on does not break
an app without config files. Missing files stay silent.

### D-5 — `@ndigo/boot` becomes isomorphic

Replace the direct `process.env` reads in `Application._configureProfiles` /
`#profileGroups` with `getEnv` from `@ndigo/util`. This makes the documented
browser path true and lets `createWebApplication` use the same
`ApplicationBuilder` as `runNodeApplication` — one bootstrap story, profiles
and properties included.

`StandardConfigFileLoader` remains Node-construction-only; the browser preset
does not pass a `configFiles` option. If the browser test lane exposes a
blocker, the fallback is `MetadataConfigApplicationContext` inside the preset
without changing its public API; the fallback is recorded in the plan.

## Alternatives considered

- **`@defaultParameters`** — rejected for the reasons in D-1. There is no
  runtime type metadata, source inference is ambiguous (matrix parameters are
  segment-scoped by definition), and it would fork the documentation, tests,
  and OpenAPI surface.
- **`Default*Configuration` classes** — rejected for the reasons in D-2. They
  duplicate the auto-configurations or hide security-sensitive opt-ins.
- **A `@ndigo/starters` package** — rejected by AD-85 D-4.4. The platform
  packages already own the closure; a fifth aggregation point would drift.
- **Auto-starting `HTTPServer` on refresh** — rejected. `refresh()` must never
  bind a socket; tests and tooling depend on that contract.
- **Making `ApplicationBuilder.run()` start the server** — rejected. It would
  couple the isomorphic builder to the Node platform and break browser and
  test usage.
- **Adding dispatcher/router entries to `WebAutoConfiguration` instead of a
  preset** — rejected. The DOM root, event map, and first navigation are
  runtime inputs, not bean configuration; a configuration class would have to
  invent defaults (`#app`, hash routing) that the preset can expose explicitly.

## Consequences

- The 13 Node entrypoints and 5 browser entrypoints can shrink to a few lines,
  and the generator templates stop reproducing the long form.
- Two new runtime dependency edges: `platform-node → boot` and
  `platform-web → boot`. Both are legal under AD-89 (rank 8 > 5 and 7 > 5)
  and do not change the committed ranks. They require the reverse **dev**
  edges to go: `@ndigo/boot` drops its devDependencies on the platform
  packages, with its platform-integration specs importing the platform
  sources relatively. Nx builds the task graph from manifests of every
  kind, so the old dev edges would close a build cycle
  (`platform-node → boot → platform-node`, AD-67's acyclicity gate);
  `platform-boundary.spec.ts` now pins the manifest property.
- The browser bundle gains `@ndigo/boot`, and the view engine moves behind a
  lazy import so the barrel stays DOM-free (PWB-REV-001). Measured on
  2026-11-05 with `apps/19-ndigo-hn`, summing all dist chunks:
  **+100.3 kB raw / +30.0 kB gzip** (1,162.5 → 1,262.8 kB / 279.1 →
  309.1 kB). Accepted rather than falling back (D-5): no size budget exists,
  the bundle guards are behavioral, and the fallback would drop
  profiles/properties/config files from the browser story. The existing
  bundle guards stay green.
- No breaking change: the presets are new exports; every existing API remains
  and every implicit action has an opt-out.
- Docs must change with the code: guide 01 (Node §5), a new browser-app guide,
  the root README starter lists, the boot README, and the app generator
  templates.

## Out of scope

- An additive interceptor-registration seam (the four apps that splice
  `HANDLER_MAPPING.interceptors`). Tracked as a follow-up; the stale CORS note
  in `apps/04-ndigo-todo-api/src/todo-http-interceptors.ts` should be fixed
  with it.
- Auth, ORM, management, and OpenAPI auto-configuration. They remain explicit.
- `create-ndigo-app` (AD-85 Phase B) and any external scaffold changes.
- Migrating every example app at once. The plan migrates reference apps first;
  the rest can follow without a flag day.

## Revisit trigger

- A preset grows past roughly six options or starts encoding app policy
  (routes, security posture, deployment topology) rather than orchestration.
- The browser bundle cost of `@ndigo/boot` proves material in the app bundle
  guards.
- A third platform needs the same refresh → wire → start → shutdown sequence,
  which would justify a shared launcher abstraction rather than two presets.
- `HTTPServer` or `WebAutoConfiguration` gains auto-start semantics, which
  would invalidate the entrypoint split.
