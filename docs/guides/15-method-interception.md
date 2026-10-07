# Guide 15 — Method Interception & Resilience

How `@blue/proxy` and `@blue/resilience` work together: metadata-only method
annotations, interceptor chains around managed methods, standalone weaving
for service clients, and the retry + circuit-breaker policies on top.

The design: Spring-style interception _without_ an AOP language. JavaScript's
`Proxy` is the machinery; annotations are the selection contract; interceptors
are plain objects that decide, in code, what runs around a call.

## 1. Quickstart

Declare policy as **metadata-only annotations** — they never replace or wrap
the method:

```ts
import { methodAnnotation } from '@blue/proxy';

export const audited = methodAnnotation<{ action: string }>('audited');

class OrderService {
    @audited({ action: 'order.place' })
    place(order: string): string {
        return `ok:${order}`;
    }
}
```

Attach an interceptor that reads that metadata, and register it on the
application:

```ts
import { ApplicationBuilder } from '@blue/boot';
import { interception, type MethodDescriptor, type MethodInvocation, type MethodInterceptor } from '@blue/proxy';

class AuditInterceptor implements MethodInterceptor {
    #entries: string[] = [];

    matches(method: MethodDescriptor) {
        return method.annotation(audited) !== undefined;
    }

    invoke(invocation: MethodInvocation, next: () => unknown) {
        const spec = invocation.annotation(audited);
        if (spec !== undefined) {
            this.#entries.push(`${spec.action}:${String(invocation.methodName)}`);
        }
        return next(); // run the method
    }
}

const audit = new AuditInterceptor();
const builder = new ApplicationBuilder([NodeAppConfiguration]).processors(interception([audit])); // advised before any entry is created
```

Registered beans whose methods carry `@audited` are replaced by one proxy;
every other entry keeps its identity. This is the `apps/04-blue-api` demo gate
(AD-42 D-8).

## 2. The interceptor contract

```ts
interface MethodInterceptor {
    readonly order?: number; // lower runs outer; ties keep registration order
    matches(method: MethodDescriptor): boolean; // called once per managed method at weave time
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}
```

- `next()` runs the rest of the chain, ending in the installed method with
  the **real instance** as `this`. Not calling `next()` short-circuits the
  call (the caching pattern).
- `next()` is **re-entrant**: around-advice may invoke it again — that is
  the retry pattern (each re-entry re-runs the remaining chain). Advice that
  must not re-execute guards its own state.
- What you return is what the caller gets. `unknown` is deliberate: the
  chain does no implicit promise handling. Interceptors that need a call
  _outcome_ (retry, circuit breaker) are `async` and `await next()`
  themselves — outer advice still models their result as a value.
  One consequence: an **async interceptor in the chain turns a sync method
  into a Promise-returning call** through the proxy, with no type-level
  signal (annotations are invisible to the type system). Prefer advising
  Promise-returning methods.
- Ordering is a stable sort on `order`; the annotation is read with
  `invocation.annotation(key)`, resolved from the declaring class
  (inheritance: nearest declaration wins).

## 3. Weaving semantics

One `Proxy` per advised entry, wrapping **every** prototype method:

- Intercepted keys → cached wrapper running the chain; sibling methods →
  target-bound pass-through wrapper. Both invoke the installed (possibly
  decorated) method — never a saved "original" — so
  `@traced`/`@cached`/`@transactional` inside a managed class keep working
  inside the proxy.
- `#private` fields work: methods always run with the real instance as
  `this`, never the proxy.
- **Self-invocation bypasses advice** (`this.method()` inside the class
  skips the chain) — the documented target-bound boundary. Method-wrapper
  decorators do _not_ have this boundary; that is why they are not migrated
  onto the chain (AD-42 D-6).
- No proxy when nothing matches: unadvised entries keep `===` identity, and
  already-woven instances pass through unchanged (idempotent).

## 4. Registration paths

| Path                                       | When                                                           | API                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application apps                           | Recommendation: processor registered before the eager creation | `builder.processors(interception([...]))` (ADR-43 finding: constructor entries are eagerly created at refresh end — the builder registers before that) |
| Prepared context / factory                 | You already hold a context or `ConfigurableFactory`            | `context.addProcessor(interception([...]))` — covers values created _after_ the call                                                                   |
| Hand-constructed objects (service clients) | No container involved                                          | `interceptMethods(instance, interceptors)` — weaves any object; the instance is described under its class name                                         |

Register **at most one** `interception(...)` processor and combine all
interceptors in that single call: `builder.processors(...)` replaces earlier
registrations, and a second `interception(...)` processor fails loudly when
it meets an already-woven entry instead of silently dropping advice.

Standalone example:

```ts
const api = interceptMethods(serviceClient(IslandPushAPI, new HTTP()), [
    new CircuitBreakerInterceptor(),
    new RetryInterceptor(),
]);
```

## 5. Resilience policies (`@blue/resilience`)

```ts
import { retry, circuitBreaker, RetryInterceptor, CircuitBreakerInterceptor } from '@blue/resilience';
import { fixedBackoff, exponentialBackoff } from '@blue/resilience';

class PushAPI {
    @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 100, factor: 2, maxMs: 2_000 }) })
    @circuitBreaker({ failureThreshold: 5, resetMs: 10_000 })
    push(payload: Payload): Promise<void> {}
}
```

- **Retry** re-invokes `next()` on failure up to `attempts` (default 3),
  awaiting the configured backoff between attempts, and re-throws the final
  error. `retryable(error)` restricts which errors are retried —
  **idempotency is the caller's contract**; a non-idempotent call must pass
  a restrictive predicate. The default predicate retries every error
  _except_ `CircuitOpenError`, so retry backoff never beats an open circuit.
  Default backoff is no delay (`fixedBackoff(0)`);
  backoffs are plain functions so tests inject deterministic delays.
- **Circuit breaker** keeps per-(entry, method) state: `failureThreshold`
  consecutive failures open the circuit (calls fail fast with
  `CircuitOpenError`); after `resetMs` the next call becomes a single probe —
  success closes it, failure re-opens it with a fresh window.
- Compose **circuit outside retry** (`[circuit, retry]`): the circuit counts
  one failure per chain pass, not per retry attempt.

### Verified boundaries (2026-10-04, AD-43)

- The interceptors live in the **exception path**. `HTTP.request` never
  throws — transport failures resolve as `ResponseError` _values_ — so
  retry/circuit breaker see only errors callers actually throw. The real
  service-layer throw is response-schema validation (`IllegalStateError`);
  transport-level retry (status codes, `Retry-After`) already exists in
  `@blue/http` and layers underneath.
- **Stream calls** (`stream: true`) return their generator at call time —
  iteration failures are outside call-level interception. Retry a stream's
  _establishment_ only.

## 6. What interception is not

| Not provided                                                 | Reason                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Migration of `@cached`/`@traced`/`@transactional`            | They intercept self-invocation and degrade without wiring — a different contract (AD-42 D-6) |
| Property/field traps, constructor interception               | Explicit non-goals (AD-42 D-7)                                                               |
| AspectJ pointcuts, introductions, `@Primary`-style selection | Not applicable to the metadata contract (AD-42)                                              |
| Transport-level retry / status classification                | Lives in `@blue/http`; the layers compose (AD-43 D-8)                                        |

## References

- Interception: [AD-42](../decisions/2026-10-03_AD42_METHOD_INTERCEPTION.md),
  plan `docs/plans/2026-10-03_METHOD_INTERCEPTION.md`
- Resilience: [AD-43](../decisions/2026-10-04_AD43_RETRY_AND_CIRCUIT_BREAKER.md),
  plan `docs/plans/2026-10-04_RETRY_AND_CIRCUIT_BREAKER.md`
- Demo gates: `apps/04-blue-api` (audit), `packages/blue-service`
  (`service-client-resilience.spec.ts`)
- Packages: `@blue/proxy`, `@blue/resilience`
