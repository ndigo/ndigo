# AD-42: Method interception on JavaScript `Proxy` — `@blue/proxy`

**Date:** 2026-10-03
**Status:** Accepted — design and implementation plan: [2026-10-03_METHOD_INTERCEPTION](../plans/2026-10-03_METHOD_INTERCEPTION.md)

## Context

BlueJS deliberately does not ship Spring AOP. The framework position is that
JavaScript's dynamic nature already provides interception, and the current
cross-cutting features are per-method function wrappers:

- `@cached` — `packages/blue-cache/src/cached.ts`
- `@traced` — `packages/blue-telemetry/src/trace/decorators.ts` (wrapper +
  `Symbol.metadata` keys + an `:original` entry preserved for signature
  introspection)
- `@transactional` — `packages/blue-orm/src/decorators.ts`

The container already has a sanctioned seam for instance replacement:
initialization-aware entry processors
(`packages/blue-factory/src/entry-processor.ts`,
`AbstractFactory._applyProcessorsAfterInitialization`). Registry-level proxies
already exist (`RegistryProxyHandler`, `ProxiedFactory`,
`serviceClient()` in blue-service).

Prior art exists and was archived 16 months ago: `archive/blue-aspect/`
(imperative `intercept(target, pointcut, aspect)` API, string/regex pointcuts,
advice classes, property-access interception).

The gap: no container-managed, centrally-applied method interception. Applying
a cross-cutting concern today requires touching every service method with a
decorator, and decorator wiring is fixed at class definition time.

## Decision

Ship an optional, container-managed method-interception facility built on the
native JavaScript `Proxy`, packaged as **`@blue/proxy`** (D-1).

| #   | Decision                                                                                       | Rationale                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1 | Package named `@blue/proxy` after the enabling mechanism                                       | Mechanism-named (user direction); avoids AOP branding the framework deliberately rejected and a name clash echo of archived `blue-aspect` (`@blue/aop` rejected).                                                                                                                                                                                                                |
| D-2 | Selection by metadata-only annotations and explicit interceptor predicates                     | A `methodAnnotation(...)` helper stores annotation values in `Symbol.metadata` using the repo's existing string-keyed convention (`"<key>:<method>"`, read via `getSymbolMetadata`); interceptor `matches()` may select on entry name, constructor, or method name without touching service code. Annotations _do not replace methods_.                                          |
| D-3 | Interceptor contract: `matches(MethodDescriptor)` + `invoke(MethodInvocation, next)` + `order` | Selection separated from execution; ordering explicit; `next()`-chain supports short-circuit (e.g. caching); async/throw semantics are the interceptor's responsibility (no implicit promise wrapping).                                                                                                                                                                          |
| D-4 | Weave on `Proxy` with target-bound receivers and cached wrappers                               | Method access resolved as `Reflect.get(target, key, target)`, wrapper bound to the target instance as `this` — preserves `#private` fields. Wrappers cached per key to keep `proxy.method === proxy.method`. Self-invocation bypasses the proxy (same boundary Spring documents); preserved decorator wrappers do not.                                                           |
| D-5 | No proxy created when no interceptor matches                                                   | Unadvised entries keep identity (`instanceof`, `===`); only matched entries are proxied.                                                                                                                                                                                                                                                                                         |
| D-6 | Existing method wrappers unchanged; composition is proxy → decorated method → body             | Proxy chains execute the _installed_ method — never a saved "original" — so `@traced`/`@cached` semantics inside the proxy are intact. Existing decorator metadata is not re-interpreted as proxy advice (no double-wrapping).                                                                                                                                                   |
| D-7 | v1 scope: method invocation interception only                                                  | No property read/write traps, no constructor interception. The archived `blue-aspect` property-access and constructor join points stay rejected.                                                                                                                                                                                                                                 |
| D-8 | Demo gate: audit interceptor wired in blue-api                                                 | Repository convention (caching, scheduling, static files); proves the facility end-to-end against a real managed entry. Canonical registration is `builder.processors(interception([...]))` (`ApplicationBuilder`): the context receives the processor before refresh, so constructor entries eagerly created at refresh end (`_finishFactoryInitialization`) are already woven. |

## Consequences

- Managed containers can apply centralized policy (audit, timing, decorator-like
  concerns) without editing service methods.
- Advice applies at the container boundary: self-invocation and unmanaged
  instances are never advised. This is documented as intended behavior, and is
  exactly why existing method-wrapping decorators are retained.
- A metadata-only annotation has **no execution effect** until an interception
  processor is registered — documented on the annotation helper.
- `@blue/proxy` depends on `@blue/factory` (processor contract) and `@blue/core`
  (metadata reader); blueprint: `getSymbolMetadata` at
  `packages/blue-core/src/metadata.ts:20-29`.
- Spring AOP features with no BlueJS analogue (AspectJ pointcut language,
  introductions, class-based proxy selection) remain explicit non-goals.

## References

- Plan: `docs/plans/2026-10-03_METHOD_INTERCEPTION.md`
- Caching plan D-3 ("no AOP: wrapper decorator"): `docs/plans/2026-09-17_CACHING.md`
- Archived prior art: `archive/blue-aspect/` (16 months old; `intercept()`,
  pointcut/advice classes) — superseded, not resurrected
- Spring proxy semantics (self-invocation boundary):
  <https://docs.spring.io/spring-framework/reference/core/aop/proxying.html>
- Processor seam: `packages/blue-factory/src/entry-processor.ts`,
  `AbstractFactory.addProcessor` (`packages/blue-factory/src/abstract-factory.ts:131`)
