# Annotation, Advice & Member Transformer

Three mechanisms add behaviour to a class member, and Ndigo keeps them
separate on purpose:

| Mechanism              | Answers                                       | Installed at    | Owned by             |
| :--------------------- | :-------------------------------------------- | :-------------- | :------------------- |
| **Annotation**         | _What does this member declare about itself?_ | Definition time | The declaring class  |
| **Advice**             | _What runs around the call, and who decides?_ | Weave time      | The application      |
| **Member transformer** | _What replaces the member?_                   | Definition time | The decorator itself |

A **decorator** is syntax. It may produce an annotation, a member transformer,
or both — but it is never a synonym for either. This page fixes that
vocabulary, states the contract for each mechanism, and records which existing
decorator uses which one.

The model is deliberately **Option C**: annotations declare on the class, and
the application context — not the decorator — composes the executors. The
programmatic path is a first-class primitive, not a compatibility shim: every
capability reachable through a container is reachable by hand.

> **Status.** This page describes the current model, not a migration path. The
> tree runs `@ndigo/advice`; `@ndigo/proxy` is gone, no annotation writes a
> `proxy:` key, selection lives on the rule, and shadow weaving is the default
> strategy. The **inventory** in §8 reflects the current tree.

**Audience:** Framework contributors and package authors · **Related:**
[STYLE_GUIDE §3.17 — decorator categories and naming](../../STYLE_GUIDE.md#317-decorator-categories--naming),
[Guide 35 — method advice and resilience](../guides/35-method-interception-and-resilience.md)

## 1. One vocabulary, several axes

Three questions get confused constantly, so they are answered on separate axes:

1. **Role** — what does the name describe? A stereotype, a condition, a
   registration, a policy, a binding. Answered by the decorator taxonomy in
   [STYLE_GUIDE §3.17](../../STYLE_GUIDE.md#317-decorator-categories--naming).
2. **Mechanism** — what does the decorator actually do at runtime? Annotation,
   advice, or member transformation. Answered by this page.
3. **Pipeline** — which execution surface consumes it? Method calls, HTTP
   exchanges, route handling, or service clients. Answered by the qualified
   interceptor names in [§9](#9-naming-one-vocabulary-qualified-by-pipeline).

The axes are orthogonal. `@retry` is a **policy** (role), an **annotation**
(mechanism), consumed by **method advice** (pipeline). None of those three
statements implies another, and a decorator that changes mechanism never needs
to change its name.

> **Why this page exists.** The predecessor model let one decorator write
> metadata, wrap the method, or both, with no way to tell which from the call
> site. Selection and validation were fused into
> `MethodInterceptor.matches`, so a policy could not be validated without also
> deciding where it applied. Central policy required editing every method.
> The split below removes those couplings; the member transformer keeps the
> definition-time path for everything that genuinely belongs there.

### Choosing a mechanism

| Situation                                                              | Use                                                     |
| :--------------------------------------------------------------------- | :------------------------------------------------------ |
| Another package reads a fact about the member (routing, ORM, auth)     | **Annotation alone**                                    |
| Central policy that must be configured, ordered, replaced, or disabled | **Annotation + advice**                                 |
| Opt-in per member, must work with no container and no runtime wiring   | **Annotation + member transformer** (or just a wrapper) |
| Behaviour around a whole request, not one method                       | A pipeline interceptor — not method advice              |

If a capability only works inside a container, that is a design bug in the
capability, not a property of the model. [§7](#7-running-by-hand) is the
acceptance test.

### Choosing a consumption seam

The table above says what a decorator _is_. This one says how a declaration
reaches whatever acts on it, because that choice is what a capability author
actually makes — and there are exactly two answers.

| Category      | Consumer                                                  | Lives in                              | Contract                                              |
| :------------ | :-------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------- |
| **Processor** | Hook on each entry instance as the container creates it   | `@ndigo/factory` `entry-processor.ts` | `InitializationAwareProcessor` and its siblings       |
| **Lifecycle** | Component the context drives, scanning the finished graph | `@ndigo/factory` `lifecycle.ts`       | `ManagedLifecycle` (+ `Initializable`, `Destroyable`) |

Pick **processor** when the declaration changes what an instance _is or does_,
and the decision is per instance. Advice is the only current consumer: it must
decide whether any rule matches and return a replacement for that instance,
which is exactly `processAfterInitialization`'s contract.

Pick **lifecycle** when the declaration contributes a fact to a _whole-graph
table_ that is read once, and the consumer also has resources to start and stop.
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
scanning consumer resolves its collaborators _at start_ — `ScheduleRegistry.start()`
looks up the `taskScheduler` entry and throws when it is absent — so it must run
after every entry exists. A processor runs during creation, where that
collaborator may not exist yet, which is why the two cannot be swapped freely.

They compose. The schedule registry captures `owner[methodName]` while scanning,
and advice wove that instance earlier, so a `@scheduled` + `@traced` method
reaches the woven method through the registry's own closure
(`apps/17-ndigo-telemetry-lab/test/scheduled-advice.spec.ts`).

> **Names, resolved.** The framework-inherited names were deliberately renamed:
> `ManagedLifecycle` (was `SmartLifecycle` — the `Smart-` prefix was jargon)
> and `LifecycleCoordinator` (was `LifecycleProcessor` — a driver of lifecycle
> components, not a processor in the `EntryProcessor` sense).
>
> The word also names other things elsewhere: `@ndigo-orm`'s entity
> persistence hooks (`prePersist`, `postLoad`, …) live in `entity-hooks.ts`
> with `EntityHook*` names after the same consolidation, and guide 20's “The
> lifecycle” is the migration pipeline. This page's **Lifecycle** row
> describes only the container's.

## 2. Annotations — declaration only

An annotation writes a value into the class's `Symbol.metadata` record and
returns the target unchanged. It **never runs**, wraps, or reorders anything.
A member with annotations but no executor behaves exactly like a member with no
annotations at all.

```ts
import { methodAnnotation, annotationOf } from '@ndigo/core';

export const audited = methodAnnotation<{ action: string }>('audited');

class OrderService {
    @audited({ action: 'order.submit' })
    submit(): void {}
}

annotationOf(OrderService, audited, 'submit'); // { action: 'order.submit' }
```

### The contract

```ts
type AnnotationDecorator =
    | ((target: unknown, context: ClassDecoratorContext) => void)
    | (<M extends Function>(target: M, context: ClassMethodDecoratorContext) => M);

interface AnnotationKey<T> {
    /** Namespace-stable key, e.g. `"resilience:retry"`. */
    readonly key: string;
    /** The `<name>` segment, e.g. `"retry"`. */
    readonly name: string;
    /** The decorator factory: writes the value, leaves the target unchanged. */
    (value: T): AnnotationDecorator;
}

function methodAnnotation<T>(name: string): AnnotationKey<T>;
function classAnnotation<T>(name: string): AnnotationKey<T>;
function annotationOf<T>(target: unknown, key: AnnotationKey<T>, member?: PropertyKey): T | undefined;
```

- `methodAnnotation` / `classAnnotation` are the only writers. Both validate
  the decorator context kind and throw a `TypeError` naming the decorator.
- `annotationOf` is the only reader. With no `member`, it reads the class-level
  key; with a member name, it walks the class hierarchy and returns the nearest
  declaration.
- Values are arbitrary data. A `boolean` is a valid annotation value; so is a
  normalized spec object. Validation of that value belongs to the **reader**
  (or to `MethodInterceptor.validate`), not to the writer — the writer cannot
  know which executor will consume it.

### Key grammar

```
<namespace>:<name>            class annotation
<namespace>:<name>:<member>   member annotation
```

- The **namespace names the package that declares the annotation**, never the
  package that executes it. `@retry` is `resilience:retry` even though method
  advice runs it; `@cached` is `cache:cached` even though the cache manager
  owns the store.
- The member segment is `String(member)`. Symbols are not annotated.
- Inheritance is resolved by walking `Object.getPrototypeOf` on the class, so a
  subclass inherits its parent's declarations without copying metadata. The
  nearest declaration wins.
- The namespace is a **public contract**: renaming a decorator variable must
  not break a reader. That is why the key is stored on the `AnnotationKey`
  object instead of being re-derived at the call site.

### Rules

1. An annotation decorator returns the target unchanged. If it returns a
   replacement, it is a member transformer that also happens to write metadata.
2. An annotation has no default executor. Shipping an annotation without
   documenting who reads it is an incomplete feature.
3. Annotations are not registered. There is no global annotation list to
   mutate; discovery is a metadata read on a class the caller already has.
4. Cross-package readers use `annotationOf`, never the raw key. Direct
   `getSymbolMetadata(...)['ns:name']` reads are reserved for the declaring
   package.

The primitives live in `@ndigo/core` (`metadata.ts`, `matchable.ts`) because
core already owns `getSymbolMetadata` and `Matchable` — the two things every
declaration layer needs.

## 3. Advice — execution supplied by the application

Advice is a wrapper installed around a matched method. It is not part of the
class definition: the class declares, and the application supplies the
behaviour.

```ts
interface MethodInterceptorRule {
    /** Which methods this advice applies to. Omitted = every woven method. */
    readonly when?: Matchable<MethodDescriptor>;
    /** The advice implementation. */
    readonly use: MethodInterceptor;
    /** Position relative to other rules. Omitted = `AdviceOrder.Application`. */
    readonly order?: number;
}

interface MethodInterceptor {
    /** Validates this interceptor against a matched method, once per weave. */
    validate?(method: MethodDescriptor): void;
    /** Runs around the call. */
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}
```

```ts
registry.add({
    when: hasAnnotation(retry),
    use: new RetryInterceptor(),
    order: AdviceOrder.Resilience,
});
```

`hasAnnotation` — defined in [§6](#6-selection) — is the common matcher factory.
The registry is where independently-discovered rules accumulate; nothing is
woven until the plan is compiled.

### Selection lives on the rule

`MethodInterceptor` has **no `matches` method**. Selection is a property of the
composition (`when`), not of the implementation (`use`). One interceptor can be
registered twice with different matchers, and a test can exercise it against a
descriptor without inventing a second class.

`when` is a `Matchable<MethodDescriptor>` — the same contract the router uses
for paths and the dispatcher uses for route conditions. There is no new
`Pointcut` type and no expression language:

```ts
import { matchAll, matchAny, matchNot } from '@ndigo/core';

when: matchAll(hasAnnotation(audited), matchNot(hasAnnotation(noAudit)), (method) => method.methodName !== 'health');
```

`matchAll`, `matchAny`, and `matchNot` are combinators that live beside
`Matchable` in `@ndigo/core`. Predicates are code; they compose like functions
and fail at compile time when the shape is wrong.

### Validation is separate from selection

`validate?` is called **once per (method, interceptor) pair when the weave plan
is compiled**, before any call runs. It preserves the predecessor's
fail-loud-at-weave-time behaviour without fusing it into selection: a
`RetryInterceptor` can reject a malformed retry spec on a method it matched,
and a `CircuitBreakerInterceptor` can reject a missing breaker name — both
before traffic reaches the method.

`validate` throws. A throw aborts compilation, so a misconfigured policy never
silently degrades into an unadvised method.

### One processor per stage, never per feature

Features contribute **rules**, not processors. `@ndigo/resilience` registers
retry and circuit-breaker rules; `@ndigo/telemetry` registers tracing rules;
the application registers audit rules. All of them land in one
`MethodInterceptorRegistry`, are sorted once, and are installed by the single
weaver the preset registers through
`InitializationAwareProcessor.processAfterInitialization`.

This is the structural fix for the predecessor's worst failure mode: two
packages each registering their own weaving processor produced two independent
proxies, and code had to detect and reconcile them. A second weaver is now a
configuration error, not a supported arrangement.

### Ordering

Lower `order` runs closer to the caller (outermost). The rule's own `order`
wins; when it names none, the interceptor's band applies; when neither does,
the rule lands in `AdviceOrder.Application`. Ties keep registration order — the
sort is stable on core's `compareBy` + `numberComparator`, so the sequence of
`registry.add` calls is a deterministic tiebreaker:

```ts
registry.add({ when: hasAnnotation(audited), use: new AuditInterceptor(), order: AdviceOrder.Application });
registry.add({ when: hasAnnotation(retry), use: new RetryInterceptor(), order: AdviceOrder.Resilience });
registry.add({ use: new MetricsInterceptor(), order: AdviceOrder.Observability });
```

A registration helper may take one rule or an array; array order is
registration order.

`AdviceOrder` names the bands so an independently-discovered contributor can
pick a position without knowing the numbers:

| Band            | Position                | Rationale                                                          |
| :-------------- | :---------------------- | :----------------------------------------------------------------- |
| `Observability` | outermost               | Traces and metrics must see retries and their failures             |
| `Resilience`    | outside the transaction | A retry re-runs the whole transaction, not one statement inside it |
| `Transaction`   | inside resilience       | The boundary is the unit that retries                              |
| `Application`   | default                 | User policy with no stronger ordering requirement                  |
| `Innermost`     | closest to the body     | Work that must observe the final, already-decided call             |

Only the **relative** order of the bands is contractual. The numeric values
live in the `AdviceOrder` constant and may change without notice.

A shipped capability declares its natural band on the interceptor — the
telemetry advisories in `Observability`, resilience in `Resilience`, the
transaction boundary in `Transaction`, caching in `Application` — so the safe
arrangement is what an application gets without naming numbers. Order belongs
to the rule by default, but a capability's band is the safer default; the rule
still has the last word, because a composition is a decision.

### Composition order

```text
caller
  → Observability advice
    → Resilience advice
      → Transaction advice
        → member transformer (@cached, @traced, @transactional)
          → method body
```

Advice always wraps the **installed** member — never a saved "original" — so
member transformers inside the chain keep working. The reverse is not true: a
member transformer cannot see advice, which is why definition-time wrapping
cannot participate in central policy.

## 4. Member transformers — replacement at definition time

A member transformer returns a replacement for the member. It runs at class
definition time, has no selection step, and needs no runtime to work.

```ts
export function logged<This, Args extends unknown[], R>(
    target: (this: This, ...args: Args) => R,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>
): (this: This, ...args: Args) => R {
    context.metadata[`demo:logged:${String(context.name)}`] = true;
    return function (this: This, ...args: Args): R {
        console.log(String(context.name), args);
        return target.apply(this, args);
    };
}
```

The contract:

- The decorator **returns a function** (or an accessor descriptor) that
  replaces the member.
- The replacement must preserve `this` by applying the original with the
  caller's receiver: `target.apply(this, args)`.
- If the replacement changes the declared signature (a rest-args wrapper does),
  preserve the original under a `<key>:original` metadata entry so introspection
  and signature-based tooling still work. `@traced` does this today.
- The decorator may also write metadata. That makes it a **hybrid**: `@cached`
  and `@traced` are both an annotation and a member transformer, because the
  framework reads their metadata for introspection while the returned wrapper
  does the work.

### When a member transformer is the right answer

- The behaviour is opt-in per member and must run with no context, no
  registry, and no preset — a plain object in a unit test.
- The wrapper needs the original function value (signature introspection,
  `:original` metadata, argument names).
- The behaviour has a fixed position by nature and no plausible reordering —
  there is nothing to compose.

### When it is the wrong answer

- The behaviour must be enabled, disabled, configured, or reordered per
  application.
- The behaviour must apply to existing classes without editing them.
- The same behaviour must run on a method the class does not own.

Those are advice's job. Converting a member transformer to advice is a feature
change with a real trade-off (container coupling), not a refactor; do not do it
"for consistency".

## 5. The three executors

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
while the plan is compiled: `invocation.target.applicationContext` is `undefined`
during weaving and populated by the time any advised method runs. A matcher or a
`validate` implementation must therefore select on
`MethodDescriptor`/`targetType` — the static facts — and leave instance lookup to
`invoke`. Weaving itself does not depend on injection: shadow weaving installs
own wrappers, which the aware processor's property write does not disturb.

**Shadow weaving is the default for object instances.** The weaver installs the
advised methods as own properties on the instance, each wrapping the prototype
method. This:

- preserves identity — the caller keeps the same object, so `===`,
  `instanceof`, and caches keyed on the instance keep working;
- advises self-invocation — `this.helper()` hits the own property, so the
  advice applies to internal calls too;
- leaves the prototype untouched, so sibling instances are unaffected.

**Proxy weaving is the fallback**, used when shadow weaving cannot apply:

- the instance is frozen or sealed, or an own non-configurable property already
  occupies the member name;
- the target is a function — a class-shaped service client
  (`serviceClient(API, http)`) carries its method surface on the shared
  prototype, so per-instance shadowing would either mutate every instance or
  not work at all.

When no rule matches any method, no executor is applied and the instance is
returned unchanged.

The fallback is a real behavioural difference, not an implementation detail:
proxy weaving does **not** advise self-invocation and does **not** preserve
identity. Documentation for any capability that may fall back must state the
boundary.

> **Behaviour change from the predecessor.** `@ndigo/proxy` was Proxy-only, so
> self-invocation bypassed advice by construction. Under shadow weaving it no
> longer does. `@transactional` and `@retry` therefore change semantics on
> internal calls, which is why the migration is a breaking change and not a
> rename.

Shadow weaving mutates the instance's own property shape. That is a deliberate
trade: identity and self-invocation advice in exchange for one own property per
advised method. The cost is bounded by the number of advised methods, and
prototype-scoped entries pay it once per instance — the same order as the
instance itself.

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
`interceptMethods(new Ctor(...), rules)`.

Both are exported from the package root and documented as the supported path
for hand-constructed objects, tests, and service clients. They are not
"advanced" or "internal".

### Member transformation

Definition-time, per-decorator, no plan. Covered in [§4](#4-member-transformers--replacement-at-definition-time).

## 6. Selection

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

Prior art in the repository:
`MappedHandlerInterceptor extends AsPathMatcherFilter(Null)` already composes a
matcher with a handler, which is the same `{ when, use }` shape applied to the
route pipeline.

## 7. Running by hand

The acceptance test for the model is that every container capability has a
programmatic equivalent that a plain `node` script or a unit test can run.

**Declare without a container.** Annotations are written by decorators, but a
class does not need a context to carry them:

```ts
class OrderService {
    @retry({ attempts: 3 })
    async submit(): Promise<void> {}
}
```

**Execute without a container.**

```ts
import { AdviceOrder, interceptMethods, hasAnnotation } from '@ndigo/advice';

const service = interceptMethods(new OrderService(), [
    { when: hasAnnotation(retry), use: new RetryInterceptor(), order: AdviceOrder.Resilience },
]);

await service.submit();
```

**One interceptor, no framework at all.** `MethodInterceptor` is a plain
interface; a hand-written object satisfies it:

```ts
const audit: MethodInterceptor = {
    async invoke(invocation, next) {
        console.log(invocation.methodName, invocation.args);
        return next();
    },
};

const audited = interceptMethods(new OrderService(), [{ use: audit }]);
```

**Rule of thumb:** if a capability needs `createNodeApplication` to be
demonstrated, its documentation must also show the `interceptMethods` form. A
capability that cannot be demonstrated by hand is either mis-scoped or missing
an exported primitive.

## 8. The decorator inventory

Every decorator in the tree, by mechanism. "Hybrid" means the decorator writes
metadata **and** returns a replacement.

### Declaration-only

| Package                    | Decorators                                                                                                                                                                                                                                                                 |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ndigo/core`              | `@sharedDependency`, `@whenProperty`, `@whenProfile`, `@whenNode`, `@whenBrowser`, `@whenMissingEntry`                                                                                                                                                                     |
| `@ndigo/flags`             | `@whenFeature`                                                                                                                                                                                                                                                             |
| `@ndigo/context`           | `@configuration`, `@environment`, `@entry`, `@property`, `@defaultValue`, `@propertySource`, `@nestedConfig`                                                                                                                                                               |
| `@ndigo/factory`           | `@scope`                                                                                                                                                                                                                                                                   |
| `@ndigo/boot`              | `@configurationProperties`                                                                                                                                                                                                                                                 |
| `@ndigo/dispatcher`        | `@routeMapping` (`@publicMapping`/`@privateMapping`), `@getMapping`, `@postMapping`, `@putMapping`, `@deleteMapping`, `@patchMapping`, `@queryMapping`, `@socketMapping`, `@stompMapping`, `@toolMapping`, `@parameters`, `@validatedBy`, `@errorHandler`, `@errorMapping` |
| `@ndigo/openapi`           | `@apiDocs`                                                                                                                                                                                                                                                                 |
| `@ndigo/orm`               | `@entity`, `@column`, `@primaryColumn`, `@generatedColumn`, `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`, `@prePersist`, `@postLoad`, `@preUpdate`, `@postRemove`                                                                                                |
| `@ndigo/auth-core`         | `@authenticated`, `@authorized`, `@authorizedScopes`                                                                                                                                                                                                                       |
| `@ndigo/service`           | `@service`, `@getCall`, `@postCall`, `@putCall`, `@deleteCall`, `@patchCall`, `@queryCall`                                                                                                                                                                                 |
| `@ndigo/scheduler`         | `@scheduled`                                                                                                                                                                                                                                                               |
| `@ndigo/jobs`              | `@jobHandler`                                                                                                                                                                                                                                                              |
| `@ndigo/resilience`        | `@retry`, `@circuitBreaker` (declaration half — see below)                                                                                                                                                                                                                 |
| `@ndigo/platform-node`     | `@rateLimit` (policy SPI in `@ndigo/rate-limit`)                                                                                                                                                                                                                           |
| `@ndigo/view-webcomponent` | `@viewMapping`, `@tagMapping`                                                                                                                                                                                                                                              |
| `@ndigo/signals`           | `@signal`, `@computed`, `@effect` (see the note below)                                                                                                                                                                                                                     |

### Capabilities shipping declaration + advice

The decorator itself is declaration-only; the capability pairs it with advice
that ships in the same package.

| Package             | Declarations                | Shipped advice                                  | Pipeline |
| :------------------ | :-------------------------- | :---------------------------------------------- | :------- |
| `@ndigo/resilience` | `@retry`, `@circuitBreaker` | `RetryInterceptor`, `CircuitBreakerInterceptor` | Method   |
| `@ndigo/cache`      | `@cached`                   | `CachedInterceptor`                             | Method   |
| `@ndigo/telemetry`  | `@traced`, `@counted`       | `TracedInterceptor`, `CountedInterceptor`       | Method   |
| `@ndigo/orm`        | `@transactional`            | `TransactionalInterceptor`                      | Method   |
| (application)       | any `methodAnnotation`      | any `MethodInterceptor`                         | Method   |

A declaration-only policy becomes advice the moment a rule selects it. The
table classifies the shipped capability; the pairing is application code.

`TracedInterceptor` and `CountedInterceptor` stay synchronous on purpose:
marking them `async` would make every advised method return a promise the type
system cannot see. `TransactionalInterceptor` joins an open boundary instead of
nesting, because both transaction managers reject an already-active transaction.

### Annotation + member transformer (hybrid)

| Package          | Decorators          | Why the wrapper stays at definition time         |
| :--------------- | :------------------ | :----------------------------------------------- |
| `@ndigo/signals` | `@reactive` (class) | Rewrites accessors before field initializers run |

### Notes on the inventory

- **Every declaration-only decorator is consumed by exactly one seam.** Reading
  this table, the question "who acts on this?" has a two-way answer: a
  **processor** (per instance, as the container creates it) or a **lifecycle**
  component (whole graph, on refresh). [§1](#choosing-a-consumption-seam) lists
  which capability uses which, and why the choice is forced rather than
  stylistic.
- **`@signal` / `@computed` / `@effect`** are declaration-only, but their
  declarations do not live in `Symbol.metadata`. Two different facts are in
  play: _which_ members are reactive is a class-level fact and could live on the
  metadata record, while _the initial value_ is per instance and cannot — the
  record is per class.

    The construction handoff (the initial value, and the bound `@effect`
    methods) therefore lives on the instance itself, under the registered
    `Symbol.for('ndigo.signals.pending')`, non-enumerable and deleted once
    `@reactive` has drained it. It is scaffolding, not a registry: the
    post-construction registries (`signalMap`, `computedMap`, `effectDisposers`)
    stay invisible `WeakMap`s because they answer "which signals does this
    instance have" for its whole life.

    Moving the _declaration_ half onto `Symbol.metadata` needs a field/accessor
    annotation primitive beside `methodAnnotation`/`classAnnotation`, and no
    consumer reads it today — `@reactive` drains per-instance state and
    `getSignal` reads the registry. `@reactive` remains a member transformer
    regardless: it must redefine accessors during construction, which a
    post-construction executor cannot do.

- **`@retry` / `@circuitBreaker`** are declared in `@ndigo/resilience` and
  selected by `hasAnnotation(...)`. Their keys live in the `resilience:`
  namespace — the namespace names the declaring package, never the consumer.
- **`@rateLimit`** is declaration-only with two consumers: the platform HTTP
  pipeline for request limits and method advice for call limits. One
  declaration, two pipelines; that is the model working as intended.
- **`@errorHandler`** is declaration-only but its decorator is also a utility
  object (`errorHandler.has(...)`). The metadata is the contract; the helper
  methods are convenience.

## 9. Naming: one vocabulary, qualified by pipeline

### Interceptors are qualified by the pipeline they plug into

The repository currently exports a `RetryInterceptor` from both `@ndigo/http`
and `@ndigo/resilience`. They implement different contracts and cannot be
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
`TracingMethodInterceptor`. If the pipeline is unambiguous from the package
(the package only exports one pipeline), the qualifier may be omitted; the
collision case may not.

### Decorators are named by role, never by mechanism

`@retry` is not `@methodAdvice`; `@cached` is not `@cacheTransformer`. The
decorator taxonomy fixes the name by the annotated element's role, and this
page does not add a second naming rule. A decorator that changes mechanism
keeps its name.

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

## 10. Glossary

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

## 11. Coming from Spring, Angular, or Express

| Idea in the ecosystem           | Ndigo equivalent                                   | Divergence                                                                 |
| :------------------------------ | :------------------------------------------------- | :------------------------------------------------------------------------- |
| Spring `@Aspect` + `@Around`    | A `MethodInterceptorRule` with an interceptor      | No aspect class; rules are values, not annotated classes                   |
| Spring pointcut expression      | `Matchable<MethodDescriptor>`                      | Predicates are code; no expression parser                                  |
| Spring `@Transactional`         | `@transactional` (annotation + member transformer) | Reconciliation with method advice is a known open point                    |
| Spring `@Order` / `Ordered`     | `order` on the rule + `AdviceOrder` bands          | Ordering belongs to the composition, not the advice class                  |
| Angular HTTP interceptor        | `HTTPInterceptor`                                  | Same idea; phase hooks instead of a single `intercept(req, next)`          |
| Angular DI-provided interceptor | Rule with `use` resolved from the context          | Interceptors are context citizens, not module providers by default         |
| Express/Koa middleware          | `RouteHandlerInterceptor` or `HTTPInterceptor`     | Middleware chains are a pipeline concern; they do not advise class methods |
| NestJS `@UseInterceptors`       | Rule registration scoped by `when`                 | No per-route decorator array; selection is centralized                     |
| Java `InvocationHandler`        | `MethodInterceptor`                                | Same shape; `next` is explicit instead of a reflective `Method.invoke`     |

What is deliberately **not** adopted: pointcut languages, introductions
(inter-type declarations), constructor interception, property get/set
interception, and compile-time weaving. The framework rejected the first four
when the interception facility was designed; nothing in this model reopens
them.

## 12. Open questions

| Question                                                                   | Resolution                                                                                   |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| Does `@transactional` join an active transaction or self-invoke unadvised? | Resolved — nesting joins; self-invocation is advised                                         |
| Is `preInit` a real lifecycle stage, or covered by existing hooks?         | Resolved — `@preInit` fronts `processBeforeInitialization`; no new stage                     |
| Can an application override an annotation's value per context?             | Deferred — an optional overlay, not a requirement of the model                               |
| Does `@cached` move from member transformer to advice?                     | Deferred — only if per-application reconfiguration is required                               |
| Should destruction processors run in reverse registration order?           | Resolved — reverse of construction: processors reverse registration, values reverse creation |

Open questions do not block the vocabulary. Each is decided by the capability
that needs it.
