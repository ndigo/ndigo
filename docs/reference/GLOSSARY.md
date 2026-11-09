# Glossary

The vocabulary used across the guides, API reference, and ADRs. Each entry is
one or two sentences; follow the guide link for the full treatment.

## Foundations

- **Application context** — The named dependency container that owns beans,
  configuration, lifecycle, and child contexts. See [guide 04](../guides/04-dependency-injection-and-lifecycle.md).
- **Bean** — Any value the context owns under a name or `ContextToken`.
- **Configuration class** — A class marked `@configuration` that contributes
  entries and property bindings.
- **Entry** — An `@entry` method whose return value becomes a bean.
- **Factory** — The IoC container implementation behind a context; resolves
  constructors, instances, scopes, and aware callbacks.
- **Scope** — How long a bean lives: singleton, prototype, hash/route,
  refresh, or a custom scope.
- **Aware callback** — An interface that receives a framework object (context,
  name, factory) after construction.
- **Lifecycle** — The init/start/stop/destroy/close contracts the context runs
  on refresh and shutdown.
- **Smart lifecycle** — A `Lifecycle` with a phase and auto-start flag; starts
  ascending, stops descending.
- **Application event** — A context-local notification (`emit`), broadcast to
  descendants, or bubbled to ancestors.
- **Event gateway** — An allowlisted relay that carries selected events between
  a feature context and its shell.

## Request handling

- **Route** — The platform-neutral request value: path, method, params, query,
  matrix data, headers/cookies/body, attributes.
- **Handler mapping** — The table that maps a route to a handler method.
- **Handler method** — A controller method plus its parameter metadata.
- **Dispatcher** — Resolves a route to a handler, invokes it, and renders the
  result.
- **Argument resolver** — Turns a `MethodParameter` declaration into a method
  argument.
- **Parameter extractor** — The `@parameters` declaration (`queryValue`,
  `pathVariable`, `dataBinderValue`, …).
- **Route condition** — A query, matrix, method, or access constraint that
  narrows a mapping.
- **Radix tree** — The path index used by the Node dispatcher; it also produces
  404 vs 405 behavior.
- **Interceptor** — A pre/post/completion hook around handler execution.
- **Problem details** — The RFC 9457 `application/problem+json` error document.

## Views and the browser

- **View** — The contract that renders a model to a response.
- **Producer view** — A view whose body is streamed/async (SSE, downloads).
- **ModelAndView** — A view name or instance plus model data returned by a
  handler.
- **View resolver** — Maps a logical view name to a view.
- **View target** — The platform rendering destination (HTTP response or DOM
  element).
- **Content negotiation** — Choosing a representation from path extension or
  `Accept`.
- **EJS view** — A server-side template view technology.
- **Web Component view** — A browser view backed by a custom element.
- **Island** — A server-rendered Web Component hydrated with a serialized model.
- **Signals** — Local reactive state (`signal`, `computed`, `effect`).
- **Micro frontend / hosted feature** — A child application context mounted
  into a shell under a route prefix.
- **Partition** — A route prefix owned by a feature; the feature receives the
  stripped route.

## Data and async

- **Entity** — A decorator-described persistence model.
- **Repository** — The persistence port for an entity.
- **Unit of work** — The transaction boundary that tracks entity changes.
- **Migration** — A versioned schema change with a committed snapshot.
- **Job** — Durable background work claimed by a driver with a lease.
- **Outbox** — The table that commits side effects with the data transaction.
- **Scheduler** — The clock/cron runner for `@scheduled` tasks.
- **Lock lease** — A time-bounded lock with a fencing token; the basis of
  single-executor work.
- **Cluster slot** — One supervised worker process in a replicated app.
- **SSE** — Server-Sent Events, a one-way stream over HTTP.

## Security

- **Principal** — The authenticated identity, with roles.
- **Session** — A server-owned opaque credential stored in a cookie.
- **JWT** — A signed token with expiry and a revocation version.
- **CSRF** — Cross-site request forgery; defended with a double-submit cookie.
- **CORS** — The browser cross-origin policy; fail-closed by default.
- **Trusted proxy** — A network hop whose forwarded client address is trusted.
- **Rate limit** — A fixed-window request budget, keyed by client address.
- **Feature flag** — A runtime, refreshable switch evaluated by `FlagEvaluator`.

## Tooling

- **Inspection manifest** — The deterministic JSON of routes, mappings, and
  declared config keys produced by `@ndigo/inspect`.
- **Guide contract** — The required shape of a guide, enforced by
  `pnpm guides:check`.
- **Coverage gate** — The zero-tolerance TSDoc member/param/returns check.
- **API tree** — The generated `packages/<name>/api/` TypeDoc reference.
- **Renumbering map** — The old→new guide table at
  [2026-11-08_GUIDE_RENUMBERING.md](./2026-11-08_GUIDE_RENUMBERING.md).
