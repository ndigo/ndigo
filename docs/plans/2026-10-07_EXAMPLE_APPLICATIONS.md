# Example Applications — Portfolio Reorganization and New App Plan

**Status:** Draft (proposed 2026-10-07) — **executed 2026-10-07**: W0–W4
landed (apps `08`–`19`, smoke gate, port registry); execution record and
findings in §11.
**Scope:** `apps/` (7 apps), the README/guide/CI/tooling surfaces that reference
them, and a proposed portfolio of new example applications.
**Decision requested:** (a) numbering scheme and reading order, (b) target app
portfolio and delivery waves, (c) the W0 rename sweep mechanics below.

---

## 1. Summary

1. **Number the directories** — `apps/01-blue-hello`, `apps/02-blue-hello-node`,
   … — matching the progression already published in
   [`apps/README.md`](../../apps/README.md). Numbers are reading order only;
   package names (nx project identity) stay unnumbered and stable.
2. **Keep the existing seven apps and their relative order**; append new apps at
   `08+`. Order changes are free during the W0 sweep, but the current
   simple→complex progression is already correct and reordering adds review
   noise for no teaching gain.
3. **Grow the portfolio along the framework's uncovered seams**, not one app per
   package: conformance probes (httpbin, Todo-Backend, RealWorld/Conduit),
   verticals (Conduit web, PetClinic), realtime (chat, kanban), distributed
   (resilience lab, Redis fan-out), operations (telemetry lab, auth playground),
   and a performance/offline client (HN reader).
4. **Borrow canonical, externally-oracled apps from the internet** — every
   proposed conformance app has a third-party spec or suite to run against it
   (§5), which is where app-level testing finds defects unit tests cannot
   (the 2026-10-07 review already found real defects through app bundles).
5. **Make running trivial and rot visible**: a documented port registry, a
   one-command `scripts/apps-smoke.mjs` boot-and-probe gate for every Node app,
   and a per-app checklist (README standard, tests, manifest conformance) that
   `pnpm manifest:check` and CI already partially enforce.
6. Delete nothing and rename no package in W0; historical docs (audits, plans,
   ADRs, migrations, CHANGELOG entries) keep the old paths by policy.

---

## 2. What exists today

Evidence: [`apps/README.md`](../../apps/README.md), per-app READMEs and
`package.json` files, `apps/*/vite.config.ts`, app entry points.

| # (published) | Directory         | Package name       | Runtime             | Port (default)             | Run          | Demonstrates                                                                                                                       |
| ------------- | ----------------- | ------------------ | ------------------- | -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1             | `blue-hello`      | `@blue/hello`      | Browser (Vite)      | 3001                       | `pnpm dev`   | Context + route + Web Component view                                                                                               |
| 2             | `blue-hello-node` | `@blue/hello-node` | Node (tsx)          | 3000, `PORT` override      | `pnpm start` | `ApplicationBuilder` + `NodeAutoConfiguration` + one `@getMapping`                                                                 |
| 3             | `blue-todo`       | `@blue/todo`       | Browser (Vite)      | 3000 dev, 4173 preview/e2e | `pnpm dev`   | TodoMVC + micro frontend shell, signals, auth guards, telemetry                                                                    |
| 4             | `blue-api`        | `@blue/api`        | Node (tsx)          | 3000, `PORT` override      | `pnpm start` | Controllers, session auth, ORM/Drizzle, negotiation, management, i18n, config, upload, cache, scheduler, sockets, OpenAPI, inspect |
| 5             | `blue-host`       | `@blue/host-demo`  | Browser (Vite)      | 3100                       | `pnpm dev`   | `HostManager`, lazy feature chunks, shared-dependency validation                                                                   |
| 6             | `blue-island`     | `blue-island`      | Node + built client | 3200 (`PORT`), 3280 e2e    | `pnpm dev`   | EJS shell, island hydration, SSE → signals, Web Awesome form (AD-71)                                                               |
| 7             | `blue-views`      | `blue-views`       | Browser (Vite)      | 3005                       | `pnpm dev`   | View-resolver composite, i18n, HTTP cache + offline queue                                                                          |

Observations:

- **Ports collide**: `blue-todo` dev (3000), `blue-hello-node` (3000) and
  `blue-api` (3000) cannot all run at once with defaults.
- **Package names are inconsistent** (two unscoped: `blue-island`,
  `blue-views`; one suffixed to avoid the `@blue/host` package collision:
  `@blue/host-demo`), and two are load-bearing in tooling:
  root `test:e2e` is `nx run @blue/todo:test:e2e` and CI filters
  `--filter blue-island test:e2e`.
- **App tests already run in CI** (`nx run-many -t test` includes apps; each
  browser app's `test` script builds its bundle first). What is missing is a
  **boot-and-probe** lane for the Node apps (real socket, static files,
  graceful shutdown).
- Tooling recognizes apps explicitly: `scripts/check-manifests.mjs`
  (app dependency-closure rules) and the header generator's `inferModule`
  (`packages/blue-generators/src/generators/header/generator.ts:68-79`), which
  takes the raw app directory name as the `@module` value.

---

## 3. Recommended reorganization

### 3.1 Naming scheme

- Directory: `apps/NN-blue-<slug>` — two-digit zero-padded reading order.
  `NN` is documentation-only (reading order); it never appears in a package
  name, import specifier, or nx target.
- Package name: `@blue/<slug>`, stable across future renumbering. Rename the two
  unscoped names as part of the same sweep for consistency:
  `blue-island` → `@blue/island`, `blue-views` → `@blue/views`. Keep
  `@blue/host-demo` (the `@blue/host` package name is taken).
- `@module` headers and logger names keep the logical app name without the
  number (`blue-api`), matching the existing sources; fix
  `inferModule` to strip a leading `NN-` so generated headers stay correct.

### 3.2 Target tree (existing apps; new apps per §5)

```text
apps/
  01-blue-hello/
  02-blue-hello-node/
  03-blue-todo/
  04-blue-api/
  05-blue-host/
  06-blue-island/
  07-blue-views/
  08-blue-httpbin/          §5.1
  09-blue-todobackend/      §5.1
  10-blue-conduit-api/      §5.1
  11-blue-conduit-web/      §5.2
  12-blue-petclinic/        §5.2
  13-blue-chat/             §5.3
  14-blue-kanban/           §5.3
  15-blue-resilience-lab/   §5.3
  16-blue-redis-fanout/     §5.3
  17-blue-telemetry-lab/    §5.4
  18-blue-auth-playground/  §5.4
  19-blue-hn/               §5.4
```

### 3.3 W0 rename mechanics (impact list)

Mechanical sweep, one PR, no behavior change:

| Surface                                                                                                | Action                                                                                                                      |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/blue-*` dirs                                                                                     | `git mv` to `NN-blue-<slug>` (§3.2)                                                                                         |
| `apps/README.md`                                                                                       | rewrite as the numbered ladder + feature-coverage matrix + port registry                                                    |
| `README.md` (root apps table)                                                                          | update links/paths                                                                                                          |
| Each app `README.md`                                                                                   | `cd apps/<new-dir>` run lines                                                                                               |
| `packages/blue-generators/src/generators/header/generator.ts` (`inferModule`)                          | strip `^\d\d-`; update its spec                                                                                             |
| `.github/workflows/ci.yml`                                                                             | artifact paths (`apps/blue-todo/playwright-report`, `apps/blue-island/...`), `--filter blue-island` if package rename lands |
| root `package.json`                                                                                    | `test:e2e` filter if a package name changes; add `apps:smoke`                                                               |
| `.oxlintrc.json:18`                                                                                    | ignore path `apps/blue-todo/index.js`                                                                                       |
| `.vscode/launch.json`                                                                                  | `apps/blue-todo/index.html`                                                                                                 |
| `docs/guides/*`                                                                                        | references in guides 01, 04, 05, 06, 07, 08, 13, 14, 15, 17, 18, 19, 21                                                     |
| `docs/architecture/micro-frontends.md`                                                                 | demo-host paths (lines 4, 133–134)                                                                                          |
| `apps/blue-api/src/inspect.ts`                                                                         | comment referencing `apps/blue-todo`                                                                                        |
| `graft/`                                                                                               | regenerate (`pnpm graft:build`) after the sweep                                                                             |
| Historical docs (`docs/audits/`, `docs/plans/`, `docs/decisions/`, `docs/migrations/`, `CHANGELOG.md`) | **do not touch** — dated snapshots keep old paths                                                                           |

Verification for W0: `pnpm docs:links`, `pnpm format:check`, `pnpm lint`,
`pnpm typecheck`, `pnpm manifest:check`, `pnpm test`, plus `graft check`.

### 3.4 What not to change

- No package name gets a number; no app is published; `apps/*` workspace glob and
  nx inference keep working (`nx.json` has no explicit project list).
- No reordering of the existing seven (an alternative order that moves
  `blue-views` earlier is equivalent in cost — decide in review, not per app).

---

## 4. Feature coverage audit

“Covered” = a runnable flow in an app; “thin” = one endpoint or headless test
only; “absent” = no app exercises it.

| Feature area (package)                                                   | Coverage today                                                 | Candidate app               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------- |
| Context/DI/boot, profiles, typed config, secrets, config server, refresh | Covered (`blue-api`)                                           | —                           |
| Dispatcher binding, validation (Zod), DTOs, problem+json, negotiation    | Covered (`blue-api`, `blue-views`)                             | `08`, `12`                  |
| ORM + Drizzle, persistence                                               | Covered (`blue-api`)                                           | `10`, `12`, `14`            |
| Auth: sessions/cookies/roles                                             | Covered (`blue-api`, `blue-todo`)                              | —                           |
| Auth: JWT (`auth-server`)                                                | **Absent**                                                     | `10`, `18`                  |
| Auth: OIDC/PKCE (`auth-client`)                                          | **Absent**                                                     | `18`                        |
| Sessions: durable LibSQL store                                           | **Absent** in apps                                             | `18`                        |
| Static files (ETag/Range/precompressed/SPA)                              | Thin (`blue-api` `/static/`)                                   | `08`, `12`                  |
| Multipart upload                                                         | Thin (one endpoint)                                            | `08`                        |
| Rate limiting, trusted proxy                                             | **Absent**                                                     | `08`, `18`                  |
| Caching (`@cached`, `memoize`), HTTP cache/offline                       | Thin (`blue-api`, `blue-views`)                                | `09`, `19`                  |
| Scheduler                                                                | Thin (heartbeat counter)                                       | `12`, `15`                  |
| Resilience (`@retry`, `@circuitBreaker`, `@blue/proxy`)                  | **Absent** in apps                                             | `15`                        |
| Redis: shared cache + pub/sub fan-out                                    | **Absent**                                                     | `16`                        |
| Sockets/STOMP + session registry                                         | Thin (headless, clients in tests)                              | `13`, `14`                  |
| SSE / islands / signals                                                  | Covered (`blue-island`, `blue-todo`)                           | —                           |
| Telemetry (OTel browser+node, sampling, exporters, correlation)          | Thin (`blue-api` metrics, browser console exporter)            | `17`                        |
| Micro frontends (`@blue/host`), routing partitions                       | Covered (`blue-todo`, `blue-host`)                             | `14`                        |
| i18n/content                                                             | Covered (`blue-api`, `blue-island`, `blue-views`, `blue-todo`) | `12`                        |
| OpenAPI/Swagger, management (`/health`, `/metrics`)                      | Covered (`blue-api`)                                           | reuse everywhere            |
| `@blue/inspect` manifests                                                | Thin (blue-api script)                                         | optional matrix script (§6) |
| `@blue/test` harness                                                     | Used by app tests                                              | guide 19 examples           |
| Benchmarks (Speedometer-style)                                           | Out-of-repo harness (`scripts/benchmark-dom.ts`)               | `19`/`20` (optional)        |

---

## 5. New applications

Each app must ship: the §7 checklist (one-command run, README, tests),
zero _required_ external infrastructure, and a stated defect hypothesis.

### 5.1 Conformance probes (external specs = independent oracles)

#### 08 `08-blue-httpbin` — HTTP semantics playground (Node, P1, M)

- **Borrowed from:** [httpbin](https://httpbin.org/) /
  [postmanlabs/httpbin](https://github.com/postmanlabs/httpbin) — the canonical
  “echo what you sent” service every HTTP client author tests against.
- **Exercises:** dispatcher parameter binding across every source
  (query/path/header/cookie/body/form/multipart), matrix params, media-type and
  `Accept` negotiation, redirects and status codes, `ResponseEntity` headers,
  static files (ETag/Range/precompressed), gzip/deflate negotiation, delays via
  `@scheduled`-style async handlers, rate limiting + trusted-proxy client IP,
  problem+json error envelopes, OpenAPI coverage of every probe.
- **Run:** `pnpm start` (port 3020). **Tests:** `@blue/test` specs +
  documented curl table in the README.
- **Defect hypothesis:** HEAD/304/405/406/415 edge semantics, charset and
  raw-vs-decoded path handling, cookie round-trips, multipart thresholds,
  streaming and content-length correctness.

#### 09 `09-blue-todobackend` — Todo-Backend REST spec (Node, P1, S)

- **Borrowed from:** [Todo-Backend](https://www.todobackend.com/) — a five-
  operation JSON API with a public spec runner and test client.
- **Exercises:** minimal REST CRUD, JSON media types, CORS/OPTIONS preflight,
  HEAD, 404/405 semantics, ORM-backed store (memory + file), static hosting of
  the spec client.
- **Run:** `pnpm start` (port 3030). **Tests:** repo-local Vitest spec checklist;
  `pnpm test:conformance` drives the public runner (local/dev lane — CI stays
  offline; the runner URL is pinned in the README).
- **Defect hypothesis:** status/header exactness for PATCH/PUT, `order` field
  semantics, CORS compliance, content-type strictness.

#### 10 `10-blue-conduit-api` — RealWorld “Conduit” API (Node, P1, L)

- **Borrowed from:** [gothinkster/realworld](https://github.com/gothinkster/realworld)
  — the reference full-stack demo with a machine-readable
  `api/openapi.yml` and the official Postman/Newman collection
  ([realworld-e2e-tests](https://github.com/gothinkster/realworld-e2e-tests)).
- **Exercises:** JWT auth (`@blue/auth-server`), users/articles/comments/tags
  CRUD, pagination and filtering (tag/author/favorited), follows/favorites,
  DTO conversion, spec-exact 422 error envelope, OpenAPI served and diffed
  against the spec, rate-limited login, ORM (memory + durable file),
  management endpoints.
- **Run:** `pnpm start` (port 3040). **Tests:** vendor the official collection
  under `conformance/` (with provenance) and run it with pinned Newman —
  PR lane if runtime is acceptable, else a documented conformance command;
  repo-local Vitest covers the same checklist offline.
- **Defect hypothesis:** exact status/error shapes, JWT expiry/refresh,
  pagination math, favorite idempotency, tag ordering, authz on write paths.

### 5.2 Verticals (teach a complete app, in the style of the canon)

#### 11 `11-blue-conduit-web` — RealWorld frontend (Browser, P1, L)

- **Borrowed from:** the RealWorld frontend spec (same project as `10`).
- **Exercises:** router feature/partition routing, auth guards + token storage,
  forms with validation-error mapping, pagination/feed tabs, optimistic
  favorite/follow with rollback, markdown rendering (XSS surface), i18n,
  signals, HTTP interceptors, browser→server trace propagation, Playwright e2e
  of the canonical routes (`/login`, `/editor`, `/article/:slug`, `/profile/:username`).
- **Run:** `pnpm dev` (port 3400) against `10` (or the public demo API via
  `VITE_API_BASE`). **Tests:** unit + e2e.
- **Defect hypothesis:** 401→login navigation, stale auth state, optimistic
  rollback, markdown sanitization, deep-link refresh.

#### 12 `12-blue-petclinic` — server-rendered CRUD vertical (Node + EJS, P1, M)

- **Borrowed from:** [spring-projects/spring-petclinic](https://github.com/spring-projects/spring-petclinic)
  — the reference app of BlueJS's Spring heritage (owners/pets/vets, forms,
  validation, i18n, actuator).
- **Exercises:** EJS views, form binding round-trip (`dataBinderValue`),
  validation re-render preserving input, i18n validation messages, content
  negotiation (HTML + JSON), ORM + Drizzle, static assets, pagination,
  management, OpenAPI, `@scheduled` cache warm-up.
- **Run:** `pnpm start` (port 3050). **Tests:** e2e Playwright form flows +
  in-process specs.
- **Defect hypothesis:** binding round-trip fidelity, error rendering, EJS
  escaping, negotiated representations, 404 flows.

### 5.3 Realtime and distributed

#### 13 `13-blue-chat` — STOMP chat with third-party-client interop (Hybrid, P1, M)

- **Exercises:** `@socketMapping`, session registry rooms/presence/heartbeat,
  `/user/*` destinations, durable message store (history), auth-gated upgrade
  and mid-session token expiry, reconnect + resubscribe, typing indicators,
  telemetry on socket paths. UI on top of the headless `blue-api` chat demo.
- **Oracle:** run a real third-party client (`@stomp/stompjs` as a dev
  dependency) against the broker in an interop spec — connect, subscribe,
  receipts, ack/nack, heartbeats.
- **Run:** `pnpm dev` (browser 3410) + `pnpm start` (server 3060), or one server
  serving the built client. **Defect hypothesis:** frame compliance vs an
  external client, receipt ordering, subscription cleanup, backpressure.

#### 14 `14-blue-kanban` — collaborative board (Hybrid, P2, M)

- **Exercises:** signals + optimistic drag-and-drop, ORM transactions,
  concurrency (version columns), WebSocket broadcast with SSE fallback, offline
  queue replay, feature routing partitions, feature metrics.
- **Run:** `pnpm dev` (browser 3420) + `pnpm start` (server 3070).
- **Defect hypothesis:** concurrent edit conflicts, transaction overlap,
  local-echo/broadcast duplication, reconnect reconciliation.

#### 15 `15-blue-resilience-lab` — retry & circuit breaker lab (Node, P1, S)

- **Exercises:** `@blue/service` typed clients, `@blue/proxy` interception,
  `@blue/resilience` `@retry`/`@circuitBreaker` + backoffs, timeouts, health
  indicators for breaker state, metrics counters, control plane under OpenAPI.
  One process exposing a controllable flaky upstream and a resilient consumer
  (latency/error/flap modes).
- **Run:** `pnpm start` (port 3080). **Defect hypothesis:** retry idempotency
  and timing, breaker half-open transitions under concurrency, error
  classification, double-retry between HTTP interceptor and method policy.

#### 16 `16-blue-redis-fanout` — multi-node cache + socket fan-out (Node, P2, M)

- **Exercises:** `@blue/redis` shared cache and cross-node pub/sub socket
  fan-out in the same binary run twice (two ports), `BLUE_REDIS_URL` gating,
  single-node fallback without Redis, shutdown ordering, backend health in
  `/health`. README documents a one-line `docker run redis`.
- **Run:** `pnpm start` twice + Redis (optional). **Defect hypothesis:**
  pub/sub reconnect, duplicate suppression, cache namespace collisions,
  ordering across nodes.

### 5.4 Operations, identity, performance

#### 17 `17-blue-telemetry-lab` — end-to-end observability reference (Hybrid, P1, S)

- **Exercises:** browser action → server span → scheduled task → socket push;
  `@blue/telemetry` spans/counters/logs, `-web`/`-node` wiring, sampling,
  exporter env config with console fallback, trace propagation across
  HTTP/WS/SSE, log↔trace correlation, `/metrics`. Optional local OTLP collector
  documented (`otel/opentelemetry-collector` container).
- **Run:** `pnpm dev` (browser 3430) + `pnpm start` (port 3090).
- **Defect hypothesis:** context propagation gaps across transports and the
  scheduler, flush-on-shutdown, span leakage, metric aggregation.

#### 18 `18-blue-auth-playground` — auth matrix (Hybrid, P1, M)

- **Exercises:** credentials + cookies (HttpOnly/SameSite/Secure), opaque
  tokens, JWT (`@blue/auth-server`), OIDC authorization-code + PKCE
  (`@blue/auth-client`) against an embedded local provider (dev dependency) or a
  documented Keycloak container, roles/permissions matrix UI, durable LibSQL
  sessions, login rate limiting, refresh/logout, `@authenticated`/`@authorized`
  on HTTP and socket surfaces.
- **Run:** `pnpm dev` (browser 3440) + `pnpm start` (port 3110).
  **Defect hypothesis:** cookie flags, CSRF, session fixation,
  expiry/refresh races, PKCE verifier handling, role enforcement parity.

#### 19 `19-blue-hn` — Hacker News reader (Browser, P2, M)

- **Borrowed from:** [hnpwa.com](https://hnpwa.com/) (archived 2020; treated as
  inspiration, not a current spec) against the official
  [Hacker News API](https://github.com/HackerNews/API).
- **Exercises:** HTTP client cache/offline/replay, router deep links, list
  virtualization, streaming/skeletons, route-level code splitting, browser
  telemetry, a documented Lighthouse budget for the perf story.
- **Run:** `pnpm dev` (port 3450). **Defect hypothesis:** cache staleness,
  offline replay, long-list rendering, route transition state.

#### Optional 20 — performance host (script, not necessarily an app)

The Speedometer-style harness already exists (`scripts/benchmark-dom.ts`,
`scripts/benchmark-preview.mjs`, root `test:benchmark*`) and builds the
out-of-tree `../todomvc/examples/*`. Recommendation: promote the harness into a
first-class documented workflow (one command, published numbers) instead of a
new app; revisit only if the TodoMVC spec suite lands as its own app.

---

## 6. Local-run ergonomics

- **Port registry** (documented in `apps/README.md`; `PORT` env override for all
  Node apps, `--port` for Vite):
    - Node apps: 3000 `blue-api`, 3010 `blue-hello-node` (change from 3000),
      3020 httpbin, 3030 todobackend, 3040 conduit-api, 3050 petclinic,
      3060 chat, 3070 kanban, 3080 resilience-lab, 3090 telemetry-lab,
      3110 auth-playground, 3200 island; e2e lanes use 328x.
    - Browser apps: 3100 host, 3001 hello, 3005 views, 3003 todo (change from
      3000), 3400+ new ones.
- **`scripts/apps-smoke.mjs` (new, root `pnpm apps:smoke`)**: for each Node app,
  spawn its `start` script on the registry port, poll the documented probe route
  (`/` or `/health`), assert status, send SIGTERM, assert clean exit. This is
  the rot detector for real-process concerns (socket bind, static files,
  graceful shutdown) that in-process tests miss. Add it to the CI quality lane.
- **`pnpm app <NN|name>` (optional sugar)**: resolve the numbered directory and
  run its `dev`/`start`. Nice-to-have; the `cd apps/<dir> && pnpm …` lines stay
  the canonical documented path.
- **Zero-infrastructure doctrine**: default dev/test runs use memory or file
  backends. Redis, OTLP collectors, and external identity providers are optional
  and env-gated, each documented with a one-line Docker command.

---

## 7. Definition of done for every new app

1. Directory `apps/NN-blue-<slug>`, package `@blue/<slug>`, `private: true`,
   ISC license, `@module blue-<slug>` doc headers (the lint rule requires them).
2. One documented command to run locally (`pnpm dev` or `pnpm start`), port from
   the registry, endpoints listed in the README.
3. `pnpm test` = build (browser) + `@blue/test` in-process specs; e2e only for
   UI-heavy apps; every app passes `pnpm manifest:check` (dependency closure) and
   `pnpm typecheck`.
4. README on the app template: Run / Endpoints / Demonstrates / Feature map /
   Tests / See also.
5. Entry in `apps/README.md` (ladder + matrix), root `README.md` table, and a
   `smoke` entry; at least one guide or ADR cites it as its runnable reference.
6. No new required external service.

---

## 8. Delivery waves

| Wave                            | Content                                               | Exit criteria                                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **W0** — reorganize             | §3 sweep, port registry, `apps-smoke`, README rebuild | All gates green (`docs:links`, `format:check`, `lint`, `typecheck`, `manifest:check`, `test`, `apps:smoke`); no behavior change                                          |
| **W1** — conformance probes     | `08`, `09`, `10`                                      | Each app boots, passes its repo-local suite, and has a documented external-spec command; at minimum one external suite executed end-to-end once and its findings triaged |
| **W2** — verticals              | `11`, `12`                                            | Conduit web drives the local API per the spec route list; PetClinic e2e covers create/validate/edit flows                                                                |
| **W3** — realtime & distributed | `13`, `14`, `15`, `16`                                | stompjs interop spec green; Redis lane green in CI (env-gated like `@blue/redis` tests); smoke covers all four                                                           |
| **W4** — ops, identity, perf    | `17`, `18`, `19`                                      | Trace propagation spec green across HTTP/WS/SSE/scheduler; auth matrix e2e green per mode; Lighthouse budget documented                                                  |

Sequencing rationale: W1 is cheap and highest defect yield (external oracles);
W2 proves teaching value; W3 exercises the newest, least-app-tested packages
(sockets, resilience, Redis); W4 is the polish/operations tier.

---

## 9. Risks and non-goals

- **Rename churn**: mitigated by the §3.3 sweep list, `docs:links` gate, and
  leaving historical docs untouched. Any missed reference fails a gate, not
  silently.
- **Numbering churn on insertion**: numbers are append-only; renumbering is a
  dedicated, mechanical PR repeating the §3.3 sweep — never a side effect of
  adding an app.
- **CI time growth**: apps run their own tests already; add probes with nx
  caching, keep e2e to UI-heavy apps, and run external conformance suites once
  per relevant change or nightly, not per-commit everywhere.
- **Defect discovery spills into framework work**: expected and desired; route
  findings through the existing review/plan process (`docs/plans/`), do not
  patch frameworks from inside an example app.
- **Non-goals**: an app per package; publishing apps; ports of huge demos
  (OTel Astronomy Shop, streaming-service clones) without a spec to verify
  against; GraphQL/CMS/game demos with no canonical oracle.

---

## 10. References

- [gothinkster/realworld](https://github.com/gothinkster/realworld) — RealWorld
  API spec (`api/openapi.yml`) and e2e tests
- [Todo-Backend](https://www.todobackend.com/) — spec + public test runner
- [postmanlabs/httpbin](https://github.com/postmanlabs/httpbin) — HTTP
  request/response service
- [spring-projects/spring-petclinic](https://github.com/spring-projects/spring-petclinic)
  — the reference vertical app of the Spring ecosystem
- [TodoMVC](https://todomvc.com/) — app specification and per-framework suites
- [HNPWA](https://hnpwa.com/) (archived) and the
  [Hacker News API](https://github.com/HackerNews/API)
- [Speedometer 3](https://browserbench.org/Speedometer3.0/) — browser
  performance benchmark pattern
- [STOMP 1.2](https://stomp.github.io/stomp-specification-1.2.html) — broker
  protocol; interop via `@stomp/stompjs`
- Related repo docs: [`apps/README.md`](../../apps/README.md),
  [guide 01](../guides/01-building-a-node-api.md),
  [guide 12](../guides/12-package-documentation.md),
  [docs/README.md](../README.md),
  [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 11. Execution record and findings (2026-10-07)

**W0 (reorganization) landed:** directories renamed to `NN-blue-<slug>`, the
lockfile importer keys, CI artifact paths and filters, `.oxlintrc.json`,
`.vscode/launch.json`, guide/architecture/package-README links, and
`inferModule` are updated; package names stay unnumbered (except the two
unscoped apps, now `@blue/island` and `@blue/views`); `apps/README.md` carries
the ladder, the per-app index and the port registry; `pnpm apps:smoke` and its
CI step exist.

**W1–W4 landed (13 apps, `08`–`19`):** every planned app is implemented, tested
and boot-smoke covered. Test counts as verified by the parent (fresh runs):
`08` 23, `09` 46, `10` 29, `11` 105, `12` 41, `13` 15, `14` 28, `15` 13,
`16` 14 (10 always-on + 4 Redis-gated), `17` 21, `18` 70, `19` 24 — plus the
`02` WebSocket regression (3). Live lanes spot-verified by the parent where the
dependency was local: Redis fan-out against a disposable `redis:7-alpine`
container (4/4), and the boot-smoke gate against all 13 Node apps.

### Defects found by the exercise

Framework/tooling findings, verified at source and left for the review process
(§9: no framework patches from inside an example app):

1. **`HTTPServer` ignores an app's documented default port unless it is seeded
   into `process.env`** — `options.port ?? readIntEnv(process.env, 'PORT') ??
   3000` (`packages/blue-platform-node/src/http-server.ts:175`). Three apps
   (`02`, `08`, `13`) computed a default for logging only and therefore bound
   3000 while claiming another port; found by the `14` agent mirroring `13`.
   Fixed in the apps with `process.env['PORT'] ??= '<default>'` (the pattern
   six other apps already used); a framework-level `server.port` property
   source would remove the trap.
   Fixed 2026-10-22 (`node-auto-configuration.ts`): `httpServer()` now resolves
   the port as `process.env.PORT ?? server.port config ?? 3000`, so a documented
   `server.port` in an app's application.json is honored. The constructor takes
   `(null, { port })`; the dispatcher stays null and is resolved from context at
   start. Regression: node-auto-configuration.spec.ts (all three precedence cases).
2. **`ResponseEntityView` drops `ResponseEntity.headers` for status ≥ 400** —
   the problem+json branch returns only `Content-Type`
   (`packages/blue-platform-node/src/response-entity-view.ts:25-31`), so a
   handler-level 401 cannot carry `WWW-Authenticate` (or any 4xx header).
   Worked around in `08` via the `NODE_RESPONSE_ATTRIBUTE` sink.
   Fixed 2026-10-22 (`response-entity-view.ts`): the ≥400 branch now spreads
   `entity.headers`, so handler-set headers (e.g. `WWW-Authenticate`) survive;
   regression in `node-view-target.spec.ts`.
3. **`CORSInterceptor` exists but is registered nowhere** —
   `packages/blue-platform-node/src/cors-interceptor.ts` is not referenced by
   `node-auto-configuration.ts`, so a cross-origin browser client is blocked
   with no configuration knob; `09` (and `10`) splice it in app-side through
   `HANDLER_MAPPING.interceptors`. A `blue.cors`-bound auto-registered
   interceptor is the obvious framework fix.
   Fixed 2026-10-22 (`node-auto-configuration.ts`): `handlerMapping()` now
   pushes a `CORSInterceptor(this.corsOptions())`. `corsOptions()` reads the
   `cors.*` environment namespace, fail-closed (empty `allowedOrigins` blocks
   every origin until an app sets `cors.allowedOrigins`), so the interceptor is
   always registered but inert unless configured. Regression in
   node-auto-configuration.spec.ts.
4. **`AuthRouteGuard` is single-scheme** —
   `packages/blue-auth-server/src/route-guard.ts` binds one adapter id + one
   token extractor, so a route accepting both a session cookie and a Bearer
   token cannot use it; `18` ships an app-owned `AuthMatrixGuard` over
   `validateAny`.
5. **`scripts/import-scanner.mjs:18` skips any directory named `lib`**, so
   imports under an app's `src/lib/` are invisible to `pnpm manifest:check`
   and surface as false "dead dependency" failures (hit by `19`, renamed to
   `src/api/`).
6. **Socket-handler DX:** a `@socketMapping` handler that forgets
   `@parameters({ session: socketSessionValue('session') })` runs with
   `undefined` and the peer sees only a 1011 close — diagnosed from a 1011
   with no server-side error line. Fixed in `02` and locked with
   `apps/02-blue-hello-node/test/hello-socket.spec.ts`.

App-level bugs the real-run verification caught and fixed in place:

- `19`: an offline comment tree with one uncached child held the whole item
  route open forever — fixed with an explicit `whenOffline: 'fail' | 'queue'`
  split (fail fast on hydrate, queue background revalidation).
- `14`: the add-card composer was never appended to the DOM, and typing
  committed half-typed titles because `render()` ran inside the render effect
  (draft signals became dependencies) — both fixed.
- `02`: the pre-existing `/echo` handler above.

### Verification

- `pnpm apps:smoke` — 13/13 apps boot, answer their documented probe, release
  the port on SIGTERM.
- `pnpm install --frozen-lockfile` clean (65 workspace projects);
  `pnpm manifest:check`, `pnpm docs:links`, `pnpm format:check` green.
- Full `pnpm test` (nx, all packages + apps), `pnpm typecheck`, `pnpm lint` —
  see the repository state at the commit that lands this record.

## 12. Practice audit of the older apps (2026-10-07 follow-up)

Three read-only audits of apps `01`–`07` against the guides and decision
records, plus a repo-wide sweep for the logging pattern.

**Logging (all apps).** Every app imported `getLogger` from `@blue/telemetry`.
AD-67 (D-2) and the telemetry README point consumers at the `@blue/log` leaf;
`@blue/telemetry` re-exports the surface only for compatibility. All apps now
import `@blue/log`, and the twelve apps that only logged dropped their
`@blue/telemetry` dependency entirely. Guide 01's "putting it together" snippet
was teaching the old import (and a raw `process.env` read, and a string
`getValue('httpServer')` lookup) — replaced with the real
`apps/02-blue-hello-node/src/index.ts`.

**`03-blue-todo` — browser bootstrap (real defect, fixed).** The app booted
`ApplicationBuilder`, which reads `process.env.BLUE_PROFILES_ACTIVE` in
`_configureProfiles` (`packages/blue-boot/src/application.ts`). Rollup/rolldown
compiles `process.env.*` away in the production build (so the e2e lane stayed
green), but Vite **dev** serves the unresolved read — verified by loading
`pnpm dev` in a real browser: the module graph crashed on
`@blue/auth-core`'s `node:crypto` import and nothing rendered. The app now
boots `MetadataConfigApplicationContext` + `register` + `refresh`, the pattern
apps `01`, `07` and `19` already used; the Node-shaped boot machinery leaves
the client bundle (**1,231.9 kB → 1,133.9 kB, −98 kB**), the app renders in dev
with zero console errors, and all 61 tests + the Playwright lane stay green.

**Framework defect found by that verification (fixed).** `@blue/auth-core`'s
root exported `scrypt-password-encoder` (module-level `node:crypto`) and
`@blue/auth-client` re-exported the whole root, so _any_ browser app importing
the auth client dragged a Node built-in into the graph — fatal in `vite dev`.
The encoder now lives on the `@blue/auth-core/scrypt` subpath; the root stays
isomorphic. Consumers updated: `04`, `10`, `18`, the auth-server and
orm-drizzle specs, guides 11 and 16, and the auth-core README.

**Smaller findings, resolved.** `01-blue-hello`'s smoke spec hand-rolled the
context boot and a bespoke capture target (with an incorrect justification);
it now uses `bootBrowserApp` + `BrowserMockClient`. `03`'s route-registry
comment described removed `@blue/boot` auto-registration and was rewritten.

**Findings deliberately not actioned.** `03` declares runtime packages in both
`dependencies` and `devDependencies` — that is the existing house style across
the apps (the manifest gate accepts either), so it stays. `05-blue-host`
writes feature values into the DOM by hand; that is the minimal host demo's
chosen surface (its features are plain context providers with no view
pipeline), not missed plumbing.

_Naming convention: `YYYY-MM-DD_DESCRIPTION.md`_
