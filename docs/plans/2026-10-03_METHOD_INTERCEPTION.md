# 2026-10-03 Method Interception (`@blue/proxy`)

Decision record: [AD-42](../decisions/2026-10-03_AD42_METHOD_INTERCEPTION.md)

## 1. Problem

BlueJS has no container-managed method interception. Cross-cutting concerns
today are per-method decorators (`@cached`, `@traced`, `@transactional`): the
wrapper is chosen at class-definition time and the policy lives in the service
class. There is no way to apply a concern across many services — or to select
methods from outside the class — without editing each method.

JavaScript's `Proxy` provides the mechanism for runtime interception, and the
container already has a replacement seam (`InitializationAwareProcessor`) and a
proven registration path (`addProcessor`). The missing piece is the API and
weaving rules that turn those into a coherent facility.

Not in scope: property/field interception, constructor interception, AspectJ
pointcut expressions, introductions, or migrating existing method decorators.

## 2. Current state (verified 2026-10-03)

**Instance lifecycle seam**

- `InitializationAwareProcessor.processAfterInitialization(name, instance)` may
  return a wrapped replacement:
  `packages/blue-factory/src/entry-processor.ts:11-30`
- Wiring + singleton caching: `AbstractFactory._applyProcessorsAfterInitialization`
  (`abstract-factory.ts:472-491`), creation flow (`L600-643`), singleton cached
  via `defineProperty` in `getValue` (`L240-247`)
- Public registration: `ConfigurableFactory.addProcessor`
  (`factory-contract.ts:45`, `abstract-factory.ts:131`)

**Decorator conventions (TC39 `Symbol.metadata`)**

- Wrappers replace the prototype method AND stamp metadata keys of the form
  `"<KEY>:<methodName>"`; e.g. `@traced` preserves the pre-wrap function as
  `"<TRACED_KEY>:<name>:original"` for signature inspection
  (`packages/blue-telemetry/src/trace/decorators.ts:42-90`); `@profile` uses the
  same `:name` suffix convention (`packages/blue-context/src/configuration.ts`)
- Reader: `getSymbolMetadata(target)` (`packages/blue-core/src/metadata.ts:20-29`)

**Existing proxies**

- `RegistryProxyHandler` forwards property access to the registry, binding
  functions (`packages/blue-factory/src/registry.ts:42-69`) — registry-level,
  not bean-method-level
- `serviceClient()` builds a Proxy over a bean target with a `get` trap
  intercepting declared methods (`packages/blue-service/src/service-client.ts:204-246`)

**Prior art (archived)**

- `archive/blue-aspect/` — full imperative AOP API (`intercept(target, pointcut,
  aspect)`, pointcut/advice classes, property interception), 16 months old,
  archived. Not resurrected (see AD-42).

**Gap confirmed:** no automatic/global method interception exists anywhere in
the framework today.

## 3. Decisions

Design decisions are recorded in AD-42. Sequencing-relevant refinements:

- **D-3 contract** — `next()` is _re-entrant_: each invocation advances a
  fresh chain position, so around-advice may invoke it multiple times — the
  retry pattern. (Single-call guard removed 2026-10-04 on evidence from the
  resilience consumer; Spring's `proceed()` is likewise re-invocable.)
  `unknown` return type is deliberate, the service's public type is preserved
  at the caller.
- **D-4 weaving** — wrappers are created lazily per method key on first access
  and cached; the `get` trap forwards non-function properties with
  `Reflect.get(target, key, target)`.
- **D-5 no-proxy guard** — the processor returns the input instance unchanged
  when no interceptor matches any method; a symbol marker prevents
  double-wrapping if the instance is re-processed.
- **D-6 composition** — the chain tail invokes the resolved installed method
  (`Reflect.get(target, key, target)` result). Never an `:original` metadata
  entry. Existing decorator metadata (`traced:`/`cache:`) is never treated as
  proxy advice.

## 4. Architecture

### Package

`packages/blue-proxy/` — new workspace package. Depends on `@blue/factory`
(processor types) and `@blue/core` (`getSymbolMetadata`). Mirrors the
`blue-factory` package skeleton (package.json, vitest.config.ts, tsconfig.build.json,
nx project).

### API sketch

```ts
// Annotation key: metadata-only, no method replacement.
const audited = methodAnnotation<{ action: string }>('audited');

class OrderService {
    @audited({ action: 'order.submit' })
    submit(order: Order): Receipt {
        // business logic — unchanged
    }
}
```

```ts
interface MethodDescriptor {
    readonly entryName: string;
    readonly targetType: Function;
    readonly methodName: PropertyKey;
    annotation<T>(key: AnnotationKey<T>): T | undefined;
}

interface MethodInvocation extends MethodDescriptor {
    readonly target: object;
    readonly args: readonly unknown[];
}

interface MethodInterceptor {
    readonly order?: number;
    matches(method: MethodDescriptor): boolean;
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}
```

```ts
// Registration — first-class builder API (recommended): the context applies
// the processor before refresh, so even eagerly-created constructor entries
// (`_finishFactoryInitialization`) are woven.
const audit = new AuditInterceptor();
const builder = new ApplicationBuilder([NodeAppConfiguration]).processors(interception([audit]));

// Equivalent lower-level form on a prepared context/factory:
//   context.addProcessor(interception([audit]));
//   context.setValue('orderService', OrderService); // woven at first getValue
```

### Weaving model

```
Caller
  → Proxy (get trap, cached wrapper, target-bound `this`)
    → interceptor chain (order ascending outward)
      → installed (possibly decorated) method
        → business method
```

- Self-invocation (`this.submit(...)`) bypasses the proxy but still runs
  through method-wrapper decorators — same tradeoff line as Spring, documented
  in AD-42 D-4.

### Internals

- `interception(interceptors)` → `InitializationAwareProcessor`; on
  `processAfterInitialization`:
    1. enumerate method keys over the instance's prototype chain (skip
       `constructor`, non-functions, non-enumerable symbols handled per repo
       conventions)
    2. build `MethodDescriptor`s from `Symbol.metadata`
    3. keep entries where at least one `matches()` returns true
    4. empty → return instance unchanged (plus marker)
    5. else return one `Proxy` with a `get` trap per D-4
- `annotation<T>(key)` reader walks `getSymbolMetadata` up the prototype chain
  (inherited annotations resolve to the nearest declaration).

## 5. Risks

| Risk                                                                     | Mitigation                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#private` access breaks under a naive proxy                             | Target-bound receiver (`Reflect.get(target, key, target)`); verified by spec + smoke                                                                                                                                                                                                           |
| Self-invocation bypasses advice                                          | Documented boundary (AD-42 D-4); existing decorators remain for full coverage                                                                                                                                                                                                                  |
| Advice must not re-fire/double-wrap                                      | Marker symbol in `processAfterInitialization`; no reuse of decorator metadata as advice (D-6)                                                                                                                                                                                                  |
| Identity: `proxy !== target`                                             | Only matched entries proxied (D-5); specs assert `instanceof` and `===` for unaffected entries                                                                                                                                                                                                 |
| Repeated `proxy.method` returns new functions → breaks callers and state | Per-key cached wrappers; spec asserts identity                                                                                                                                                                                                                                                 |
| Async/throw semantics silently change                                    | Interceptor returns raw value; no implicit promise/async rewrapping (D-3); specs pin pass-through                                                                                                                                                                                              |
| Decorated-method double execution if `:original` used as tail            | Tail always invokes installed method (D-6); regression spec                                                                                                                                                                                                                                    |
| Metadata changes after weave are invisible                               | Documented: weave happens at initialization; decorations are static by then                                                                                                                                                                                                                    |
| Eager entry creation beats late registration                             | Constructor entries are created at refresh end (`_finishFactoryInitialization`); `ApplicationBuilder.processors(...)` registers before refresh, so all entries are woven. Direct `context.addProcessor(...)` covers values created _after_ the call — use the builder API in apps (ADR-42 D-8) |
| Performance of get-trap per call site                                    | One trap + cached wrapper per key; optional bench in Phase 3                                                                                                                                                                                                                                   |

## 6. Sequencing

### Phase 0 — Package scaffold

- Create `packages/blue-proxy` (skeleton from `blue-factory`), register in
  workspace/nx, root re-exports per repo convention.
- **Acceptance:** `pnpm --filter @blue/proxy test` green (placeholder spec);
  `pnpm manifest:check` clean.

### Phase 1 — Annotation keys

- `methodAnnotation<T>(name)` decorator factory storing
  `"blue.proxy.<name>:<method>"` in `context.metadata` (reject non-method
  kinds with `TypeError`, mirroring `@traced`); `AnnotationKey` type;
  `annotationsOf(target)` reader via `getSymbolMetadata` with prototype-chain
  walk.
- Specs: write/read round-trip; inheritance resolution; kind error; key
  namespace collision safety.
- **Acceptance:** Phase 1 specs green; no behavioral change in any consumer.

### Phase 2 — Interceptor API and chain composer

- `MethodDescriptor`, `MethodInvocation`, `MethodInterceptor`, `interception()`
  builder (sans Proxy): compose ordered chains per method; `next()`
  single-call guard.
- Specs: order + registration ordering; short-circuit (no `next()`); exception
  propagation; raw promise pass-through (interceptor awaits nothing).
- **Acceptance:** Phase 2 specs green.

### Phase 3 — Proxy weaving

- `createMethodProxy(target, chains)` internal: `get` trap per D-4, cached
  wrappers, non-function forwarding, empty-chain ⇒ returns target unproxied.
- Specs (this phase is the behavioral core):
    - `#private`-field methods execute under proxy
    - self-invocation bypass (asserted boundary)
    - `proxy.method === proxy.method`; `instanceof`; unaffected entry identity
    - sync/throw/async pass-through; short-circuit; ordering end-to-end
    - never calls an `:original` metadata entry as tail
    - no proxy when no interceptor matches
- Optional: `bench/` overhead comparison vs direct call (skip if pattern
  diverges; do not block).
- **Acceptance:** all weaving specs green; smoke script exercises a
  private-field service through a mock container instance.

### Phase 4 — Container integration

- Wire as `InitializationAwareProcessor` (D-5 marker), plus registration
  convenience (`interception([...])` result accepted by
  `ConfigurableFactory.addProcessor`).
- Specs: full factory flow — boot with a configuration class declaring an
  `@entry` service; assert advised call, unadvised entry identity, no proxy
  without interceptors, double-processing safety.
- **Acceptance:** factory-level specs green.

### Phase 5 — Demo gate (blue-api)

- `AuditInterceptor` + `OrderService` demo bean, registered in the app entry
  (`apps/blue-api/src/index.ts`, AD-42 D-8 pattern: processor first, class
  second); spec mirroring that flow asserts audit records for advised calls,
  silence for plain methods, and preserved private state; smoke: full boot
  path exercised by the spec.
- **Acceptance:** `pnpm --filter @blue/api test` green including the audit
  spec; full app typecheck shows no new errors.

### Phase 6 — Verification and docs

- Full `pnpm test`, `pnpm lint`, `pnpm format`; delete throwaway scripts;
  close ADR status if anything changed; `graft build` refresh.
- **Acceptance:** CI-equivalent commands green on the whole workspace.

## 7. Verification

- Per-phase acceptance above; throwaway smoke scripts for weaving and the demo
  gate only (removed in Phase 6).
- Framework invariants to keep pinned after this lands: `pnpm test` and
  `pnpm lint` clean; no existing decorator behavior changes (Phase 1 asserts
  this).
