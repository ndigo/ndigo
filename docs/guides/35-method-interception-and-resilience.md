# Guide 35 — Resilience & Retries

How `@ndigo/advice` and `@ndigo/resilience` work together: annotations that
declare policy, rules that select the methods they apply to, and the retry and
circuit-breaker advice on top.

The design: an annotation writes metadata and stops. A rule pairs a matcher
with an interceptor, and the runtime compiles the rules into one advice chain
per method. Nothing here is an AOP language — a matcher is a predicate, an
interceptor is a plain object with an `invoke` method.

**Audience:** Node application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) · **Reference app:** [apps/15-ndigo-resilience-lab](https://github.com/ndigo/ndigo/tree/main/apps/15-ndigo-resilience-lab), [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Declare an annotation and read it back.
- Select methods with a matcher instead of inside the interceptor.
- Advise container entries and hand-built objects the same way.
- Order independently authored rules predictably.
- Apply retry, backoff, and circuit breaking.

## 1. Quickstart

An annotation declares; it never replaces or wraps the method:

```ts
import { methodAnnotation } from '@ndigo/core';

export const audited = methodAnnotation<{ action: string }>('orders:audited');

class OrderService {
    @audited({ action: 'order.place' })
    place(order: string): string {
        return `ok:${order}`;
    }
}
```

A rule says what runs around the methods a matcher selects:

```ts
import { ApplicationBuilder } from '@ndigo/boot';
import { hasAnnotation, interception, MethodInterceptorRegistry } from '@ndigo/advice';
import type { MethodInvocation, MethodInterceptor } from '@ndigo/advice';

class AuditInterceptor implements MethodInterceptor {
    #entries: string[] = [];

    invoke(invocation: MethodInvocation, next: () => unknown) {
        const spec = invocation.annotation(audited);
        if (spec !== undefined) {
            this.#entries.push(`${spec.action}:${String(invocation.methodName)}`);
        }
        return next(); // run the method
    }
}

const rules = new MethodInterceptorRegistry().add({
    when: hasAnnotation(audited),
    use: new AuditInterceptor(),
});

const builder = new ApplicationBuilder([NodeAppConfiguration]).processors(interception(rules));
```

Entries whose methods match are advised in place; every other entry keeps its
identity and pays nothing per call. This is the
[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)
demo gate.

## 2. The two contracts

Declaration — how a value gets onto a class:

```ts
const audited = methodAnnotation<{ action: string }>('orders:audited');
const scheduled = classAnnotation<{ cron: string }>('app:scheduled');
```

The key grammar is `<namespace>:<name>`, and the namespace names the
**declaring** package — `resilience:retry`, not `core:retry`. `annotationOf`
walks the class hierarchy, so an inherited declaration resolves and the
nearest declaration wins.

Execution — how a value turns into behaviour:

```ts
interface MethodInterceptor {
    readonly order?: number; // the capability's natural band; a rule overrides it
    validate?(method: MethodDescriptor): void; // once, while the plan compiles
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}

interface MethodInterceptorRule {
    when?: Matchable<MethodDescriptor>; // omitted matches every method
    use: MethodInterceptor;
    order?: number; // rule-level band, overriding the interceptor's own
}
```

- Selection lives in the rule, not the interceptor. Two features can advise
  the same method without either knowing about the other.
- `validate` runs once per matched method at plan compile, so a malformed
  annotation fails at startup instead of on the first call.
- `next` runs the rest of the chain, ending in the installed method with the
  **real instance** as `this`. Not calling `next` short-circuits the call
  (the caching pattern).
- `next` is **re-entrant**: around-advice may invoke it again — that is the
  retry pattern (each re-entry re-runs the remaining chain). Advice that must
  not re-execute guards its own state.
- What you return is what the caller gets. `unknown` is deliberate: the chain
  does no implicit promise handling. Interceptors that need a call _outcome_
  (retry, circuit breaker) are `async` and `await next` themselves — outer
  advice still models their result as a value. One consequence: an **async
  interceptor in the chain turns a sync method into a Promise-returning
  call**, with no type-level signal (annotations are invisible to the type
  system). Prefer advising Promise-returning methods.

## 3. Weaving strategies

Shadow weaving is the default for objects: each advised method gets a
non-enumerable own property on the instance that runs the chain and then calls
the previously installed function with the instance as receiver.

That buys two properties a `Proxy` cannot offer at the same time — and keeps a
third that `Proxy` also has:

- **Identity is preserved.** `service === wrapped` is true, so `WeakMap` keys,
  `instanceof`, and container singletons behave as before.
- **Self-invocation is advised.** `this.other()` resolves the own wrapper
  first, so a nested call runs the sibling's advice too.
- **`#private` fields work**, because the instance is always the receiver.

The `Proxy` fallback exists for targets that cannot accept own properties, and
it gives the first two up while keeping the third:

| Strategy | Chosen when                                                            | Identity preserved | Self-invocation advised |
| -------- | ---------------------------------------------------------------------- | ------------------ | ----------------------- |
| Shadow   | The instance accepts own properties                                    | Yes                | Yes                     |
| Proxy    | Frozen, sealed, non-extensible, or a function target (service clients) | No                 | No                      |
| None     | No rule matched a method                                               | Yes                | —                       |

When nothing matches, the instance is returned untouched and is never
revisited. `planFor(instance, rules)` reports what would be advised without
weaving anything.

A wrapped method answers introspection exactly like the one it replaced —
`length`, `name`, and `toString()` read the declared method — so framework code
that reads a signature (argument binding resolves `@parameters` names from the
function source) is unaffected by advice.

An annotated method that no rule claims is a silent omission, so the container
processor warns **once per class**, naming the methods and the fix.

## 4. Registration paths

| Path                       | When                                                | API                                                                                                                                          |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Application apps           | Register before eager creation                      | `builder.processors(interception(rules))` — constructor entries are eagerly created at refresh end, so the builder must register before that |
| Prepared context / factory | You already hold a context or `ConfigurableFactory` | `context.addProcessor(interception(rules))` — covers values created _after_ the call                                                         |
| Hand-constructed objects   | No container involved                               | `interceptMethods(instance, rules)`                                                                                                          |
| Construct and advise       | No container involved                               | `createIntercepted(OrderService, rules, ...args)`                                                                                            |

Register **at most one** `interception(...)` processor. Features contribute
rules to its registry rather than registering processors of their own; a
second processor fails loudly when it meets an already-advised entry instead
of silently dropping advice. Because the registry is read at weave time, a
feature that registers after the processor was installed still applies to
entries created later.

**"Created later" is the load-bearing part.** A plan is compiled once, when the
entry is created, so a rule contributed _after_ that moment never reaches it —
two features compose on a method only if both have contributed by the time the
entry exists. Registration order therefore matters as much as `order` does:
`order` decides nesting, registration timing decides whether a rule applies at
all.

Standalone example:

```ts
import { hasAnnotation, interceptMethods } from '@ndigo/advice';
import { circuitBreaker, CircuitBreakerInterceptor, retry, RetryInterceptor } from '@ndigo/resilience';

const api = interceptMethods(serviceClient(IslandPushAPI, new HTTP()), [
    { when: hasAnnotation(circuitBreaker), use: new CircuitBreakerInterceptor() },
    { when: hasAnnotation(retry), use: new RetryInterceptor() },
]);
```

## 5. Ordering

Lower numbers run closer to the caller. `AdviceOrder` names the bands so
independently authored rules interleave predictably instead of guessing
numbers relative to every other feature:

| Band            | Value | Concern                                                                            |
| --------------- | ----- | ---------------------------------------------------------------------------------- |
| `Observability` | 100   | Traces, metrics, logging — must observe retries, not be re-run by them             |
| `Resilience`    | 200   | Retry and circuit breaking                                                         |
| `Transaction`   | 300   | Transaction boundaries — inside resilience, so each retry gets a fresh transaction |
| `Application`   | 400   | Feature-specific policy                                                            |
| `Innermost`     | 500   | Closest to the method                                                              |

A rule that names no order — and whose interceptor names none either — lands in
`AdviceOrder.Application`. Sorting is stable on the effective order
(`rule.order ?? use.order ?? DEFAULT_ADVICE_ORDER`), so equal orders keep
registration order and later registrations nest inside earlier ones.
`matchAll`, `matchAny`, and `matchNot` compose matchers.

The shipped capabilities name their own band, so registering them needs no
numbers: `TracedInterceptor` and `CountedInterceptor` sit in `Observability`,
`RetryInterceptor` and `CircuitBreakerInterceptor` in `Resilience`,
`TransactionalInterceptor` in `Transaction`, and `CachedInterceptor` in
`Application`.

## 6. Resilience policies (`@ndigo/resilience`)

```ts
import { retry, circuitBreaker, RetryInterceptor, CircuitBreakerInterceptor } from '@ndigo/resilience';
import { fixedBackoff, exponentialBackoff } from '@ndigo/resilience';

class PushAPI {
    @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 100, factor: 2, maxMs: 2_000 }) })
    @circuitBreaker({ failureThreshold: 5, resetMs: 10_000 })
    push(payload: Payload): Promise<void> {}
}
```

- **Retry** re-invokes `next` on failure up to `attempts` (default 3),
  awaiting the configured backoff between attempts, and re-throws the final
  error. `retryable(error)` restricts which errors are retried —
  **idempotency is the caller's contract**; a non-idempotent call must pass a
  restrictive predicate. The default predicate retries every error _except_
  `CircuitOpenError`, so retry backoff never beats an open circuit. Default
  backoff is no delay (`fixedBackoff(0)`); backoffs are plain functions so
  tests inject deterministic delays.
- **Circuit breaker** keeps per-(entry, method) state: `failureThreshold`
  consecutive failures open the circuit (calls fail fast with
  `CircuitOpenError`); after `resetMs` the next call becomes a single probe —
  success closes it, failure re-opens it with a fresh window.
- Compose **circuit outside retry** (the registration order above): the
  circuit counts one failure per chain pass, not per retry attempt.

Both policies validate their spec through `validate`, so `attempts: 0` or
`resetMs: NaN` fails while the plan is compiled — at startup, not on the first
call. Both also declare `AdviceOrder.Resilience`, so composing them needs no
numbers: register the circuit first and it wraps retry.

### Verified boundaries

- The interceptors live in the **exception path**. `HTTP.request` never
  throws — transport failures resolve as `ResponseError` _values_ — so
  retry/circuit breaker see only errors callers actually throw. The real
  service-layer throw is response-schema validation (`IllegalStateError`);
  transport-level retry (status codes, `Retry-After`) already exists in
  `@ndigo/http` and layers underneath.
- **Stream calls** (`stream: true`) return their generator at call time —
  iteration failures are outside call-level advice. Retry a stream's
  _establishment_ only.
- Service clients are function-shaped targets, so they are advised through the
  `Proxy` fallback: their advice does not cover self-invocation.

## 7. Advice that used to wrap

`@cached`, `@traced`, `@counted`, and `@transactional` used to replace the
method they decorated. They now declare, and an interceptor runs them:

| Annotation       | Interceptor                | Note                                                                                                              |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@cached`        | `CachedInterceptor`        | Single-flight; needs a `cacheManager` on the instance, else it calls through                                      |
| `@traced`        | `TracedInterceptor`        | Stays synchronous — opens a span and returns the method's own result                                              |
| `@counted`       | `CountedInterceptor`       | Stays synchronous — records, then runs the method                                                                 |
| `@transactional` | `TransactionalInterceptor` | Joins an open boundary instead of nesting, because both transaction managers reject an already-active transaction |

A plain `new Service()` with any of them is inert. That is the point: the
declaration and the runtime are separable, so a unit test can construct the
class without a container and a production bootstrap can advise it. The rule
each one needs is a two-liner — `{ when: hasAnnotation(tracedSpan), use: new
TracedInterceptor() }` and so on; §5 lists the bands they occupy.

`@transactional` is the one whose semantics change beyond registration: a
transactional method that calls another transactional method **joins** the open
boundary. Both transaction managers reject an already-active transaction, so
nesting would have thrown where the caller expected a working composite
operation.

## 8. What advice is not

| Not provided                                                 | Reason                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Property/field traps, constructor interception               | Explicit non-goals                                                         |
| AspectJ pointcuts, introductions, `@Primary`-style selection | Not applicable to the metadata contract                                    |
| Transport-level retry / status classification                | Lives in `@ndigo/http`; the layers compose                                 |
| A string pointcut language                                   | A matcher is a predicate over a descriptor — code, checked by the compiler |

## See also

- Declaration: `@ndigo/core` (`methodAnnotation`, `classAnnotation`, `annotationOf`)
- Execution: `@ndigo/advice`
- Resilience: `@ndigo/resilience`
- The model in full: [Annotation, advice, and member transformers](../architecture/annotation-and-transformer-model.md)
- Demo gates: [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api) (audit, caching), `packages/ndigo-service` (`service-client-resilience.spec.ts`)
