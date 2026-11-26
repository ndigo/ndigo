# Annotation, Advice & Transformer — Design Notes

Internal notes for maintainers. The published
[Annotation, Advice & Transformer](./annotation-and-transformer-model.md) page
teaches the three mechanisms; this file keeps the consumption seams, executor
internals, naming rules, and the questions that are still open. The full
inventory lives in
[annotation-and-transformer-model-inventory.md](./annotation-and-transformer-model-inventory.md).
It is not published as a concept page.

The current model replaced `@ndigo/proxy` with `@ndigo/advice`; the migration
guide is
[Annotation and advice model](../migrations/2026-11-20_ANNOTATION_ADVICE_MODEL.md).

## Consumption seams

A declaration reaches its consumer through exactly one of two seams:

| Category      | Consumer                                                  | Lives in                              | Contract                                              |
| :------------ | :-------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------- |
| **Processor** | Hook on each entry instance as the container creates it   | `@ndigo/factory` `entry-processor.ts` | `InitializationAwareProcessor` and its siblings       |
| **Lifecycle** | Component the context drives, scanning the finished graph | `@ndigo/factory` `lifecycle.ts`       | `ManagedLifecycle` (+ `Initializable`, `Destroyable`) |

Pick **processor** when the declaration changes what an instance is or does,
and the decision is per instance. Advice is the only current consumer: it must
decide whether any rule matches and return a replacement for that instance,
which is exactly `processAfterInitialization`'s contract.

Pick **lifecycle** when the declaration contributes a fact to a whole-graph
table that is read once, and the consumer also has resources to start and stop.
Scanning decorators are the consumers here, and they are ordered by `phase`:

| Consumer                                                           | Trigger                                   | Phase |
| :----------------------------------------------------------------- | :---------------------------------------- | ----: |
| `ConfigurationProcessor` (`@configuration`, `@entry`, `@property`) | `EntryRegistryProcessor`, at registration |     — |
| `AbstractHandlerMethodMapping` (`@routeMapping`)                   | `ManagedLifecycle` on refresh             |  −100 |
| `Dispatcher`                                                       | `ManagedLifecycle` on refresh             |   −90 |
| `ScheduleRegistry` (`@scheduled`)                                  | `ManagedLifecycle` on refresh             |     0 |
| `JobHandlerRegistry` (`@jobHandler`), `JobRunner`, `OutboxRelay`   | `ManagedLifecycle` on refresh             | 0, 10 |
| `HTTPServer`                                                       | `ManagedLifecycle` on refresh             |     0 |

The discriminator is not "which is newer" but what the consumer needs. A
scanning consumer resolves its collaborators at start — `ScheduleRegistry.start()`
looks up the `taskScheduler` entry and throws when it is absent — so it must run
after every entry exists. A processor runs during creation, where that
collaborator may not exist yet, which is why the two cannot be swapped freely.

They compose. The schedule registry captures `owner[methodName]` while scanning,
and advice wove that instance earlier, so a `@scheduled` + `@traced` method
reaches the woven method through the registry's own closure
(`apps/17-ndigo-telemetry-lab/test/scheduled-advice.spec.ts`).

The framework-inherited names were deliberately renamed: `ManagedLifecycle`
(was `SmartLifecycle`) and `LifecycleCoordinator` (was `LifecycleProcessor`).
`@ndigo-orm`'s entity persistence hooks (`prePersist`, `postLoad`, …) live in
`entity-hooks.ts` with `EntityHook*` names; ORM & Migrations's "The lifecycle" is the
migration pipeline. The published page's **Lifecycle** row describes only the
container's.

## Selection

`Matchable<T>` is the one selection contract:

```ts
interface Matchable<T> {
    matches(value: T): boolean;
}
```

Method advice matches `MethodDescriptor`:

```ts
interface MethodDescriptor {
    readonly entryName: string;
    readonly targetType: Function;
    readonly methodName: PropertyKey;
    annotation<T>(key: AnnotationKey<T>): T | undefined;
}
```

`MethodDescriptor.annotation` is bound to `targetType`, not to the live
instance, so a proxied or wrapped instance still resolves the declaring class's
metadata.

The common matcher factory:

```ts
function hasAnnotation<T>(key: AnnotationKey<T>, accept?: (value: T) => boolean): Matchable<MethodDescriptor>;
```

It matches when the method — or its declaring class — carries a value under
`key`, optionally narrowed by `accept`. The two reads are distinct metadata keys
(`ns:name:member` vs `ns:name`), so there is no ambiguity; a class-level
declaration covers every method of the class, which is what `@authenticated`
and `@rateLimit` mean when applied to a class. The fallback lives in
`MethodDescriptor.annotation`, so a matcher and the interceptor it selects for
always agree on the effective value.

The combinators:

```ts
function matchAll<T>(...matchers: Matchable<T>[]): Matchable<T>;
function matchAny<T>(...matchers: Matchable<T>[]): Matchable<T>;
function matchNot<T>(matcher: Matchable<T>): Matchable<T>;
```

Deliberate non-goals:

- **No `Pointcut` type.** A second name for `Matchable` would force every
  matcher author to choose between two identical contracts.
- **No expression language.** Predicates are TypeScript. There is no string
  grammar to parse, no evaluator, and no reflection-based method lookup.
- **No class-name string matching.** Matching a class by name is a rename
  hazard; match on the constructor or on an annotation.

The primitives live in `@ndigo/core` (`annotation.ts`, `matchable.ts`).

## Executors

| Executor           | Installs at     | Preserves identity        | Advises self-invocation   | Needs a context |
| :----------------- | :-------------- | :------------------------ | :------------------------ | :-------------- |
| Container weaving  | `refresh`       | Yes (shadow) / No (proxy) | Yes (shadow) / No (proxy) | Yes             |
| Standalone weaving | Call site       | Yes (shadow) / No (proxy) | Yes (shadow) / No (proxy) | No              |
| Member transformer | Definition time | Yes                       | Yes                       | No              |

All three consume the same declaration layer and the same
`MethodInterceptorRule` shape. There is one plan compiler; the executors differ
only in where the plan is applied.

### Container weaving

The application registers one weaver as an initialization-aware entry
processor — `builder.processors(interception(rules))`. It runs after
construction and before `ApplicationContextAwareProcessor` has injected the
context, because the builder's processors are added to the context before
`refresh()` while the aware processor is appended during it.

That ordering is why an interceptor reads instance state at **call** time, not
while the plan is compiled: `invocation.target.applicationContext` is
`undefined` during weaving and populated by the time any advised method runs.
A matcher or a `validate` implementation must therefore select on
`MethodDescriptor`/`targetType` — the static facts — and leave instance lookup
to `invoke`. Weaving itself does not depend on injection: shadow weaving
installs own wrappers, which the aware processor's property write does not
disturb.

**Shadow weaving is the default for object instances.** The weaver installs the
advised methods as own properties on the instance, each wrapping the prototype
method. This preserves identity (`===`, `instanceof`, instance-keyed caches),
advises self-invocation (`this.helper()` hits the own property), and leaves the
prototype untouched, so sibling instances are unaffected.

**Proxy weaving is the fallback**, used when shadow weaving cannot apply:

- the instance is frozen or sealed, or an own non-configurable property already
  occupies the member name;
- the target is a function — a class-shaped service client
  (`serviceClient(API, http)`) carries its method surface on the shared
  prototype, so per-instance shadowing would either mutate every instance or
  not work at all.

When no rule matches any method, no executor is applied and the instance is
returned unchanged.

The fallback is a real behavioural difference: proxy weaving does **not** advise
self-invocation and does **not** preserve identity. Documentation for any
capability that may fall back must state the boundary. See MDN's
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
for the underlying mechanism.

`@ndigo/proxy` was Proxy-only, so self-invocation bypassed advice by
construction. Under shadow weaving it no longer does; `@transactional` and
`@retry` therefore change semantics on internal calls, which is why the
migration is a breaking change and not a rename.

Shadow weaving mutates the instance's own property shape. The cost is bounded by
the number of advised methods, and prototype-scoped entries pay it once per
instance — the same order as the instance itself.

### Standalone weaving

```ts
import { interceptMethods } from '@ndigo/advice';

const service = interceptMethods(new OrderService(), [
    { when: hasAnnotation(retry), use: new RetryInterceptor(), order: AdviceOrder.Resilience },
]);
```

`interceptMethods(instance, rules)` compiles the same plan and applies the same
strategy selection. `createIntercepted(Ctor, rules, ...args)` is the
construct-and-weave form for code that would otherwise write
`interceptMethods(new Ctor(...), rules)`. Both are exported from the package
root and documented as the supported path for hand-constructed objects, tests,
and service clients — not as "advanced" or "internal".

## Full decorator inventory

The full mechanism classification for every decorator in the tree lives in
[annotation-and-transformer-model-inventory.md](./annotation-and-transformer-model-inventory.md).

## Naming

### Interceptors are qualified by the pipeline they plug into

The repository exports a `RetryInterceptor` from both `@ndigo/http` and
`@ndigo/resilience`. They implement different contracts and cannot be
substituted: the first is an `HTTPInterceptor`, the second a
`MethodInterceptor`. `@ndigo/http` also exports a `CacheInterceptor` whose name
reads as the caching capability, although it is an HTTP-phase interceptor and
`@ndigo/cache` owns `@cached`. Unqualified names force every import site to
alias and every reader to check the package.

**Rule:** an interceptor type is named `<Qualifier>Interceptor`, where the
qualifier names the execution surface:

| Suffix                    | Pipeline             | Contract                                      |
| :------------------------ | :------------------- | :-------------------------------------------- |
| `MethodInterceptor`       | advised method calls | `invoke(invocation, next)`                    |
| `HTTPInterceptor`         | HTTP exchange        | phase hooks on request/response               |
| `RouteHandlerInterceptor` | route handling       | `preHandle` / `postHandle` / `completeHandle` |
| `ServiceInterceptor`      | service client calls | request/response phases                       |

Concrete implementations prefix the qualifier with what they do:
`RetryMethodInterceptor`, `AuditMethodInterceptor`,
`TracingMethodInterceptor`. If the pipeline is unambiguous from the package (the
package only exports one pipeline), the qualifier may be omitted; the collision
case may not.

### Decorators are named by role, never by mechanism

`@retry` is not `@methodAdvice`; `@cached` is not `@cacheTransformer`. The
decorator taxonomy fixes the name by the annotated element's role, and the
published page does not add a second naming rule. A decorator that changes
mechanism keeps its name.

### Banned names

| Banned                                            | Why                                                                                           |
| :------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| `Pointcut`, `JoinPoint`                           | AOP vocabulary with no Ndigo equivalent; `Matchable` and `MethodInvocation` are the contracts |
| `Aspect`                                          | Names a rejected library shape; use "rule" or "interceptor"                                   |
| `Advice` as a decorator name                      | "advice" names execution, not declaration                                                     |
| `Annotation` as a naming category                 | The taxonomy's category is **Bindings & exposures**                                           |
| `Interceptor` unqualified when a collision exists | Two `RetryInterceptor`s already prove the cost                                                |
| `apply`, `call`, `bind` as public API names       | Reserved by `Function.prototype`; they shadow the intrinsic methods                           |

### `AdviceOrder`

Named numeric bands in `@ndigo/advice`. Contributors use the constants, never
literals, so a band can be repositioned once instead of at every call site.

## Glossary

| Term                   | Definition                                                                                     | Not a synonym for                                             |
| :--------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| **Decorator**          | The `@expression` syntax attached to a class or member.                                        | Annotation, advice, member transformer                        |
| **Annotation**         | A definition-time metadata write that has no execution effect.                                 | Decorator (it is one possible product), advice                |
| **Advice**             | A wrapper around a call, selected by a rule and installed by an executor.                      | Annotation, decorator, member transformer                     |
| **Interceptor**        | An advice implementation for a specific pipeline.                                              | Advice in general; an interceptor is one kind                 |
| **Rule**               | `{ when, use, order }` — the composition of a matcher with an interceptor.                     | Pointcut, aspect                                              |
| **Matcher**            | A `Matchable<T>` predicate.                                                                    | Pointcut; there is no expression language                     |
| **Member transformer** | A decorator that returns a replacement member. Also **wrapper** in prose.                      | `HTTPTransformer` (payload conversion)                        |
| **Weaving**            | Installing advice on an instance. A verb; not a package or type name.                          | Interception as a noun; prefer "advice"                       |
| **Plan**               | The compiled per-method list of matched, validated, ordered interceptors.                      | The registry; the plan is a snapshot, the registry is mutable |
| **Registry**           | The mutable collection of rules an application contributes.                                    | Plan                                                          |
| **Transformer**        | Payload conversion (`HTTPTransformer`). The member mechanism is always **member transformer**. | Member transformer                                            |

If a sentence needs one of the banned terms to be true, the sentence is
describing a different framework.

## Open questions

| Question                                                       | Status                                                         |
| :------------------------------------------------------------- | :------------------------------------------------------------- |
| Can an application override an annotation's value per context? | Deferred — an optional overlay, not a requirement of the model |

Resolved questions are recorded where they belong: `@transactional` joins an
open boundary rather than nesting, `@preInit` fronts
`processBeforeInitialization`, destruction processors run in reverse
registration order, and `@cached` is advice (`CachedInterceptor`).
