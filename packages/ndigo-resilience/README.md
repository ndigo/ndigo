# @ndigo/resilience

> Retry, backoff, and circuit-breaking policies for Ndigo, applied through `@ndigo/proxy` interceptors.

`@retry` and `@circuitBreaker` are metadata-only method annotations executed
by two interceptors: `RetryInterceptor` re-invokes the chain on failure with a
backoff policy, and `CircuitBreakerInterceptor` keeps per-method circuit state
and fails fast while a circuit is open. Both await `next()`, so they observe
the final outcome of the inner chain, and both are registered through
`@ndigo/proxy` — either the `interception(...)` container processor or
standalone `interceptMethods(...)`.

## Installation

```bash
pnpm add @ndigo/resilience
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { interceptMethods } from '@ndigo/proxy';
import { retry, exponentialBackoff, RetryInterceptor } from '@ndigo/resilience';

class PushAPI {
    #attempts = 0;

    @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 50, maxMs: 500 }) })
    async push(payload: string): Promise<string> {
        this.#attempts += 1;
        if (this.#attempts < 3) throw new Error('transient');
        return `pushed:${payload}`;
    }
}

const api = interceptMethods(new PushAPI(), [new RetryInterceptor()]);
await api.push('hello'); // succeeds on the third attempt
```

Container entries use the same policies through `interception([...])`; see
[`@ndigo/proxy`](../ndigo-proxy/README.md) for the two registration paths.

## Usage

### Retry

`@retry(spec)` accepts a `RetrySpec`:

- `attempts` — total call attempts including the first; defaults to
  `DEFAULT_RETRY_ATTEMPTS` (3). Must be a positive integer — invalid values
  throw at weave time instead of being clamped.
- `backoff` — a `BackoffPolicy` invoked before each retry with the 1-based
  attempt number; defaults to no delay.
- `retryable(error)` — predicate deciding which failures are retried;
  defaults to every error except `CircuitOpenError`, so retry backoff never
  beats an open circuit.

Retrying re-invokes the join point, so **idempotency is the caller's
contract**: a non-idempotent call must constrain `retryable`. The advice is
async — a `@retry`-advised sync method returns a Promise through a woven proxy
even though its declared type is not, because the annotation is invisible to
the type system. Prefer advising Promise-returning methods. On exhaustion the
final error is re-thrown.

### Backoff policies

```ts
import { fixedBackoff, exponentialBackoff } from '@ndigo/resilience';

fixedBackoff(250); // constant 250 ms for every retry
exponentialBackoff({ initialMs: 100, factor: 2, maxMs: 2_000 }); // 100, 200, 400 … capped
```

`exponentialBackoff` computes `initialMs * factor^(attempt - 1)` (default
factor `2`) and caps the result at `maxMs` when given. A `BackoffPolicy` is a
plain object with `delay(attempt): number` — no scheduling machinery — so
tests can inject deterministic delays.

### Circuit breaking

`@circuitBreaker({ failureThreshold = 5, resetMs = 10_000 })` keeps one
circuit per (target type, entry, method). After `failureThreshold`
consecutive failures the circuit opens and calls fail fast with
`CircuitOpenError` **without executing the method**. Once `resetMs` has
elapsed, the next call becomes a single probe: success closes the circuit,
failure re-opens it with a fresh window. Cells are keyed by the target class
in a `WeakMap`, so two classes sharing a name never share a circuit.
`CircuitBreakerInterceptor({ now })` accepts a time source for deterministic
tests.

### Composing policies

Register the circuit outside retry, so one chain pass counts as one failure
rather than one per retry attempt:

```ts
const api = interceptMethods(client, [new CircuitBreakerInterceptor(), new RetryInterceptor()]);
```

Interceptors run in array order (lower `order` runs closer to the caller), and
`matches()` runs once per managed method at weave time, gating on the method's
annotation.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/resilience build:lib
pnpm --filter @ndigo/resilience test
```

## See Also

- [Guide 35 — Method Interception & Resilience](../../docs/guides/35-method-interception-and-resilience.md)
- [@ndigo/proxy](../ndigo-proxy/README.md) — the annotation, interceptor, and weaving contract these policies run on

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
