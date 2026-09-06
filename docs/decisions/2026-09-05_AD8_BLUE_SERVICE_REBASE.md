# AD-8: blue-service — rebase interceptors onto @blue/http, roadmap to declarative service clients

**Date:** 2026-09-05
**Status:** Accepted (near-term rebase); full proxy generation is a documented roadmap item to build _after_ the current validation effort

## Background

`blue-service` was designed as a _service layer_ on top of `@blue/http` (the low-level client, in the spirit of fetch/axios): declare a common HTTP config plus a list of service names → their URLs, then reference endpoints by name. It was intentionally HTTP-agnostic at the call site.

The design accumulated a problem: it **re-declared five interceptor interfaces** that mirror `@blue/http`'s (`CompletionAwareServiceInterceptor` / `CompletionAwareHTTPInterceptor`, …, `ResponseAwareServiceInterceptor` / `ResponseAwareHTTPInterceptor`), because the author "didn't want to expose HTTP at all." That duplication is the redundancy called out in the framework assessment (R3). Development of `blue-service` paused, and the framework gained Zod validation (AD-7), so the layer is worth re-evaluating.

## Decisions

### 1. Terminology (mirrors the mapping decorators)

Keep the Spring-inspired family coherent:

- **`@service(name, config)`** — class/interface decorator declaring a named service (the registry token) with shared HTTP config (base URL, timeouts, interceptors).
- **`@getCall(path)` / `@postCall(path)` / `@putCall` / `@deleteCall` / `@patchCall` / `@headCall` / `@optionsCall`** — method decorators for a single service call, matching the existing `@getMapping` / `@postMapping` / … naming in `blue-dispatcher`.

`@service` (lowercase, camelCase) follows the repo's camelCase decorator convention; `Call` pairs with `Mapping` as the client-side counterpart (Mapping = server route declaration, Call = client invocation).

### 2. Near-term (this effort): rebase interceptors onto `@blue/http` contracts

- Reverse the `blue-service` interceptor interfaces to **`extends` / alias the `@blue/http` interceptor contracts** instead of re-declaring them.
- Keep only what is genuinely service-specific (`postSuccess` vs HTTP's `postResponse`).
- `blue-service` may import from `@blue/http` — exposing the low-level contract is accepted; the _call site_ of a `Service` still references endpoints by name.

Rationale: the four identical lifecycle methods (`preInit`, `preRequest`, `postError`) are provably the same contract as HTTP's; only `postSuccess` differs semantically (service-level success vs raw response transform). Reusing HTTP's contracts removes the duplication without inventing a parallel system, and is consistent with the Library Integration Layer direction.

### 3. Roadmap (build _after_ the current effort): full interface-based service client generation

The industry direction (OpenFeign, Retrofit, Spring Boot 4 `@HttpExchange` declarative clients) is **declarative interface clients**: decorate an interface; the framework generates the client proxy. BlueJS already has the machinery (TC39 decorators + `Symbol.metadata` + metadata-driven generation).

Target shape:

```ts
@Service('accounts', { baseUrl: 'https://api.example.com' })
interface AccountsAPI {
    @getCall('/{id}')
    getById(id: number): Promise<Account>;

    @postCall('/')
    create(account: Account): Promise<Account>;
}

// Injected / constructed as AccountsAPI — the service name is the token,
// methods are typed, HTTP stays under the generated client.
```

Planned work items (deferred):

1. **Proxy generation** — `@service` reads method metadata (`Symbol.metadata`) and builds a client whose methods resolve `name → URL`, map params/path template, and call `@blue/http`.
2. **Zod response/request schemas** — method metadata carries `zod` schemas (consistent with AD-7) for request serialization and response validation.
3. **Service-name correlation** — the generated client propagates the service name as a header/tag so `RequestIdCorrelation` and telemetry hooks work unchanged.
4. **Remove the name→URL registry indirection** — `@service` _is_ the registration; `MapServiceRegistry` becomes an internal detail or is deleted.
5. **Drop the remaining service-specific interceptor surface** — with HTTP's contracts reused (near-term), the proxy delegates to `@blue/http`'s execution chain directly; no `ServiceExecutionChain` fork.

## Consequences

- **Removes the R3 redundancy**: `blue-service` no longer parallel-declares five interceptor contracts.
- **Preserves the layer intent**: call sites reference services by name; HTTP specifics stay under `@blue/http` (the `@service`-decorated API is the developer-facing surface).
- **Deferred work is explicit**: the full proxy is not half-built; it is a documented AD-8 roadmap item gated on a real consumer (YAGNI).

## Revisit Trigger

Revisit the proxy roadmap when an application needs a typed, name-based remote API and would consume the generated client (currently `blue-service` has 0 consumers).
