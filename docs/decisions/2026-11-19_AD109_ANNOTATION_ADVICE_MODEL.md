# AD-109: Annotation, advice, and member transformer — one declaration layer, several executors

**Date:** 2026-11-19
**Status:** Accepted
**Deciders:** Framework owner (pre-1.0 API refinement, issue #545; implementation
tracked in #546, #547, #548, #47)

---

## Context

AD-42 shipped method interception on `Proxy` as `@ndigo/proxy`: metadata-only
annotations selected by `MethodInterceptor.matches`, executed by
`MethodInterceptor.invoke`, woven once per entry by an initialization-aware
processor. AD-43 built retry and circuit breaking on it. The facility worked,
but three couplings emerged as the surface grew:

1. **Selection and validation were fused.** `RetryInterceptor.matches` read the
   annotation _and_ validated the spec, so a malformed policy could only be
   rejected by a method that also decided to advise the method. There was no
   way to validate a rule without answering "does it apply?".
2. **Execution was owned by the decorator or by a per-feature processor.**
   `@cached`, `@traced`, `@counted`, and `@transactional` wrap at definition
   time; `@retry` and `@circuitBreaker` wrap at weave time. Nothing named the
   difference, so a capability's ability to be centrally configured,
   reordered, or disabled depended on an undocumented implementation accident.
   Feature-owned weavers could also stack, producing two independent proxies
   for one entry.
3. **Annotations were executor-scoped.** `methodAnnotation` lived in
   `@ndigo/proxy` and namespaced every key under `proxy:`, including policies
   declared by `@ndigo/resilience`. The namespace named the executor, not the
   declaring package.

The replacement options were:

- **A — keep `@ndigo/proxy` and add an overlay.** Lowest churn; leaves the
  couplings intact and makes the annotation namespace permanently
  executor-scoped.
- **B — extend `@ndigo/proxy` with a second selection model.** Adds a second
  vocabulary beside the first; does not resolve which one new code should use.
- **C — separate the declaration layer from the execution layer.** Annotations
  declare on the class; the context composes executors; member transformers
  remain for definition-time wrapping. One vocabulary, several executors.

Option C was chosen. It is a deliberate pre-1.0 break: aliases are not shipped,
and `@ndigo/proxy` is replaced rather than deprecated.

## Decision

### D1 — Three mechanisms, one vocabulary

| Mechanism              | Contract                                                            | Installed at    |
| :--------------------- | :------------------------------------------------------------------ | :-------------- |
| **Annotation**         | Writes a value into `Symbol.metadata`; returns the member unchanged | Definition time |
| **Advice**             | Wraps a matched call; selected by a rule, installed by an executor  | Weave time      |
| **Member transformer** | Returns a replacement member                                        | Definition time |

The axes are independent of AD-83's role taxonomy (stereotype, condition,
registration, policy, binding). A decorator's name follows its role; its
mechanism is documented, not encoded in the name. A decorator may be both an
annotation and a member transformer (a **hybrid**); it may not be both an
annotation and advice, because advice is not installed at definition time.

Full model: [`docs/architecture/annotation-and-transformer-model.md`](../architecture/annotation-and-transformer-model.md).

### D2 — The declaration layer lives in `@ndigo/core`

`AnnotationKey<T>`, `classAnnotation`, `methodAnnotation`, `annotationOf`, and
the `matchAll`/`matchAny`/`matchNot` combinators join `getSymbolMetadata` and
`Matchable` in `@ndigo/core`.

Rationale: core already owns both primitives; every metadata-writing package
already depends on core; putting the declaration layer anywhere else forces a
new dependency edge from every declaring package to that package.

Key grammar: `<namespace>:<name>` for class annotations and
`<namespace>:<name>:<member>` for member annotations. **The namespace names the
declaring package, never the executing package.** `@retry` is
`resilience:retry`, not `proxy:retry`.

`annotationOf` walks the class hierarchy (nearest declaration wins) and reads a
class-level key when no member is supplied. Writers validate the decorator
context kind; readers — or `MethodInterceptor.validate` — validate the value.

### D3 — `@ndigo/advice` replaces `@ndigo/proxy`

Same package role, new name, new contracts. `@ndigo/proxy` is removed; no
forwarding package, no aliases.

`@ndigo/advice` exports the method-advice contracts, the plan compiler, the
registry, `AdviceOrder`, `interceptMethods`, and `createIntercepted`. It depends
on `@ndigo/core` (declaration primitives, `Comparable`) and `@ndigo/factory`
(the initialization-aware processor contract).

### D4 — Selection is `Matchable<MethodDescriptor>` on the rule

```ts
interface MethodInterceptorRule {
    when?: Matchable<MethodDescriptor>;
    use: MethodInterceptor;
    order?: number;
}

interface MethodInterceptor {
    validate?(method: MethodDescriptor): void;
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}
```

- `MethodInterceptor.matches` is removed. One interceptor may be registered
  with several matchers, and selection is a property of the composition.
- `validate?` runs once per (method, interceptor) pair at plan-compile time and
  throws on failure. This preserves AD-42's fail-loud-at-weave-time behaviour
  without fusing validation into selection.
- No `Pointcut` type is introduced. A second name for `Matchable` would force
  every matcher author to choose between identical contracts.
- No expression language. Predicates are TypeScript.

### D5 — Weaving strategies: shadow by default, Proxy as fallback

Shadow weaving installs advised methods as own properties on the instance. It
preserves object identity and advises self-invocation, and it leaves the
prototype untouched.

Proxy weaving remains the fallback when shadowing cannot apply: frozen or
sealed instances, non-configurable own members, and function targets (class
shaped service clients whose method surface is shared through the prototype).
The difference is behavioural and must be documented per capability:
proxy-woven instances do not advise self-invocation and do not preserve
identity.

This is the source of the breaking change for `@transactional` and `@retry`:
internal calls are now advised on object-instance targets.

### D6 — One processor per execution stage

Exactly one weaver is installed per stage, by the framework preset, through
`InitializationAwareProcessor.processAfterInitialization`. Feature packages
contribute rules to `MethodInterceptorRegistry`; they never register a second
weaver.

Rationale: the predecessor's double-proxy failure mode required provenance
tracking (`wovenBy`) to detect and reconcile competing processors. Removing
the possibility is cheaper than detecting it.

### D7 — Ordering: rule-level, banded, `Comparable`-sorted

Order lives on the **rule**, not on the interceptor. An interceptor's position
depends on what it is composed with, not on what it is; there is no `Ordered`
interface for advisors.

`AdviceOrder` names the bands (`Observability`, `Resilience`, `Transaction`,
`Application`, `Innermost`). Only relative band order is contractual; the
numeric values are an implementation detail. Sorting is stable via core's
`compareBy` + `chainComparisons` + `numberComparator`, so registration order is
a deterministic tiebreaker.

### D8 — Signals are unified at the declaration layer

`@signal`, `@computed`, and `@effect` write to `Symbol.metadata` instead of
package-private WeakMaps; `@reactive` reads the metadata record instead of
`pendingSignals`/`pendingEffects`.

`@reactive` stays a member transformer: it must redefine accessors during
construction (before derived field initializers run), which a
post-construction executor cannot do.

### D9 — No common interceptor base interface

`MethodInterceptor`, `HTTPInterceptor`, `RouteHandlerInterceptor`, and
`ServiceInterceptor` unify their **meta-model** — naming, `Matchable` binding,
comparator ordering, `Registry` registration — but not a base type. Their
invocation shapes differ (method `next()` chain vs HTTP phases vs route
`preHandle`/`postHandle`/`completeHandle` vs service request/response), and a
common base would be a lowest-common-denominator contract.

Names are qualified by pipeline: `RetryMethodInterceptor` and
`AuditMethodInterceptor` live beside `RetryHTTPInterceptor`. The repository
already exports a `RetryInterceptor` from both `@ndigo/http` and
`@ndigo/resilience` — different contracts, same name; the collision is the
evidence.

### D10 — The programmatic path is first-class

`interceptMethods(instance, rules)` is the supported standalone entry point;
`createIntercepted(Ctor, rules, ...args)` is the construct-and-weave form. Both
compile the same plan as the container path.

A capability that only works inside a container is mis-scoped. Documentation
for any container-reachable capability must also show its by-hand form.

## Consequences

- `@ndigo/proxy` is deleted; `@ndigo/advice` ships its replacement contracts.
  No aliases, no forwarding package.
- `MethodInterceptor.matches` call sites move their predicates into rules;
  `validate` moves the fused spec checks out of selection.
- `@retry`/`@circuitBreaker` metadata keys move from `proxy:` to
  `resilience:`.
- Self-invocation is advised on shadow-woven object instances. This changes
  `@transactional` and `@retry` semantics and is recorded as breaking.
- `@cached`, `@traced`, `@counted`, and `@transactional` remain member
  transformers. Moving any of them to advice is a separate feature decision,
  not a consistency cleanup.
- One weaver per stage removes the double-proxy class of bugs (and the
  `wovenBy` provenance API that existed to detect it).
- AD-42 D-1/D-3/D-6 are superseded; AD-42 D-2/D-4/D-5/D-7 survive in adapted
  form. AD-83's category 8 is renamed **Bindings & exposures** (editorial; the
  role taxonomy is otherwise unchanged).

## References

- Issue #545 — concept document, vocabulary, and inventory (this record's PR).
- Issue #546 — `refactor(advice)!: replace @ndigo/proxy with @ndigo/advice and
  unify the annotation model`.
- Issue #547 — qualify interceptor names by pipeline.
- Issue #548 — unify `close`/`destroy` lifecycle contracts (prerequisite for
  #47).
- Issue #47 — holistic interceptor overhaul.
- [`docs/architecture/annotation-and-transformer-model.md`](../architecture/annotation-and-transformer-model.md)
  — the concept document.
- AD-42 — method interception on `Proxy`; AD-43 — retry and circuit breaking;
  AD-83 — decorator categories; AD-91 — 1.0 API freeze; AD-94 — error lineage.
