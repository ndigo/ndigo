# AD-110: Annotations declare, the context executes — `@ndigo/advice`

**Date:** 2026-11-20
**Status:** Accepted
**Supersedes:** AD-42 (method interception on `Proxy` — `@ndigo/proxy`), D-6 of AD-43
**See also:** AD-109 (annotation and advice model)

## Context

AD-42 introduced `@ndigo/proxy`: annotations wrote `Symbol.metadata`, a
`matches` method on each interceptor chose its methods, and one `Proxy` per
advised entry ran the chain. Three problems surfaced in use.

1. **Selection lived in the interceptor.** `matches` ran once per method per
   interceptor, and every interceptor re-implemented "does this method carry my
   annotation". Two features could not express "advise the same method in this
   order" without one of them knowing about the other.
2. **Proxy identity was observable.** An advised entry was a different object
   from the one the factory constructed, so `===`, `WeakMap` keys, and
   `instanceof` all behaved differently — and `this.sibling()` bypassed
   advice, because the proxy was never the receiver. `@cached` had already
   diverged from `@proxy` for exactly this reason: it wrapped the prototype
   method so self-invocation stayed cached.
3. **`@ndigo/proxy` named its mechanism, not its purpose**, and four
   decorators (`@cached`, `@traced`, `@counted`, `@transactional`) still
   wrapped methods inline instead of declaring, so the framework had two
   parallel models for the same thing.

## Decision

Split the declaration layer from the execution layer, and give the execution
layer a name that says what it does: **`@ndigo/advice`** replaces
`@ndigo/proxy` outright (D-1).

| #    | Decision                                                                                                                                                           | Rationale                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1  | `@ndigo/advice` replaces `@ndigo/proxy`; no alias, no deprecation window                                                                                           | Pre-1.0 break. A shim would keep the mechanism-named package alive and hide the contract change from consumers.                                                                                                                               |
| D-2  | Annotations live in `@ndigo/core` (`AnnotationKey`, `methodAnnotation`, `classAnnotation`, `annotationOf`)                                                         | Core already owned `getSymbolMetadata` and `Matchable`, and every metadata-writing package already depended on it. One grammar — `<namespace>:<name>[:<member>]`, namespace naming the _declaring_ package.                                   |
| D-3  | Selection moves from the interceptor to the rule: `MethodInterceptorRule { when?: Matchable<MethodDescriptor>; use: MethodInterceptor; order?: number }`           | `MethodInterceptor.matches` is gone. A feature says _what_ runs; a rule says _where_. Two features can advise one method without either knowing about the other.                                                                              |
| D-4  | `MethodInterceptor` gains `validate?(method: MethodDescriptor): void`, called once at plan compile                                                                 | Preserves AD-42's fail-loud-at-weave-time property for `@retry`/`@circuitBreaker` specs without reintroducing `matches`.                                                                                                                      |
| D-5  | Shadow weaving is the default strategy: one non-enumerable own property per advised method on the instance                                                         | Preserves identity, advises self-invocation, and keeps `#private` access because the instance is always the receiver. Supersedes AD-42 D-6.                                                                                                   |
| D-6  | `Proxy` remains as the documented fallback for function targets, frozen/sealed/non-extensible instances, and own non-configurable members                          | Those targets cannot accept own properties. The fallback is opt-in by circumstance, not by choice, and each capability documents the boundary: identity is not preserved and self-invocation bypasses advice.                                 |
| D-7  | One processor per stage. Features contribute rules to a `MethodInterceptorRegistry`; only the framework registers `interception(...)`                              | Removes the "register exactly one `interception(...)` processor" failure mode that AD-42's design created.                                                                                                                                    |
| D-8  | The standalone path is first class: `interceptMethods(instance, rules)` and `createIntercepted(Ctor, rules, ...)` run the same plan compiler as the container path | Service clients, hand-built objects, and tests need the runtime without the container. The context is an adapter, not the only runtime.                                                                                                       |
| D-9  | Ordering uses rule-level `order` merged with `AdviceOrder` bands, sorted stably                                                                                    | Independently authored rules interleave predictably instead of guessing numbers relative to each other.                                                                                                                                       |
| D-10 | `@cached`, `@traced`, `@counted`, `@transactional` become annotations plus interceptors                                                                            | One model for every capability. A plain `new Service()` is inert and documented as such. `TracedInterceptor` and `CountedInterceptor` stay synchronous — `async` would make every advised method return a promise the type system cannot see. |
| D-11 | `@transactional` nesting joins rather than nests                                                                                                                   | Both transaction managers reject an already-active transaction. The interceptor tracks open boundaries per manager, so an inner transactional call shares the outer boundary and the outer decides commit or rollback.                        |
| D-12 | A startup diagnostic reports annotated methods that no rule claims, once per class                                                                                 | Without it, a missing registration is invisible until someone notices absent traces. Once per class, never per call.                                                                                                                          |

## Consequences

**Behaviour changes consumers must handle**

- `@cached`, `@traced`, `@counted`, and `@transactional` no longer do anything
  on their own. Every application that used them must register a rule.
  `@ndigo/boot`'s `processors(...)` and `@ndigo/test`'s `bootNodeApp` options
  are the two wiring points.
- A method advised by `@retry` or `@transactional` returns a promise even when
  its declared type is not one — the annotation is invisible to the type
  system. This was already true through the proxy; it is now true for
  self-invocation as well.
- Self-invocation is advised on objects. Code that relied on a nested call
  bypassing advice (for example, to avoid a second transaction) changes
  meaning. This is the trade for identity preservation and is the documented
  reason shadow weaving is the default.

**What stays the same**

- The annotation key grammar and the `Symbol.metadata` storage location.
- `next()` re-entrancy, so retry keeps working by re-entering the tail.
- Interceptor ordering semantics: lower runs closer to the caller, ties keep
  registration order.

**Open**

- Qualified interceptor names across pipelines (`RetryInterceptor` exists in
  both `@ndigo/http` and `@ndigo/resilience`) are tracked separately.
- `close`/`destroy` unification is a prerequisite for lifecycle annotations and
  lands before them.

## Refs

- `docs/architecture/annotation-and-transformer-model.md`
- `docs/decisions/2026-11-19_AD109_ANNOTATION_ADVICE_MODEL.md`
- `docs/guides/35-method-interception-and-resilience.md`
- `packages/ndigo-advice/src/{plan,shadow,proxy,weave,processor}.ts`
